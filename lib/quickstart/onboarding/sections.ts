export type FieldType =
  | 'text' | 'email' | 'url' | 'textarea' | 'select' | 'multi'
  | 'number' | 'date' | 'users' | 'pipelines'

export type OnbOption = { value: string; label: string }

export type ShowIf =
  | { key: string; equals: string }
  | { key: string; notEquals: string }
  | { key: string; in: string[] }
  | { key: string; nonEmpty: true }

export type OnbField = {
  key: string
  label: string
  hint?: string
  type: FieldType
  options?: OnbOption[]
  required?: boolean
  allowNotSure?: boolean
  showIf?: ShowIf
  /** Click-to-add suggestions (pipelines: step names). */
  suggestions?: string[]
}

export type OnbSection = {
  id: string
  title: string
  intro?: string
  notes?: string[]
  fields: OnbField[]
}

export type UserRow = { name: string; email: string; role: 'admin' | 'regular'; team?: string }
export type PipelineRow = { name: string; stages: string[] }

export const NOT_SURE = 'not_sure'

const o = (...pairs: [string, string][]): OnbOption[] => pairs.map(([value, label]) => ({ value, label }))
const yn = o(['yes', 'Yes'], ['no', 'No'])

export const SECTIONS: OnbSection[] = [
  {
    id: 'business',
    title: 'Business & account',
    intro: 'A few details about your business so we can set Pipedrive up around how you actually sell.',
    notes: ['Please do not share passwords or API keys anywhere in this form. We will never ask for them.'],
    fields: [
      { key: 'business_description', label: 'What does your business do?', hint: 'A few lines: what you sell (products, services, subscriptions), your sector, and whether you sell to businesses, consumers or both.', type: 'textarea', required: true, allowNotSure: true },
      { key: 'currency', label: 'Which currency do you sell in?', type: 'select', options: o(['gbp', 'GBP'], ['eur', 'EUR'], ['usd', 'USD'], ['aed', 'AED'], ['other', 'Other']), allowNotSure: true },
      { key: 'deal_profile', label: 'What is a typical sale worth, and how long does it take from first contact to close?', hint: 'For example "about £3,000, usually 4-6 weeks".', type: 'text', allowNotSure: true },
      { key: 'challenges', label: 'What should this project fix or achieve?', hint: 'Your biggest sales headaches and what a great result would look like.', type: 'textarea', allowNotSure: true },
      { key: 'pipedrive_plan', label: 'Which Pipedrive plan are you on?', type: 'select', options: o(['essential', 'Essential'], ['advanced', 'Advanced'], ['growth', 'Growth'], ['premium', 'Premium'], ['ultimate', 'Ultimate'], ['no_account', 'I do not have an account yet']), allowNotSure: true },
      { key: 'pipedrive_account_url', label: 'Your Pipedrive account address', hint: 'It looks like yourcompany.pipedrive.com.', type: 'url', allowNotSure: true, showIf: { key: 'pipedrive_plan', in: ['essential', 'advanced', 'growth', 'premium', 'ultimate', 'not_sure'] } },
      { key: 'email_provider', label: 'Which email and calendar do you use?', type: 'select', options: o(['google', 'Google Workspace'], ['microsoft', 'Microsoft 365'], ['other', 'Other']), allowNotSure: true },
      { key: 'primary_admin_name', label: 'Who will be the main Pipedrive administrator?', hint: 'Full name.', type: 'text', required: true, allowNotSure: true },
      { key: 'primary_admin_email', label: 'Their work email', type: 'email', required: true, allowNotSure: true },
      { key: 'approver_same', label: 'Is the same person signing off on our work?', type: 'select', options: yn, allowNotSure: true },
      { key: 'approver_name', label: 'Who signs off on the setup?', type: 'text', allowNotSure: true, showIf: { key: 'approver_same', equals: 'no' } },
      { key: 'approver_email', label: 'Their work email', type: 'email', allowNotSure: true, showIf: { key: 'approver_same', equals: 'no' } },
    ],
  },
  {
    id: 'leads',
    title: 'Lead management',
    intro: 'How enquiries reach you and what happens to them.',
    fields: [
      { key: 'lead_channels', label: 'Where do your enquiries come from?', type: 'multi', required: true, allowNotSure: true, options: o(['website', 'Website'], ['email', 'Email'], ['phone', 'Phone'], ['referral', 'Referrals'], ['outbound', 'Our own outreach'], ['ads', 'Advertising'], ['events', 'Events'], ['social', 'Social media']) },
      { key: 'lead_qualified_first', label: 'Do you check whether an enquiry is a good fit before treating it as a real opportunity?', type: 'select', options: o(['yes', 'Yes, always'], ['sometimes', 'Sometimes'], ['no', 'No']), allowNotSure: true },
      { key: 'qualification_criteria', label: 'What do you check?', type: 'multi', allowNotSure: true, showIf: { key: 'lead_qualified_first', notEquals: 'no' }, options: o(['budget', 'Budget'], ['need', 'A clear need'], ['timeframe', 'Timeframe'], ['decision_maker', 'Speaking to the decision maker'], ['location', 'Location']) },
      { key: 'lead_responder', label: 'Who usually responds to new enquiries?', hint: "Name or role, e.g. 'Sarah (sales manager)' or 'whoever is free'", type: 'text', allowNotSure: true },
      { key: 'lead_allocation', label: 'How do you decide who handles an enquiry?', type: 'select', options: o(['one_person', 'One person handles them all'], ['round_robin', 'Shared out in turn'], ['territory_product', 'By area or product'], ['manual', 'Decided case by case']), allowNotSure: true },
      { key: 'response_target', label: 'How quickly do you aim to respond?', type: 'select', options: o(['1h', 'Within an hour'], ['same_day', 'Same day'], ['next_day', 'Next working day'], ['none', 'No set target']), allowNotSure: true },
      { key: 'unready_leads', label: 'What happens to enquiries that are not ready or not a fit?', type: 'select', options: o(['nurture', 'Keep and follow up later'], ['close', 'Close them with a reason'], ['delete', 'Delete them']), allowNotSure: true },
      { key: 'attribution_needed', label: 'Do you need to track which source each sale came from?', type: 'select', options: yn, allowNotSure: true },
    ],
  },
  {
    id: 'sales_process',
    title: 'Sales process',
    intro: 'The steps a sale goes through, in order. Add the suggested steps that fit, or type your own.',
    fields: [
      { key: 'pipelines', label: 'Your sales process', hint: 'Name your process and list its steps in order. Tap a suggested step to add it, or type your own.', type: 'pipelines', required: true, allowNotSure: true, suggestions: ['Enquiry', 'Qualification', 'Discovery', 'Demo', 'Survey', 'Quote', 'Approval', 'Negotiation', 'Contract', 'Deposit'] },
      { key: 'stage_criteria', label: 'Anything that must be true before a deal moves to the next step?', hint: 'Optional. A few examples are fine.', type: 'textarea', allowNotSure: true, showIf: { key: 'pipelines', nonEmpty: true } },
      { key: 'deal_value_definition', label: 'What counts as the value of a sale?', type: 'select', options: o(['total', 'Total contract value'], ['first_year', 'First year value'], ['monthly', 'Monthly recurring amount'], ['other', 'Something else']), allowNotSure: true },
      { key: 'expected_close_date', label: 'Do you want to record an expected close date on each sale?', type: 'select', options: yn, allowNotSure: true },
      { key: 'won_criteria', label: 'When do you count a sale as won?', type: 'textarea', required: true, allowNotSure: true },
      { key: 'lost_reasons', label: 'Why do you lose sales?', type: 'multi', allowNotSure: true, options: o(['price', 'Price'], ['competitor', 'Chose a competitor'], ['no_budget', 'No budget'], ['no_response', 'Stopped replying'], ['timing', 'Bad timing'], ['not_a_fit', 'Not a good fit'], ['other', 'Other']) },
      { key: 'after_sale', label: 'What happens after a sale is won?', hint: 'Including repeat or follow-up sales.', type: 'multi', allowNotSure: true, options: o(['handover', 'Handed to a delivery team'], ['onboarding', 'Customer onboarding'], ['renewal', 'Renewal follow-up'], ['upsell', 'Repeat or follow-up sales'], ['nothing', 'Nothing in particular']) },
    ],
  },
  {
    id: 'customer_info',
    title: 'Customer information',
    intro: 'Tell us what you want to know about your customers. We will work out how to store it.',
    fields: [
      { key: 'customer_fields', label: 'What do you want to record about customers?', type: 'multi', required: true, allowNotSure: true, options: o(['customer_type', 'Customer type'], ['industry', 'Industry'], ['size', 'Company size'], ['geography', 'Location'], ['source', 'Where they came from'], ['interest', 'Product or service of interest'], ['tier', 'Account tier'], ['status', 'Prospect or customer'], ['decision_maker', 'Decision maker'], ['renewal_date', 'Renewal date']) },
      { key: 'multiple_contacts', label: 'Do you usually deal with several people at one customer?', type: 'select', options: yn, allowNotSure: true },
      { key: 'multiple_products', label: 'Can one customer buy several different products or services?', type: 'select', options: yn, allowNotSure: true },
      { key: 'customer_extra_fields', label: 'Anything else you would like to record?', hint: 'One item per line. Please do not paste real customer details.', type: 'textarea', allowNotSure: true },
    ],
  },
  {
    id: 'team',
    title: 'Team & users',
    intro: 'Who will use Pipedrive. We will not invite anyone until the setup stage.',
    fields: [
      { key: 'team_users', label: 'Your team', hint: 'Name, work email and whether they need administrator access.', type: 'users', required: true, allowNotSure: true },
      { key: 'ownership_rule', label: 'How is ownership of a customer or sale decided?', type: 'select', options: o(['creator', 'Whoever creates it'], ['assigned', 'Assigned by a manager'], ['territory', 'By area'], ['product', 'By product'], ['shared', 'Shared between people']), allowNotSure: true },
      { key: 'access_restrictions', label: 'Should some people see only their own records?', type: 'select', options: yn, allowNotSure: true },
      { key: 'handover_team', label: 'Who manages the sales team, and which team takes over after a sale?', type: 'text', allowNotSure: true },
    ],
  },
  {
    id: 'automation',
    title: 'Follow-ups & automation',
    intro: 'Simple reminders keep sales moving.',
    fields: [
      { key: 'activity_types', label: 'What kinds of follow-up do you do?', type: 'multi', allowNotSure: true, options: o(['call', 'Call'], ['meeting', 'Meeting'], ['email', 'Email'], ['task', 'Task'], ['deadline', 'Deadline'], ['lunch', 'Lunch'], ['site_visit', 'Site visit'], ['other', 'Other']) },
      { key: 'followup_frequency', label: 'How often should you follow up with an open opportunity?', type: 'select', options: o(['2_days', 'Every couple of days'], ['weekly', 'Weekly'], ['fortnightly', 'Every two weeks'], ['monthly', 'Monthly']), allowNotSure: true },
      { key: 'next_activity_required', label: 'Should every open opportunity always have a next step planned?', type: 'select', options: o(['yes', 'Yes'], ['yes_flag', 'Yes, and flag enquiries left untouched'], ['no', 'No']), allowNotSure: true },
      { key: 'automation_recipes', label: 'Which of these reminders would help?', type: 'multi', required: true, allowNotSure: true, options: o(['new_deal_task', 'Create a task when a new sale is added'], ['stage_entry_task', 'Create a task when a sale reaches a certain step'], ['won_handover_task', 'Create a handover task when a sale is won'], ['none', 'None of these']) },
      { key: 'recipe_details', label: 'For the ones you chose: who should get the task, and how soon should it be due?', type: 'textarea', allowNotSure: true, showIf: { key: 'automation_recipes', in: ['new_deal_task', 'stage_entry_task', 'won_handover_task'] } },
      { key: 'other_automation', label: 'Anything more advanced you would like automated?', hint: 'We will review this with you. More advanced automation may be outside the package.', type: 'textarea' },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting',
    intro: 'Tell us the questions you want answered; we will turn them into reports.',
    fields: [
      { key: 'reporting_needs', label: 'What do you want to be able to see?', type: 'multi', required: true, allowNotSure: true, options: o(['forecast', 'Forecast and pipeline value'], ['won_lost', 'Won and lost sales'], ['conversion', 'Conversion between steps'], ['by_owner', 'Sales by person'], ['by_stage', 'Sales by step'], ['followup_compliance', 'Whether follow-ups are being done'], ['activity_volumes', 'Calls, emails and meetings'], ['lead_source', 'Which sources bring the most sales'], ['sales_cycle', 'How long sales take'], ['targets', 'Progress against sales targets'], ['custom_other', 'Something else, tailored to us']) },
      { key: 'report_audience', label: 'Who will look at these reports, and how often?', hint: 'And how you want to slice it: by person, team, source, product.', type: 'text', allowNotSure: true },
    ],
  },
  {
    id: 'data_golive',
    title: 'Data & go-live',
    intro: 'If you have existing records to bring across, and how you would like to launch.',
    notes: [
      'Please do NOT upload or paste customer data into this form. We will send you secure transfer instructions separately.',
    ],
    fields: [
      { key: 'bringing_data', label: 'Do you want to bring existing customer records into Pipedrive?', type: 'select', required: true, allowNotSure: true, options: o(['yes', 'Yes'], ['no', 'No, fresh start']) },
      { key: 'source_system', label: 'Where are your records today?', type: 'select', allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] }, options: o(['spreadsheet', 'Spreadsheet'], ['other_crm', 'Another CRM'], ['pipedrive', 'Already in Pipedrive'], ['none', 'Nowhere yet']) },
      { key: 'clean_file_available', label: 'Can you export them to a tidy CSV or Excel file?', type: 'select', options: yn, allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] } },
      { key: 'import_rows', label: 'Roughly how many records?', type: 'select', allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] }, options: o(['up_to_1000', 'Up to 1,000'], ['1001_5000', '1,001 - 5,000'], ['5001_plus', 'More than 5,000']) },
      { key: 'import_batches', label: 'Would the records arrive in one go or in stages?', type: 'select', allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] }, options: o(['one', 'All in one go'], ['two', 'Two batches'], ['three_plus', 'Three or more batches']) },
      { key: 'data_types', label: 'What needs to come across?', type: 'multi', allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] }, options: o(['contacts', 'People'], ['companies', 'Companies'], ['open_opportunities', 'Open sales'], ['historical_deals', 'Past sales (history matters to us)']) },
      { key: 'import_details', label: 'Anything we should know about the import?', hint: 'For example matching people to companies, who owns which records, and which step imported sales should start in.', type: 'textarea', allowNotSure: true, showIf: { key: 'bringing_data', in: ['yes', 'not_sure'] } },
      { key: 'training_focus', label: 'What should training focus on?', type: 'multi', allowNotSure: true, options: o(['daily_use', 'Day-to-day use'], ['pipeline', 'Managing the pipeline'], ['reports', 'Reports'], ['admin', 'Administration']) },
      { key: 'launch_planning', label: 'Launch planning', hint: 'When you would like to be up and running, your timezone, when suits for training, who will attend, and whether your Pipedrive account and admin access are ready.', type: 'textarea', allowNotSure: true },
    ],
  },
]

export const ALL_FIELDS: OnbField[] = SECTIONS.flatMap((s) => s.fields)
export const FIELD_BY_KEY: Record<string, OnbField> = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f]))

const has = (v: unknown, x: string) => (Array.isArray(v) ? v.includes(x) : v === x)

export function isFieldVisible(field: OnbField, answers: Record<string, unknown>): boolean {
  const c = field.showIf
  if (!c) return true
  const v = answers[c.key]
  if ('equals' in c) return has(v, c.equals)
  if ('notEquals' in c) return !has(v, c.notEquals)
  if ('in' in c) return c.in.some((x) => has(v, x))
  if (typeof v === 'string') return v.trim() !== '' && v !== NOT_SURE
  return Array.isArray(v) && v.length > 0
}

/** Drop values of fields that are currently hidden (stale conditional answers). */
export function pruneHidden(answers: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(answers)) {
    const f = FIELD_BY_KEY[k]
    if (f && isFieldVisible(f, answers)) out[k] = v
  }
  return out
}
