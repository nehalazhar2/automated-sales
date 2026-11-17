const SOURCE: Record<string, string> = {
  none: 'none',
  spreadsheet: 'spreadsheet',
  pipedrive: 'pipedrive',
  not_sure: 'not_sure',
}
const BANDS = ['up_to_1000', '1001_5000', '5001_plus', 'not_sure']
const TYPES = ['contacts', 'companies', 'open_opportunities', 'historical_deals']
const YN = ['yes', 'no', 'not_sure']

/** Pre-fill onboarding answers from what the customer already told us when qualifying. */
export function seedFromQualification(q: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (typeof q.migration === 'string' && YN.includes(q.migration)) out.bringing_data = q.migration
  if (typeof q.current_system === 'string') {
    out.source_system = SOURCE[q.current_system] ?? 'other_crm'
  }
  if (typeof q.records === 'string' && BANDS.includes(q.records)) out.import_rows = q.records
  if (Array.isArray(q.data_types)) {
    const t = q.data_types.filter((x): x is string => typeof x === 'string' && TYPES.includes(x))
    if (t.length) out.data_types = t
  }
  if (typeof q.clean_export === 'string' && YN.includes(q.clean_export)) out.clean_file_available = q.clean_export
  return out
}
