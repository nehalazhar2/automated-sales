import type { QualAnswers } from './schema'

export type QuestionType = 'text' | 'email' | 'url' | 'select' | 'multi' | 'textarea'

export type Question = {
  key: keyof QualAnswers
  step: 1 | 2 | 3 | 4 | 5 | 6
  label: string
  hint?: string
  type: QuestionType
  options?: { value: string; label: string }[]
  required: boolean
  showIf?: (a: Partial<QualAnswers>) => boolean
}

export const STEPS: { n: 1 | 2 | 3 | 4 | 5 | 6; title: string }[] = [
  { n: 1, title: 'About you' },
  { n: 2, title: 'Current setup' },
  { n: 3, title: 'Team & process' },
  { n: 4, title: 'Your data' },
  { n: 5, title: 'Automation, integrations & reporting' },
  { n: 6, title: 'Timing' },
]

const NOT_SURE = { value: 'not_sure', label: 'Not sure' }
const USER_OPTIONS = [
  { value: '1_5', label: '1–5' },
  { value: '6_10', label: '6–10' },
  { value: '11_20', label: '11–20' },
  { value: '21_plus', label: '21+' },
  NOT_SURE,
]

const migrating = (a: Partial<QualAnswers>) => a.migration === 'yes' || a.migration === 'not_sure'

