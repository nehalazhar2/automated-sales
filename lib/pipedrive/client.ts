function baseUrl(): string {
  const domain = process.env.PIPEDRIVE_DOMAIN;
  if (!domain) throw new Error('PIPEDRIVE_DOMAIN not set');
  return `https://${domain}.pipedrive.com`;
}

function headers(): HeadersInit {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error('PIPEDRIVE_API_TOKEN not set');
  return {
    'x-api-token': token,
    'Content-Type': 'application/json',
  };
}

async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(baseUrl() + path, {
    ...init,
    headers: { ...headers(), ...(init.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pipedrive ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export async function findPersonByEmail(email: string): Promise<number | null> {
  const path = `/api/v2/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`;
  const data = (await call(path)) as { data?: { items?: Array<{ item?: { id?: number } }> } };
  return data.data?.items?.[0]?.item?.id ?? null;
}

export async function getPersonName(id: number): Promise<string | null> {
  const data = (await call(`/api/v2/persons/${id}`)) as { data?: { name?: string } };
  return data.data?.name ?? null;
}

export async function createPerson(input: { name: string; email: string }): Promise<number> {
  const data = (await call('/api/v2/persons', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      emails: [{ value: input.email, primary: true, label: 'work' }],
    }),
  })) as { data?: { id?: number } };
  const id = data.data?.id;
  if (!id) throw new Error('Pipedrive createPerson: no id returned');
  return id;
}

export async function createNote(input: {
  personId: number;
  content: string;
  leadId?: string;
}): Promise<number> {
  const body: Record<string, unknown> = {
    person_id: input.personId,
    content: input.content,
  };
  if (input.leadId) body.lead_id = input.leadId;
  const data = (await call('/api/v1/notes', {
    method: 'POST',
    body: JSON.stringify(body),
  })) as { data?: { id?: number } };
  const id = data.data?.id;
  if (!id) throw new Error('Pipedrive createNote: no id returned');
  return id;
}

export async function updateNote(
  noteId: number,
  content: string,
  opts?: { leadId?: string }
): Promise<void> {
  const body: Record<string, unknown> = { content };
  if (opts?.leadId) body.lead_id = opts.leadId;
  await call(`/api/v1/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function createLead(input: {
  title: string;
  personId: number;
}): Promise<{ id: string; url: string }> {
  const data = (await call('/api/v1/leads', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      person_id: input.personId,
    }),
  })) as { data?: { id?: string } };
  const id = data.data?.id;
  if (!id) throw new Error('Pipedrive createLead: no id returned');
  const domain = process.env.PIPEDRIVE_DOMAIN;
  return { id, url: `https://${domain}.pipedrive.com/leads/inbox/${id}` };
}
