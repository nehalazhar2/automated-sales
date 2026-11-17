import type { QualAnswers } from './schema'

export type Outcome = 'quickstart' | 'plus' | 'review' | 'bespoke'

export type ReasonCode =
  // bespoke flags
  | 'USERS_11_PLUS' | 'THREE_PLUS_PROCESSES' | 'MULTI_TEAM' | 'PROCESS_DESIGN'
  | 'COMPLEX_WORKFLOWS' | 'COMPLEX_PERMISSIONS' | 'COMPLEX_REPORTING' | 'EXTERNAL_INTEGRATIONS'
  | 'ROWS_5001_PLUS' | 'DATA_NOT_CLEAN' | 'HISTORICAL_DATA' | 'EXCEEDS_PLUS'
  // review flags
  | 'UNKNOWN_CURRENT_SYSTEM' | 'UNKNOWN_PIPEDRIVE_STATUS' | 'UNKNOWN_EXISTING_CONFIGURATION'
  | 'UNKNOWN_USERS_NOW' | 'UNKNOWN_USERS_FUTURE' | 'UNKNOWN_TEAMS' | 'UNKNOWN_SALES_PROCESSES'
  | 'UNKNOWN_PROCESS_AGREED' | 'UNKNOWN_COMPLEXITY' | 'UNKNOWN_MIGRATION' | 'UNKNOWN_RECORDS'
  | 'UNKNOWN_CLEAN_EXPORT' | 'UNKNOWN_WORKFLOWS' | 'UNKNOWN_WORKFLOW_COUNT'
  | 'UNKNOWN_PERMISSIONS' | 'UNKNOWN_REPORTING' | 'UNKNOWN_CONNECTIONS'
  | 'LIVE_PIPEDRIVE' | 'EXTERNAL_CRM_EXPORT' | 'HISTORICAL_DEALS' | 'FUTURE_ROLLOUT'
  | 'TIGHT_DEADLINE' | 'FREE_TEXT' | 'CONFLICTING_ANSWERS' | 'EXISTING_OPPORTUNITY'
  // fits
  | 'FITS_QUICKSTART' | 'FITS_PLUS'

export type RoutingContext = { existingOpportunity?: boolean }
export type RoutingResult = { outcome: Outcome; reasons: ReasonCode[]; explanation: string[] }

/** Pruned answers: conditional keys may be absent (they were hidden). */
type A = Partial<QualAnswers>

