import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { put as blobPut, get as blobGet, del as blobDel, list as blobList } from '@vercel/blob'
import type { Project } from './types'

export type Store = {
  get(id: string): Promise<Project | null>
  put(p: Project): Promise<void>
  list(): Promise<Project[]>
  findBySubmissionId(sid: string): Promise<Project | null>
  findByTokenHash(h: string): Promise<Project | null>
}

// Keys end up in file paths / blob pathnames: allow only a conservative charset.
const SAFE_KEY = /^[A-Za-z0-9_-]{1,128}$/
const safe = (k: string) => SAFE_KEY.test(k)

/** Minimal key/value backend; the Store logic is shared by both drivers. */
type Backend = {
  read(key: string): Promise<string | null>
  write(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  listKeys(prefix: string): Promise<string[]>
}

function makeStore(b: Backend): Store {
  const readProject = async (id: string): Promise<Project | null> => {
    if (!safe(id)) return null
    const raw = await b.read(`projects/${id}.json`)
    return raw ? (JSON.parse(raw) as Project) : null
  }
  const lookup = async (kind: 'submission' | 'token', key: string) => {
    if (!safe(key)) return null
    const id = await b.read(`idx/${kind}/${key}`)
    return id ? readProject(id.trim()) : null
  }
  return {
    get: readProject,
    async put(p) {
      if (!safe(p.project_id) || !safe(p.qualification.submission_id)) {
        throw new Error('unsafe project or submission id')
      }
      const prev = await readProject(p.project_id)
      await b.write(`projects/${p.project_id}.json`, JSON.stringify(p, null, 2))
      await b.write(`idx/submission/${p.qualification.submission_id}`, p.project_id)
      const hash = p.onboarding.token_hash
      const prevHash = prev?.onboarding.token_hash
      if (hash && safe(hash)) await b.write(`idx/token/${hash}`, p.project_id)
      if (prevHash && prevHash !== hash && safe(prevHash)) await b.remove(`idx/token/${prevHash}`)
    },
    async list() {
      const keys = await b.listKeys('projects/')
      const all = await Promise.all(
        keys
          .filter((k) => k.endsWith('.json'))
          .map((k) => readProject(path.basename(k, '.json')))
      )
      return all
        .filter((p): p is Project => p !== null)
        .sort((x, y) => (x.created_at < y.created_at ? 1 : x.created_at > y.created_at ? -1 : 0))
    },
    findBySubmissionId: (sid) => lookup('submission', sid),
    findByTokenHash: (h) => lookup('token', h),
  }
}

function fileBackend(root: string): Backend {
  const full = (key: string) => path.join(root, key)
  return {
    async read(key) {
      try {
        return await fs.readFile(full(key), 'utf8')
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
        throw e
      }
    },
    async write(key, value) {
      const target = full(key)
      await fs.mkdir(path.dirname(target), { recursive: true })
      const tmp = `${target}.${randomUUID()}.tmp`
      await fs.writeFile(tmp, value, 'utf8')
      await fs.rename(tmp, target)
    },
    async remove(key) {
      await fs.rm(full(key), { force: true })
    },
    async listKeys(prefix) {
      try {
        const names = await fs.readdir(full(prefix))
        return names.filter((n) => !n.endsWith('.tmp')).map((n) => `${prefix}${n}`)
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') return []
        throw e
      }
    },
  }
}

// @vercel/blob 2.x: put(pathname, body, { access: 'private', allowOverwrite, addRandomSuffix,
// contentType }); get(pathname, { access: 'private', useCache: false }) -> { stream } | null;
// del(pathname); list({ prefix, cursor }) -> { blobs[{pathname}], hasMore, cursor }.
// Token is read from BLOB_READ_WRITE_TOKEN by the SDK.
function blobBackend(): Backend {
  // Preview and production share one Blob store: namespace by environment.
  const ns = `${process.env.VERCEL_ENV ?? 'local'}/`
  const strip = (k: string) => (k.startsWith(ns) ? k.slice(ns.length) : k)
  return {
    async read(key) {
      const res = await blobGet(ns + key, { access: 'private', useCache: false })
      if (!res || res.statusCode !== 200) return null
      return new Response(res.stream).text()
    },
    async write(key, value) {
      await blobPut(ns + key, value, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      })
    },
    async remove(key) {
      await blobDel(ns + key)
    },
    async listKeys(prefix) {
      const keys: string[] = []
      let cursor: string | undefined
      do {
        const page = await blobList({ prefix: ns + prefix, cursor })
        keys.push(...page.blobs.map((x) => strip(x.pathname)))
        cursor = page.hasMore ? page.cursor : undefined
      } while (cursor)
      return keys
    },
  }
}

/** Reads env at call time. Blob when BLOB_READ_WRITE_TOKEN is set, else local files (never on Vercel). */
export function getStore(): Store {
  if (process.env.BLOB_READ_WRITE_TOKEN) return makeStore(blobBackend())
  // Serverless filesystems are ephemeral: without Blob every lead would be lost.
  if (process.env.VERCEL) {
    throw new Error('QuickStart storage not configured: set BLOB_READ_WRITE_TOKEN')
  }
  const root = process.env.QUICKSTART_DATA_DIR ?? path.join(process.cwd(), '.data/quickstart')
  return makeStore(fileBackend(root))
}
