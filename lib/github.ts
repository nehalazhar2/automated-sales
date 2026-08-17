import 'server-only';

function repoSlug(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error('GITHUB_REPO not set');
  return repo;
}

function token(): string {
  const t = process.env.GITHUB_TOKEN;
  if (!t) throw new Error('GITHUB_TOKEN not set');
  return t;
}

function branch(): string {
  return process.env.GITHUB_BRANCH || 'main';
}

async function call(
  path: string,
  init: RequestInit = {},
  opts: { allow404?: boolean } = {}
): Promise<unknown> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (res.status === 404 && opts.allow404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.json();
}

/**
 * Creates a new file in the repo via the Contents API. Fails if the path already
 * exists (no `sha` is passed, which the API requires for overwrites) — callers
 * must resolve slug collisions before calling this.
 *
 * `content` is UTF-8 text by default (MDX bodies); pass `encoding: 'base64'`
 * when `content` is already base64-encoded binary data (image uploads).
 */
export async function createContentFile(input: {
  path: string;
  content: string;
  message: string;
  encoding?: 'utf8' | 'base64';
}): Promise<{ commitSha: string }> {
  const base64 =
    input.encoding === 'base64' ? input.content : Buffer.from(input.content, 'utf8').toString('base64');
  const data = (await call(`/repos/${repoSlug()}/contents/${input.path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: input.message,
      content: base64,
      branch: branch(),
    }),
  })) as { commit?: { sha?: string } };
  const commitSha = data.commit?.sha;
  if (!commitSha) throw new Error('GitHub createContentFile: no commit sha returned');
  return { commitSha };
}

/** Returns the file's blob sha, or null if it doesn't exist at `path` on the target branch. */
export async function getContentFile(path: string): Promise<{ sha: string } | null> {
  const data = (await call(
    `/repos/${repoSlug()}/contents/${path}?ref=${branch()}`,
    {},
    { allow404: true }
  )) as { sha?: string } | null;
  return data?.sha ? { sha: data.sha } : null;
}

export async function deleteContentFile(input: {
  path: string;
  sha: string;
  message: string;
}): Promise<{ commitSha: string }> {
  const data = (await call(`/repos/${repoSlug()}/contents/${input.path}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: input.message,
      sha: input.sha,
      branch: branch(),
    }),
  })) as { commit?: { sha?: string } };
  const commitSha = data.commit?.sha;
  if (!commitSha) throw new Error('GitHub deleteContentFile: no commit sha returned');
  return { commitSha };
}