const EXPLANATIONS: Record<ReasonCode, string> = {
  USERS_11_PLUS: 'More than 10 people will use Pipedrive initially, which exceeds QuickStart Plus.',
  THREE_PLUS_PROCESSES: 'Three or more distinct sales processes are in scope.',
  MULTI_TEAM: 'Multiple teams or business units are in scope.',
  PROCESS_DESIGN: 'The sales process is not yet agreed and needs design work.',
  COMPLEX_WORKFLOWS: 'Advanced workflows (branching, approvals or external processes) are required.',
  COMPLEX_PERMISSIONS: 'Custom or restricted permissions are required.',
  COMPLEX_REPORTING: 'Attribution, complex metrics or bespoke reporting is required.',
  EXTERNAL_INTEGRATIONS: 'External integrations beyond personal email-calendar sync are required.',
  ROWS_5001_PLUS: 'More than 5,000 rows need to be migrated.',
  DATA_NOT_CLEAN: 'Clean, deduplicated exports cannot be provided, so data cleaning is needed.',
  HISTORICAL_DATA: 'Historical notes, activities, emails, attachments or custom relationships need migrating.',
  EXCEEDS_PLUS: 'No other flags apply, but the requirements exceed the QuickStart Plus allowances.',
  UNKNOWN_CURRENT_SYSTEM: 'Current sales system is unknown ("not sure").',
  UNKNOWN_PIPEDRIVE_STATUS: 'Pipedrive account status is unknown ("not sure").',
  UNKNOWN_EXISTING_CONFIGURATION: 'Existing Pipedrive configuration is unknown ("not sure").',
  UNKNOWN_USERS_NOW: 'Initial user count is unknown ("not sure").',
  UNKNOWN_USERS_FUTURE: 'Expected user count in 90 days is unknown ("not sure").',
  UNKNOWN_TEAMS: 'Number of teams in scope is unknown ("not sure").',
  UNKNOWN_SALES_PROCESSES: 'Number of sales processes is unknown ("not sure").',
  UNKNOWN_PROCESS_AGREED: 'Whether the sales process is agreed is unknown ("not sure").',
  UNKNOWN_COMPLEXITY: 'Whether any process needs branching or approvals is unknown ("not sure").',
  UNKNOWN_MIGRATION: 'Whether data migration is needed is unknown ("not sure").',
  UNKNOWN_RECORDS: 'Number of rows to import is unknown ("not sure").',
  UNKNOWN_CLEAN_EXPORT: 'Whether clean exports are available is unknown ("not sure").',
  UNKNOWN_WORKFLOWS: 'Automation requirement is unknown ("not sure").',
  UNKNOWN_WORKFLOW_COUNT: 'Number of simple workflows is unknown ("not sure").',
  UNKNOWN_PERMISSIONS: 'Permission requirements are unknown ("not sure").',
  UNKNOWN_REPORTING: 'Reporting requirements are unknown ("not sure").',
  UNKNOWN_CONNECTIONS: 'Required external connections are unknown ("not sure").',
  LIVE_PIPEDRIVE: 'An existing live Pipedrive account or non-trivial configuration is in place.',
  EXTERNAL_CRM_EXPORT: 'Data migration from an existing external CRM export is requested.',
  HISTORICAL_DEALS: 'Historical closed deals need migrating.',
  FUTURE_ROLLOUT: 'Expected users within 90 days exceed the QuickStart Plus limit.',
  TIGHT_DEADLINE: 'The requested go-live date is within a week.',
  FREE_TEXT: 'The prospect added free-text notes that need a human read.',
  CONFLICTING_ANSWERS: 'Expected future users is lower than current users, so the answers conflict.',
  EXISTING_OPPORTUNITY: 'An existing opportunity or account matches this prospect; preserve its scope.',
  FITS_QUICKSTART: 'All answers are within QuickStart allowances.',
  FITS_PLUS: 'All answers are within QuickStart Plus allowances but exceed QuickStart.',
}

const BAND: Record<string, number> = { '1_5': 0, '6_10': 1, '11_20': 2, '21_plus': 3 }
const band = (v: string | undefined) => (v === undefined ? undefined : BAND[v])
const CRMS = ['pipedrive', 'hubspot', 'salesforce', 'zoho', 'monday', 'dynamics', 'other_crm', 'multiple']
const HISTORICAL = ['notes', 'activities', 'emails', 'attachments', 'custom_relationships']

const BESPOKE_RULES: [ReasonCode, (a: A) => boolean][] = [
  ['USERS_11_PLUS', (a) => a.users_now === '11_20' || a.users_now === '21_plus'],
  ['THREE_PLUS_PROCESSES', (a) => a.sales_processes === 'three_plus'],
  ['MULTI_TEAM', (a) => a.teams === 'multiple'],
  ['PROCESS_DESIGN', (a) => a.process_agreed === 'needs_design'],
  ['COMPLEX_WORKFLOWS', (a) => a.complexity === 'yes' || a.workflows === 'advanced'],
  ['COMPLEX_PERMISSIONS', (a) => a.permissions === 'custom'],
  ['COMPLEX_REPORTING', (a) => a.reporting === 'bespoke'],
  ['EXTERNAL_INTEGRATIONS', (a) => (a.connections ?? []).some((c) => c !== 'none' && c !== 'personal_sync' && c !== 'not_sure')],
  ['ROWS_5001_PLUS', (a) => a.records === '5001_plus'],
  ['DATA_NOT_CLEAN', (a) => a.clean_export === 'no'],
  ['HISTORICAL_DATA', (a) => (a.data_types ?? []).some((d) => HISTORICAL.includes(d))],
]

