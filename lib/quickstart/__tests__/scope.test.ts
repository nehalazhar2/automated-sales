import { describe, it, expect } from 'vitest'
import { checkScope } from '../onboarding/scope'
import { PACKAGES } from '../packages'
import { SECTIONS, ALL_FIELDS } from '../onboarding/sections'

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