export const QUESTIONS: Question[] = [
  { key: 'name', step: 1, label: 'Your name', type: 'text', required: true },
  { key: 'email', step: 1, label: 'Work email', type: 'email', required: true },
  { key: 'company', step: 1, label: 'Company name', type: 'text', required: true },
  { key: 'website', step: 1, label: 'Website', type: 'url', required: false },
  {
    key: 'referral', step: 1, label: 'Who referred you?', type: 'select', required: true,
    options: [
      { value: 'pipedrive', label: 'Pipedrive' },
      { value: 'other', label: 'Other' },
      { value: 'direct', label: 'Direct' },
    ],
  },
  {
    key: 'referral_detail', step: 1, label: 'Salesperson name or referral code', type: 'text', required: false,
    hint: 'Optional',
  },
  {
    key: 'current_system', step: 2, label: 'What do you currently use to manage sales?', type: 'select', required: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'spreadsheet', label: 'Excel or Google Sheets' },
      { value: 'pipedrive', label: 'Pipedrive' },
      { value: 'hubspot', label: 'HubSpot' },
      { value: 'salesforce', label: 'Salesforce' },
      { value: 'zoho', label: 'Zoho' },
      { value: 'monday', label: 'Monday' },
      { value: 'dynamics', label: 'Dynamics' },
      { value: 'other_crm', label: 'Other CRM' },
      { value: 'multiple', label: 'Multiple systems' },
      NOT_SURE,
    ],
  },
  {
    key: 'pipedrive_status', step: 2, label: 'Where are you with Pipedrive?', type: 'select', required: true,
    options: [
      { value: 'not_started', label: 'Not started' },
      { value: 'trial', label: 'Trial' },
      { value: 'new_paid', label: 'New paid account' },
      { value: 'live', label: 'Live account' },
      NOT_SURE,
    ],
  },
  {
    key: 'existing_configuration', step: 2, label: 'If already live, what is in use?', type: 'select', required: true,
    options: [
      { value: 'basic_test_data', label: 'Basic test data' },
      { value: 'active_live', label: 'Active pipelines and live records' },
      { value: 'automations_integrations', label: 'Automations or integrations' },
      { value: 'complex_unclear', label: 'Complex or unclear' },
      { value: 'not_applicable', label: 'Not applicable' },
      NOT_SURE,
    ],
    showIf: (a) => ['trial', 'new_paid', 'live', 'not_sure'].includes(a.pipedrive_status ?? ''),
  },
  {
    key: 'users_now', step: 3, label: 'How many people will use Pipedrive initially?', type: 'select', required: true,
    options: USER_OPTIONS,
  },
  {
    key: 'users_future', step: 3, label: 'Expected users within the next 90 days?', type: 'select', required: true,
    options: USER_OPTIONS,
  },
  {
    key: 'teams', step: 3, label: 'How many separate teams or business units are in scope?', type: 'select', required: true,
    options: [{ value: 'one', label: 'One' }, { value: 'multiple', label: 'Multiple' }, NOT_SURE],
  },
  {
    key: 'sales_processes', step: 3, label: 'How many distinct sales processes do you run?', type: 'select', required: true,
    options: [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three_plus', label: 'Three or more' },
      NOT_SURE,
    ],
  },
  {
    key: 'process_agreed', step: 3, label: 'Is your sales process already agreed?', type: 'select', required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'mostly', label: 'Mostly' },
      { value: 'needs_design', label: 'Needs design' },
      NOT_SURE,
    ],
  },
  {
    key: 'complexity', step: 3, label: 'Does any sales process require branching, approvals or unusual steps?',
    type: 'select', required: true,
    options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }, NOT_SURE],
  },
  {
    key: 'migration', step: 4, label: 'Do you need existing data migrated?', type: 'select', required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No, fresh start' },
      NOT_SURE,
    ],
  },
  {
    key: 'records', step: 4, label: 'Total rows to import across files', type: 'select', required: true,
    options: [
      { value: 'up_to_1000', label: 'Up to 1,000' },
      { value: '1001_5000', label: '1,001–5,000' },
      { value: '5001_plus', label: '5,001+' },
      NOT_SURE,
    ],
    showIf: migrating,
  },
  {
    key: 'data_types', step: 4, label: 'What information needs migrating?', type: 'multi', required: true,
    hint: 'Select all that apply',
    options: [
      { value: 'contacts', label: 'Contacts' },
      { value: 'companies', label: 'Companies' },
      { value: 'open_opportunities', label: 'Open opportunities' },
      { value: 'historical_deals', label: 'Historical deals' },
      { value: 'notes', label: 'Notes' },
      { value: 'activities', label: 'Activities' },
      { value: 'emails', label: 'Emails' },
      { value: 'attachments', label: 'Attachments' },
      { value: 'custom_relationships', label: 'Custom relationships' },
    ],
    showIf: migrating,
  },
  {
    key: 'clean_export', step: 4, label: 'Can you provide clean, deduplicated CSV/XLSX exports?', type: 'select', required: true,
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, NOT_SURE],
    showIf: migrating,
  },
  {
    key: 'workflows', step: 5, label: 'What automation is required?', type: 'select', required: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'simple', label: 'Simple reminders or follow-up tasks' },
      { value: 'advanced', label: 'Advanced routing, branching, approvals or external processes' },
      NOT_SURE,
    ],
  },
  {
    key: 'workflow_count', step: 5, label: 'Roughly how many simple workflows?', type: 'select', required: true,
    options: [
      { value: '1_3', label: '1–3' },
      { value: '4_8', label: '4–8' },
      { value: '9_plus', label: '9+' },
      NOT_SURE,
    ],
    showIf: (a) => a.workflows === 'simple',
  },
  {
    key: 'connections', step: 5, label: 'What external connections are required?', type: 'multi', required: true,
    hint: 'Select all that apply',
    options: [
      { value: 'none', label: 'None' },
      { value: 'personal_sync', label: 'Personal email-calendar sync only' },
      { value: 'website_forms', label: 'Website forms' },
      { value: 'accounting', label: 'Accounting' },
      { value: 'erp', label: 'ERP' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'telephony', label: 'Telephony' },
      { value: 'other', label: 'Other' },
      NOT_SURE,
    ],
  },
  {
    key: 'permissions', step: 5,
    label: 'Do users require restricted visibility, differentiated permissions or complex roles?',
    type: 'select', required: true,
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'custom', label: 'Custom or restricted' },
      NOT_SURE,
    ],
  },
  {
    key: 'reporting', step: 5, label: 'What reporting is required?', type: 'select', required: true,
    options: [
      { value: 'standard', label: 'Standard sales overview' },
      { value: 'two_dashboards', label: 'Two standard dashboards' },
      { value: 'bespoke', label: 'Attribution, complex metrics or bespoke reporting' },
      NOT_SURE,
    ],
  },
  {
    key: 'deadline', step: 6, label: 'Preferred go-live date', type: 'select', required: true,
    options: [
      { value: 'flexible', label: 'Flexible' },
      { value: 'within_week', label: 'Within a week' },
      { value: 'within_two_weeks', label: 'Within two weeks' },
      { value: 'later', label: 'Later' },
    ],
  },
  {
    key: 'additional', step: 6, label: 'Anything else we should know?', type: 'textarea', required: false,
    hint: 'Optional',
  },
]
