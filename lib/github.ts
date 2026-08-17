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

async function call(path: string, init: RequestInit = {}): Promise<unknown> {
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
 */
export async function createContentFile(input: {
  path: string;
  content: string;
  message: string;
}): Promise<{ commitSha: string }> {
  const data = (await call(`/repos/${repoSlug()}/contents/${input.path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: input.message,
      content: Buffer.from(input.content, 'utf8').toString('base64'),
      branch: branch(),
    }),
  })) as { commit?: { sha?: string } };
  const commitSha = data.commit?.sha;
  if (!commitSha) throw new Error('GitHub createContentFile: no commit sha returned');
  return { commitSha };
}
