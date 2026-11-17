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
  personId?: number;
  content: string;
  leadId?: string;
  dealId?: number;
}): Promise<number> {
  const body: Record<string, unknown> = { content: input.content };
  if (input.personId) body.person_id = input.personId;
  if (input.leadId) body.lead_id = input.leadId;
  if (input.dealId) body.deal_id = input.dealId;
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

export async function countOpenDealsForPerson(personId: number): Promise<number> {
  const data = (await call(
    `/api/v2/deals?person_id=${encodeURIComponent(String(personId))}&status=open&limit=1`
  )) as { data?: unknown[] };
  return data.data?.length ?? 0;
}

export async function createDeal(input: {
  title: string;
  value: number;
  currency: string;
  personId: number;
  pipelineId?: number;
  stageId?: number;
}): Promise<{ id: number; url: string }> {
  const body: Record<string, unknown> = {
    title: input.title,
    value: input.value,
    currency: input.currency,
    person_id: input.personId,
  };
  if (input.pipelineId) body.pipeline_id = input.pipelineId;
  if (input.stageId) body.stage_id = input.stageId;
  const data = (await call('/api/v2/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  })) as { data?: { id?: number } };
  const id = data.data?.id;
  if (!id) throw new Error('Pipedrive createDeal: no id returned');
  return { id, url: `https://${process.env.PIPEDRIVE_DOMAIN}.pipedrive.com/deal/${id}` };
}

export async function updateDeal(
  id: number,
  input: { title?: string; value?: number; stageId?: number }
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.value !== undefined) body.value = input.value;
  if (input.stageId !== undefined) body.stage_id = input.stageId;
  await call(`/api/v2/deals/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function archiveLead(leadId: string): Promise<void> {
  await call(`/api/v1/leads/${encodeURIComponent(leadId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_archived: true }),
  });
}
