export type FieldType =
  | 'text' | 'email' | 'url' | 'textarea' | 'select' | 'multi'
  | 'number' | 'date' | 'users' | 'pipelines'

export type OnbOption = { value: string; label: string }

export type OnbField = {
  key: string
  label: string
  hint?: string
  type: FieldType
  options?: OnbOption[]
  required?: boolean
  allowNotSure?: boolean
  showIf?: { key: string; equals: string }
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
      { key: 'company_name', label: 'Company name', type: 'text' },
      { key: 'website', label: 'Company website', type: 'url' },
      { key: 'business_description', label: 'What does your business do?', hint: 'A sentence or two is plenty.', type: 'textarea', required: true, allowNotSure: true },
      { key: 'sector', label: 'Which sector or industry are you in?', type: 'text', allowNotSure: true },
      { key: 'customer_type', label: 'Who do you sell to?', type: 'select', options: o(['b2b', 'Other businesses'], ['b2c', 'Individual consumers'], ['both', 'Both']), allowNotSure: true },
      { key: 'offerings', label: 'What do you sell?', hint: 'Products, services or subscriptions.', type: 'textarea', allowNotSure: true },
      { key: 'currency', label: 'Which currency do you sell in?', type: 'select', options: o(['gbp', 'GBP'], ['eur', 'EUR'], ['usd', 'USD'], ['other', 'Other']), allowNotSure: true },
      { key: 'timezone', label: 'Which timezone is your team mostly in?', hint: 'For example "UK time" or "Europe/London".', type: 'text', allowNotSure: true },
      { key: 'typical_deal_value', label: 'What is a typical sale worth?', type: 'select', options: o(['under_1k', 'Under £1,000'], ['1k_5k', '£1,000 - £5,000'], ['5k_25k', '£5,000 - £25,000'], ['over_25k', 'Over £25,000']), allowNotSure: true },
      { key: 'sales_cycle', label: 'How long does a sale usually take, from first contact to close?', type: 'select', options: o(['days', 'A few days'], ['weeks', 'A few weeks'], ['months', 'A few months'], ['long', 'Longer than six months']), allowNotSure: true },
      { key: 'monthly_enquiries', label: 'Roughly how many new enquiries do you get each month?', type: 'select', options: o(['under_20', 'Fewer than 20'], ['20_100', '20 - 100'], ['100_500', '100 - 500'], ['over_500', 'More than 500']), allowNotSure: true },
      { key: 'repeat_sales', label: 'Do customers buy from you more than once?', type: 'select', options: o(['rarely', 'Rarely'], ['sometimes', 'Sometimes'], ['often', 'Often']), allowNotSure: true },
      { key: 'challenges', label: 'What are your biggest sales challenges today?', type: 'textarea', allowNotSure: true },
      { key: 'desired_outcome', label: 'What would a great result from this project look like?', type: 'textarea', allowNotSure: true },
      { key: 'pipedrive_account_url', label: 'Your Pipedrive account address, if you have one', hint: 'It looks like yourcompany.pipedrive.com.', type: 'url', allowNotSure: true },
      { key: 'pipedrive_plan', label: 'Which Pipedrive plan are you on?', type: 'select', options: o(['essential', 'Essential'], ['advanced', 'Advanced'], ['growth', 'Growth'], ['premium', 'Premium'], ['ultimate', 'Ultimate'], ['no_account', 'I do not have an account yet']), allowNotSure: true },
      { key: 'primary_admin_name', label: 'Who will be the main Pipedrive administrator?', hint: 'Full name.', type: 'text', required: true, allowNotSure: true },
      { key: 'primary_admin_email', label: 'Their work email', type: 'email', required: true, allowNotSure: true },
      { key: 'approver_name', label: 'Who signs off on the setup?', hint: 'Name and email of the person who approves our work, if different.', type: 'text', allowNotSure: true },
      { key: 'email_provider', label: 'Which email and calendar do you use?', type: 'select', options: o(['google', 'Google (Gmail / Google Calendar)'], ['microsoft', 'Microsoft (Outlook / 365)'], ['other', 'Something else']), allowNotSure: true },
      { key: 'preferred_launch_date', label: 'When would you like to be up and running?', type: 'date', allowNotSure: true },
    ],
  },
  {
    id: 'leads',
    title: 'Lead management',
    intro: 'How enquiries reach you and what happens to them.',
    fields: [
      { key: 'lead_channels', label: 'Where do your enquiries come from?', type: 'multi', required: true, allowNotSure: true, options: o(['website', 'Website'], ['email', 'Email'], ['phone', 'Phone'], ['referral', 'Referrals'], ['outbound', 'Our own outreach'], ['ads', 'Advertising'], ['events', 'Events'], ['social', 'Social media']) },
      { key: 'lead_responder', label: 'Who responds to new enquiries?', type: 'text', allowNotSure: true },
      { key: 'lead_qualified_first', label: 'Do you check whether an enquiry is a good fit before treating it as a real opportunity?', type: 'select', options: o(['yes', 'Yes, always'], ['sometimes', 'Sometimes'], ['no', 'No']), allowNotSure: true },
      { key: 'qualification_criteria', label: 'What do you check?', type: 'multi', allowNotSure: true, options: o(['budget', 'Budget'], ['need', 'A clear need'], ['timeframe', 'Timeframe'], ['decision_maker', 'Speaking to the decision maker'], ['location', 'Location']) },
      { key: 'lead_allocation', label: 'How do you decide who handles an enquiry?', type: 'select', options: o(['one_person', 'One person handles them all'], ['round_robin', 'Shared out in turn'], ['territory_product', 'By area or product'], ['manual', 'Decided case by case']), allowNotSure: true },
      { key: 'response_target', label: 'How quickly do you aim to respond?', type: 'select', options: o(['1h', 'Within an hour'], ['same_day', 'Same day'], ['next_day', 'Next working day'], ['none', 'No set target']), allowNotSure: true },
      { key: 'unready_leads', label: 'What happens to enquiries that are not ready or not a fit?', type: 'select', options: o(['nurture', 'Keep and follow up later'], ['close', 'Close them with a reason'], ['delete', 'Delete them']), allowNotSure: true },
      { key: 'attribution_needed', label: 'Do you need to track which source each sale came from?', type: 'select', options: yn, allowNotSure: true },
    ],
  },
  {
    id: 'sales_process',
    title: 'Sales process',
    intro: 'The steps a sale goes through, in order. If you are unsure, tick the steps that sound right.',
    fields: [
      { key: 'pipelines', label: 'Your sales process(es)', hint: 'Give each process a name and list its steps in order, for example Enquiry, Discovery, Quote, Negotiation.', type: 'pipelines', required: true, allowNotSure: true },
      { key: 'stage_criteria', label: 'What has to happen to move a sale to the next step?', hint: 'Optional. A few examples are fine.', type: 'textarea', allowNotSure: true },
      { key: 'deal_value_definition', label: 'What counts as the value of a sale?', type: 'select', options: o(['total', 'Total contract value'], ['first_year', 'First year value'], ['monthly', 'Monthly recurring amount'], ['other', 'Something else']), allowNotSure: true },
      { key: 'expected_close_date', label: 'Do you want to record an expected close date on each sale?', type: 'select', options: yn, allowNotSure: true },
      { key: 'separate_processes', label: 'Do different types of sale follow different processes?', type: 'select', options: o(['one', 'No, one process'], ['two', 'Yes, two'], ['more', 'Yes, three or more']), allowNotSure: true },
      { key: 'won_criteria', label: 'When do you count a sale as won?', type: 'textarea', required: true, allowNotSure: true },
      { key: 'lost_reasons', label: 'Why do you lose sales?', type: 'multi', allowNotSure: true, options: o(['price', 'Price'], ['competitor', 'Chose a competitor'], ['no_budget', 'No budget'], ['no_response', 'Stopped replying'], ['timing', 'Bad timing'], ['not_a_fit', 'Not a good fit'], ['other', 'Other']) },
      { key: 'after_sale', label: 'What happens after a sale is won?', type: 'multi', allowNotSure: true, options: o(['handover', 'Handed to a delivery team'], ['onboarding', 'Customer onboarding'], ['renewal', 'Renewal follow-up'], ['upsell', 'Follow-up sales'], ['nothing', 'Nothing in particular']) },
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
      { key: 'customer_extra_fields', label: 'Anything else you would like to record?', hint: 'One item per line.', type: 'textarea', allowNotSure: true },
      { key: 'customer_notes', label: 'Examples or notes', hint: 'Optional. Please do not paste real customer details.', type: 'textarea' },
    ],
  },
  {
    id: 'team',
    title: 'Team & users',
    intro: 'Who will use Pipedrive. We will not invite anyone until the setup stage.',
    fields: [
      { key: 'team_users', label: 'Your team', hint: 'Name, work email and whether they need administrator access.', type: 'users', required: true, allowNotSure: true },
      { key: 'ownership_rule', label: 'How is ownership of a customer or sale decided?', type: 'select', options: o(['creator', 'Whoever creates it'], ['assigned', 'Assigned by a manager'], ['shared', 'Shared between people']), allowNotSure: true },
      { key: 'assignment_rule', label: 'Is work split by area or product?', type: 'select', options: o(['none', 'No'], ['territory', 'By area'], ['product', 'By product']), allowNotSure: true },
      { key: 'access_restrictions', label: 'Should some people see only their own records?', type: 'select', options: yn, allowNotSure: true },
      { key: 'sales_manager', label: 'Who manages the sales team?', type: 'text', allowNotSure: true },
      { key: 'sales_targets', label: 'Do people have sales targets?', type: 'select', options: yn, allowNotSure: true },
      { key: 'handover_team', label: 'Which team takes over after a sale?', type: 'text', allowNotSure: true },
    ],
  },
  {
    id: 'automation',
    title: 'Follow-ups & automation',
    intro: 'Simple reminders keep sales moving.',
    fields: [
      { key: 'activity_types', label: 'What kinds of follow-up do you do?', type: 'multi', allowNotSure: true, options: o(['call', 'Calls'], ['email', 'Emails'], ['meeting', 'Meetings'], ['demo', 'Demos'], ['task', 'General tasks']) },
      { key: 'followup_frequency', label: 'How often should you follow up with an open opportunity?', type: 'select', options: o(['2_days', 'Every couple of days'], ['weekly', 'Weekly'], ['fortnightly', 'Every two weeks'], ['monthly', 'Monthly']), allowNotSure: true },
      { key: 'next_activity_required', label: 'Should every open opportunity always have a next step planned?', type: 'select', options: yn, allowNotSure: true },
      { key: 'unattended_leads', label: 'Do you want a reminder when an enquiry has not been touched?', type: 'select', options: yn, allowNotSure: true },
      { key: 'automation_recipes', label: 'Which of these reminders would help?', type: 'multi', required: true, allowNotSure: true, options: o(['new_deal_task', 'Create a task when a new sale is added'], ['stage_entry_task', 'Create a task when a sale reaches a certain step'], ['won_handover_task', 'Create a handover task when a sale is won'], ['none', 'None of these']) },
      { key: 'recipe_details', label: 'For the ones you chose: who should get the task, and how soon should it be due?', type: 'textarea', allowNotSure: true },
      { key: 'other_automation', label: 'Anything more advanced you would like automated?', hint: 'We will review this with you. More advanced automation may be outside the package.', type: 'textarea' },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting',
    intro: 'Tell us the questions you want answered; we will turn them into reports.',
    fields: [
      { key: 'reporting_needs', label: 'What do you want to be able to see?', type: 'multi', required: true, allowNotSure: true, options: o(['forecast', 'Forecast and pipeline value'], ['won_lost', 'Won and lost sales'], ['conversion', 'Conversion between steps'], ['by_owner', 'Sales by person'], ['by_stage', 'Sales by step'], ['followup_compliance', 'Whether follow-ups are being done'], ['activity_volumes', 'Calls, emails and meetings'], ['lead_source', 'Which sources bring the most sales'], ['sales_cycle', 'How long sales take'], ['custom_other', 'Something else, tailored to us']) },
      { key: 'report_audience', label: 'Who will look at these reports?', type: 'text', allowNotSure: true },
      { key: 'review_cadence', label: 'How often will you review them?', type: 'select', options: o(['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']), allowNotSure: true },
      { key: 'report_filters', label: 'How do you want to slice the numbers?', type: 'multi', allowNotSure: true, options: o(['owner', 'By person'], ['team', 'By team'], ['date', 'By date'], ['source', 'By source'], ['product', 'By product']) },
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
      { key: 'source_system', label: 'Where are your customer records today?', type: 'select', required: true, allowNotSure: true, options: o(['spreadsheet', 'Spreadsheet'], ['other_crm', 'Another CRM'], ['pipedrive', 'Already in Pipedrive'], ['none', 'Nowhere, starting fresh']) },
      { key: 'clean_file_available', label: 'Can you export them to a tidy CSV or Excel file?', type: 'select', options: yn, allowNotSure: true },
      { key: 'import_rows', label: 'Roughly how many records?', type: 'select', options: o(['none', 'None'], ['up_to_1000', 'Up to 1,000'], ['1001_5000', '1,001 - 5,000'], ['5001_plus', 'More than 5,000']), allowNotSure: true },
      { key: 'data_types', label: 'What needs to come across?', type: 'multi', allowNotSure: true, options: o(['contacts', 'People'], ['organisations', 'Companies'], ['open_deals', 'Open sales'], ['historical_deals', 'Past sales']) },
      { key: 'import_batches', label: 'Would you bring the data in one go or in stages?', type: 'select', options: o(['one', 'One go'], ['two', 'Two stages']), allowNotSure: true },
      { key: 'matching_rules', label: 'Should we match people to their companies and avoid duplicates?', type: 'select', options: yn, allowNotSure: true },
      { key: 'owner_mapping', label: 'Do records already say which team member owns them?', type: 'select', options: yn, allowNotSure: true },
      { key: 'default_pipeline_stage', label: 'Which step should imported sales start in?', type: 'text', allowNotSure: true },
      { key: 'historical_matters', label: 'Does your sales history matter for the first launch?', type: 'select', options: yn, allowNotSure: true },
      { key: 'training_focus', label: 'What should training focus on?', type: 'multi', allowNotSure: true, options: o(['daily_use', 'Day-to-day use'], ['pipeline', 'Managing the pipeline'], ['reports', 'Reports'], ['admin', 'Administration']) },
      { key: 'training_attendees', label: 'Who will attend training?', type: 'textarea', allowNotSure: true },
      { key: 'training_timing', label: 'When suits for training and launch?', type: 'text', allowNotSure: true },
      { key: 'access_readiness', label: 'Is your Pipedrive account ready for us to work in?', type: 'select', options: o(['ready', 'Yes'], ['not_yet', 'Not yet']), allowNotSure: true },
    ],
  },
]

export const ALL_FIELDS: OnbField[] = SECTIONS.flatMap((s) => s.fields)
export const FIELD_BY_KEY: Record<string, OnbField> = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f]))