const UNKNOWN_KEYS = [
  'current_system', 'pipedrive_status', 'existing_configuration', 'users_now', 'users_future',
  'teams', 'sales_processes', 'process_agreed', 'complexity', 'migration', 'records',
  'clean_export', 'workflows', 'workflow_count', 'permissions', 'reporting',
] as const

const REVIEW_RULES: [ReasonCode, (a: A, ctx: RoutingContext) => boolean][] = [
  ...UNKNOWN_KEYS.map((k): [ReasonCode, (a: A) => boolean] => [
    `UNKNOWN_${k.toUpperCase()}` as ReasonCode,
    (a) => (a as Record<string, unknown>)[k] === 'not_sure',
  ]),
  ['UNKNOWN_CONNECTIONS', (a) => (a.connections ?? []).includes('not_sure')],
  ['LIVE_PIPEDRIVE', (a) =>
    a.pipedrive_status === 'live' ||
    (a.existing_configuration !== undefined &&
      ['active_live', 'automations_integrations', 'complex_unclear'].includes(a.existing_configuration))],
  ['EXTERNAL_CRM_EXPORT', (a) => a.migration === 'yes' && CRMS.includes(a.current_system ?? '')],
  ['HISTORICAL_DEALS', (a) => (a.data_types ?? []).includes('historical_deals')],
  ['FUTURE_ROLLOUT', (a) => (band(a.users_future) ?? 0) >= 2],
  ['TIGHT_DEADLINE', (a) => a.deadline === 'within_week'],
  ['FREE_TEXT', (a) => (a.additional ?? '').trim() !== ''],
  ['CONFLICTING_ANSWERS', (a) => {
    const now = band(a.users_now)
    const future = band(a.users_future)
    return now !== undefined && future !== undefined && future < now
  }],
  ['EXISTING_OPPORTUNITY', (_a, ctx) => ctx.existingOpportunity === true],
]

const rank = (v: string | undefined): number => band(v) ?? 99

function fitsQuickStart(a: A): boolean {
  return (
    a.users_now === '1_5' && a.users_future === '1_5' &&
    a.sales_processes === 'one' &&
    (a.records === undefined || a.records === 'up_to_1000') &&
    (a.workflow_count === undefined || a.workflow_count === '1_3') &&
    a.reporting === 'standard'
  )
}

function fitsPlus(a: A): boolean {
  return (
    rank(a.users_now) <= 1 && rank(a.users_future) <= 1 &&
    (a.sales_processes === 'one' || a.sales_processes === 'two') &&
    (a.records === undefined || a.records === 'up_to_1000' || a.records === '1001_5000') &&
    (a.workflow_count === undefined || a.workflow_count === '1_3' || a.workflow_count === '4_8') &&
    (a.reporting === 'standard' || a.reporting === 'two_dashboards')
  )
}

function result(outcome: Outcome, reasons: ReasonCode[]): RoutingResult {
  return { outcome, reasons, explanation: reasons.map((r) => EXPLANATIONS[r]) }
}

export function routeQualification(a: A, ctx: RoutingContext = {}): RoutingResult {
  const bespoke = BESPOKE_RULES.filter(([, f]) => f(a)).map(([c]) => c)
  const review = REVIEW_RULES.filter(([, f]) => f(a, ctx)).map(([c]) => c)
  if (bespoke.length) return result('bespoke', [...bespoke, ...review])
  if (review.length) return result('review', review)
  if (fitsQuickStart(a)) return result('quickstart', ['FITS_QUICKSTART'])
  if (fitsPlus(a)) return result('plus', ['FITS_PLUS'])
  return result('bespoke', ['EXCEEDS_PLUS'])
}
