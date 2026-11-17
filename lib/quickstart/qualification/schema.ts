import { z } from 'zod'
import { QUESTIONS } from './questions'

// Option value tuples (snake_case; every "not sure" is 'not_sure').
export const REFERRAL = ['pipedrive', 'other', 'direct'] as const
export const CURRENT_SYSTEM = [
  'none', 'spreadsheet', 'pipedrive', 'hubspot', 'salesforce', 'zoho',
  'monday', 'dynamics', 'other_crm', 'multiple', 'not_sure',
] as const
export const PIPEDRIVE_STATUS = ['not_started', 'trial', 'new_paid', 'live', 'not_sure'] as const
export const EXISTING_CONFIGURATION = [
  'basic_test_data', 'active_live', 'automations_integrations', 'complex_unclear', 'not_applicable', 'not_sure',
] as const
export const USER_BANDS = ['1_5', '6_10', '11_20', '21_plus', 'not_sure'] as const
export const TEAMS = ['one', 'multiple', 'not_sure'] as const
export const SALES_PROCESSES = ['one', 'two', 'three_plus', 'not_sure'] as const
export const PROCESS_AGREED = ['yes', 'mostly', 'needs_design', 'not_sure'] as const
export const COMPLEXITY = ['no', 'yes', 'not_sure'] as const
export const MIGRATION = ['yes', 'no', 'not_sure'] as const
export const RECORDS = ['up_to_1000', '1001_5000', '5001_plus', 'not_sure'] as const
export const DATA_TYPES = [
  'contacts', 'companies', 'open_opportunities', 'historical_deals', 'notes',
  'activities', 'emails', 'attachments', 'custom_relationships',
] as const
export const CLEAN_EXPORT = ['yes', 'no', 'not_sure'] as const
export const WORKFLOWS = ['none', 'simple', 'advanced', 'not_sure'] as const
export const WORKFLOW_COUNT = ['1_3', '4_8', '9_plus', 'not_sure'] as const
export const CONNECTIONS = [
  'none', 'personal_sync', 'website_forms', 'accounting', 'erp',
  'marketing', 'telephony', 'other', 'not_sure',
] as const
export const PERMISSIONS = ['standard', 'custom', 'not_sure'] as const
export const REPORTING = ['standard', 'two_dashboards', 'bespoke', 'not_sure'] as const
export const DEADLINE = ['flexible', 'within_week', 'within_two_weeks', 'later'] as const

export type Referral = (typeof REFERRAL)[number]
export type CurrentSystem = (typeof CURRENT_SYSTEM)[number]
export type PipedriveStatus = (typeof PIPEDRIVE_STATUS)[number]
export type ExistingConfiguration = (typeof EXISTING_CONFIGURATION)[number]
export type UserBand = (typeof USER_BANDS)[number]
export type Teams = (typeof TEAMS)[number]
export type SalesProcesses = (typeof SALES_PROCESSES)[number]
export type ProcessAgreed = (typeof PROCESS_AGREED)[number]
export type Complexity = (typeof COMPLEXITY)[number]
export type Migration = (typeof MIGRATION)[number]
export type Records = (typeof RECORDS)[number]
export type DataType = (typeof DATA_TYPES)[number]
export type CleanExport = (typeof CLEAN_EXPORT)[number]
export type Workflows = (typeof WORKFLOWS)[number]
export type WorkflowCount = (typeof WORKFLOW_COUNT)[number]
export type Connection = (typeof CONNECTIONS)[number]
export type Permissions = (typeof PERMISSIONS)[number]
export type Reporting = (typeof REPORTING)[number]
export type Deadline = (typeof DEADLINE)[number]

const text = (max = 200) => z.string().trim().min(1).max(max)
// Trim; blank -> ''; add https:// when no scheme; accept only http(s) URLs.
const websiteSchema = z
  .string()
  .max(300)
  .transform((raw) => {
    const v = raw.trim()
    if (v === '') return ''
    if (/^https?:\/\//i.test(v)) return v
    // Other scheme (e.g. javascript:, ftp:) is left as-is so it is rejected below.
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(v)) return v
    return `https://${v}`
  })
  .refine((v) => {
    if (v === '') return true
    try {
      const u = new URL(v)
      return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.')
    } catch {
      return false
    }
  }, 'Enter a valid website address')

const optionalText = (max: number) => z.string().trim().max(max).optional()

export const qualAnswersSchema = z.object({
  name: text(120),
  email: z.string().trim().toLowerCase().email().max(254),
  company: text(200),
  website: websiteSchema.optional(),
  referral: z.enum(REFERRAL),
  referral_detail: optionalText(200),
  current_system: z.enum(CURRENT_SYSTEM),
  pipedrive_status: z.enum(PIPEDRIVE_STATUS),
  existing_configuration: z.enum(EXISTING_CONFIGURATION).optional(),
  users_now: z.enum(USER_BANDS),
  users_future: z.enum(USER_BANDS),
  teams: z.enum(TEAMS),
  sales_processes: z.enum(SALES_PROCESSES),
  process_agreed: z.enum(PROCESS_AGREED),
  complexity: z.enum(COMPLEXITY),
  migration: z.enum(MIGRATION),
  records: z.enum(RECORDS).optional(),
  data_types: z.array(z.enum(DATA_TYPES)).max(DATA_TYPES.length).optional(),
  clean_export: z.enum(CLEAN_EXPORT).optional(),
  workflows: z.enum(WORKFLOWS),
  workflow_count: z.enum(WORKFLOW_COUNT).optional(),
  connections: z.array(z.enum(CONNECTIONS)).max(CONNECTIONS.length),
  permissions: z.enum(PERMISSIONS),
  reporting: z.enum(REPORTING),
  deadline: z.enum(DEADLINE),
  additional: optionalText(2000),
})

export type QualAnswers = z.infer<typeof qualAnswersSchema>

/** Remove answers whose question is not currently visible (stale hidden answers). */
export function pruneHidden(a: Partial<QualAnswers>): Partial<QualAnswers> {
  const out: Record<string, unknown> = { ...a }
  for (const q of QUESTIONS) {
    if (q.showIf && !q.showIf(a)) delete out[q.key]
  }
  return out as Partial<QualAnswers>
}

function isMissing(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

/** Map of key -> message for required questions that are visible but unanswered. */
export function validateVisibleRequired(a: Partial<QualAnswers>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const q of QUESTIONS) {
    if (!q.required) continue
    if (q.showIf && !q.showIf(a)) continue
    if (isMissing((a as Record<string, unknown>)[q.key])) {
      errors[q.key] = q.type === 'multi' ? 'Please select at least one option' : 'This field is required'
    }
  }
  return errors
}

export const qualSubmitSchema = z.object({
  submissionId: z.string().uuid(),
  answers: qualAnswersSchema,
  honeypot: z.string().max(0),
}).superRefine((v, ctx) => {
  const errs = validateVisibleRequired(v.answers)
  for (const [key, message] of Object.entries(errs)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['answers', key], message })
  }
}).transform((v) => ({ ...v, answers: pruneHidden(v.answers) as QualAnswers }))

export type QualSubmit = z.infer<typeof qualSubmitSchema>
