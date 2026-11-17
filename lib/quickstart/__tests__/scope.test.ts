import { describe, it, expect } from 'vitest'
import { checkScope } from '../onboarding/scope'
import { PACKAGES } from '../packages'
import { SECTIONS, ALL_FIELDS, isFieldVisible, FIELD_BY_KEY } from '../onboarding/sections'
import { seedFromQualification } from '../onboarding/seed'

const qs = PACKAGES.quickstart
const plus = PACKAGES.plus
const stages = (n: number) => Array.from({ length: n }, (_, i) => `S${i}`)
const users = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `U${i}`, email: `u${i}@x.co`, role: 'regular' as const }))

describe('checkScope', () => {
  it('no warnings for in-scope answers', () => {
    expect(checkScope({ pipelines: [{ name: 'Main', stages: stages(6) }], team_users: users(3) }, qs)).toEqual([])
  })
  it('warns on 2 pipelines for quickstart but not plus', () => {
    const a = { pipelines: [{ name: 'A', stages: [] }, { name: 'B', stages: [] }] }
    expect(checkScope(a, qs)).toHaveLength(1)
    expect(checkScope(a, plus)).toEqual([])
  })
  it('warns on 9 stages', () => {
    expect(checkScope({ pipelines: [{ name: 'A', stages: stages(9) }] }, qs).join(' ')).toMatch(/steps/)
  })
  it('warns on 6 users for quickstart, not plus', () => {
    expect(checkScope({ team_users: users(6) }, qs)).toHaveLength(1)
    expect(checkScope({ team_users: users(6) }, plus)).toEqual([])
  })
  it('warns on other_automation and on too many recipes', () => {
    expect(checkScope({ other_automation: 'Auto invoice' }, qs)).toHaveLength(1)
    const w = checkScope(
      { automation_recipes: ['new_deal_task', 'stage_entry_task', 'won_handover_task'], other_automation: 'x' },
      qs
    )
    expect(w).toHaveLength(2)
  })
  it('warns on non-standard reports and big imports', () => {
    expect(checkScope({ reporting_needs: ['forecast', 'lead_source'] }, qs)).toHaveLength(1)
    expect(checkScope({ reporting_needs: ['forecast'] }, qs)).toEqual([])
    expect(checkScope({ import_rows: '1001_5000' }, qs)).toHaveLength(1)
    expect(checkScope({ import_rows: '1001_5000' }, plus)).toEqual([])
    expect(checkScope({ import_rows: '5001_plus' }, plus)).toHaveLength(1)
  })
  it('warns when customer fields exceed the limit', () => {
    const extra = Array.from({ length: 10 }, (_, i) => `f${i}`).join('\n')
    expect(checkScope({ customer_fields: ['a', 'b', 'c', 'd', 'e', 'f'], customer_extra_fields: extra }, qs)).toHaveLength(1)
  })
  it('ignores blank users, pipelines and stages when counting', () => {
    const blankUsers = [...users(5), { name: '', email: '', role: 'regular' as const }, { name: ' ', email: '', role: 'regular' as const }]
    expect(checkScope({ team_users: blankUsers }, qs)).toEqual([])
    expect(checkScope({ pipelines: [{ name: 'A', stages: [...stages(8), '', ' '] }, { name: '', stages: [] }] }, qs)).toEqual([])
  })
  it("never warns for 'not_sure'", () => {
    const a = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, 'not_sure']))
    expect(checkScope(a, qs)).toEqual([])
  })
})

describe('SECTIONS', () => {
  it('has 8 ordered sections with unique snake_case keys; required fields allow not sure', () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(['business', 'leads', 'sales_process', 'customer_info', 'team', 'automation', 'reporting', 'data_golive'])
    const keys = ALL_FIELDS.map((f) => f.key)
    expect(new Set(keys).size).toBe(keys.length)
    keys.forEach((k) => expect(k).toMatch(/^[a-z][a-z0-9_]*$/))
    ALL_FIELDS.filter((f) => f.required).forEach((f) => expect(f.allowNotSure).toBe(true))
    SECTIONS.forEach((s) => expect(s.fields.some((f) => f.required)).toBe(true))
  })
})

describe('field budget and visibility', () => {
  it('keeps the form short', () => {
    expect(ALL_FIELDS.length).toBeLessThanOrEqual(52)
    for (const s of SECTIONS) expect(s.fields.filter((f) => isFieldVisible(f, {})).length).toBeLessThanOrEqual(9)
    for (const k of ['company_name', 'website', 'separate_processes']) expect(FIELD_BY_KEY[k]).toBeUndefined()
  })
  it('evaluates showIf variants', () => {
    const f = (showIf: object) => ({ key: 'x', label: 'x', type: 'text' as const, showIf: showIf as never })
    expect(isFieldVisible(f({ key: 'a', equals: 'no' }), { a: 'no' })).toBe(true)
    expect(isFieldVisible(f({ key: 'a', equals: 'no' }), {})).toBe(false)
    expect(isFieldVisible(f({ key: 'a', notEquals: 'no' }), {})).toBe(true)
    expect(isFieldVisible(f({ key: 'a', notEquals: 'no' }), { a: 'no' })).toBe(false)
    expect(isFieldVisible(f({ key: 'a', in: ['yes', 'not_sure'] }), { a: 'not_sure' })).toBe(true)
    expect(isFieldVisible(f({ key: 'a', in: ['x'] }), { a: ['y', 'x'] })).toBe(true)
    expect(isFieldVisible(f({ key: 'a', nonEmpty: true }), { a: [] })).toBe(false)
    expect(isFieldVisible(f({ key: 'a', nonEmpty: true }), { a: ['x'] })).toBe(true)
  })
  it('data fields only show when bringing data; recipe details only with a recipe', () => {
    expect(isFieldVisible(FIELD_BY_KEY.import_rows, { bringing_data: 'no' })).toBe(false)
    expect(isFieldVisible(FIELD_BY_KEY.import_rows, { bringing_data: 'not_sure' })).toBe(true)
    expect(isFieldVisible(FIELD_BY_KEY.recipe_details, { automation_recipes: ['none'] })).toBe(false)
    expect(isFieldVisible(FIELD_BY_KEY.recipe_details, { automation_recipes: ['new_deal_task'] })).toBe(true)
  })
  it('restores covered brief items and keeps targets standard', () => {
    for (const k of ['email_provider', 'currency', 'activity_types', 'stage_criteria']) expect(FIELD_BY_KEY[k]).toBeDefined()
    expect(isFieldVisible(FIELD_BY_KEY.stage_criteria, {})).toBe(false)
    expect(isFieldVisible(FIELD_BY_KEY.stage_criteria, { pipelines: [{ name: 'A', stages: [] }] })).toBe(true)
    expect(isFieldVisible(FIELD_BY_KEY.pipedrive_account_url, {})).toBe(false)
    expect(isFieldVisible(FIELD_BY_KEY.pipedrive_account_url, { pipedrive_plan: 'growth' })).toBe(true)
    expect(isFieldVisible(FIELD_BY_KEY.pipedrive_account_url, { pipedrive_plan: 'not_sure' })).toBe(true)
    expect(isFieldVisible(FIELD_BY_KEY.pipedrive_account_url, { pipedrive_plan: 'no_account' })).toBe(false)
    expect(FIELD_BY_KEY.lead_responder).toMatchObject({ type: 'text', allowNotSure: true })
    expect(FIELD_BY_KEY.lead_allocation.hint ?? '').not.toMatch(/above/)
    expect(ALL_FIELDS.length).toBe(51)
    expect(checkScope({ reporting_needs: ['targets'] }, PACKAGES.quickstart)).toEqual([])
  })
  it('pipelines offers the ten suggested steps', () => {
    expect(FIELD_BY_KEY.pipelines.suggestions).toEqual(['Enquiry', 'Qualification', 'Discovery', 'Demo', 'Survey', 'Quote', 'Approval', 'Negotiation', 'Contract', 'Deposit'])
  })
})

describe('seedFromQualification', () => {
  it('maps overlapping answers', () => {
    expect(seedFromQualification({ migration: 'no', current_system: 'hubspot' })).toEqual({ bringing_data: 'no', source_system: 'other_crm' })
    expect(seedFromQualification({ migration: 'not_sure', current_system: 'none' })).toEqual({ bringing_data: 'not_sure', source_system: 'none' })
    expect(seedFromQualification({ data_types: ['contacts', 'notes', 'historical_deals'], records: '5001_plus', clean_export: 'no' })).toEqual({
      data_types: ['contacts', 'historical_deals'], import_rows: '5001_plus', clean_file_available: 'no',
    })
  })
  it('ignores junk and empty input', () => {
    expect(seedFromQualification({})).toEqual({})
    expect(seedFromQualification({ records: 'lots', migration: 5 })).toEqual({})
  })
})
