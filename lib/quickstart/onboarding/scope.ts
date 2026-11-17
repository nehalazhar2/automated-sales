import type { PackageLimits } from '../packages'
import { NOT_SURE } from './sections'

const STANDARD_RECIPES = ['new_deal_task', 'stage_entry_task', 'won_handover_task']
const NON_STANDARD_REPORTS = ['lead_source', 'custom_other']
const ROW_BANDS: Record<string, number> = { up_to_1000: 1000, '1001_5000': 5000, '5001_plus': Infinity }

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const nonEmpty = (v: unknown) => typeof v === 'string' && v !== NOT_SURE && v.trim() !== ''

/** Human-readable scope warnings. Never blocks; 'not_sure' never warns. */
export function checkScope(answers: Record<string, unknown>, pkg: PackageLimits): string[] {
  const w: string[] = []
  const blank = (v: unknown) => typeof v !== 'string' || v.trim() === ''
  const pipelines = (arr(answers.pipelines) as { name?: string; stages?: unknown[] }[])
    .map((p) => ({ ...p, stages: arr(p.stages).filter((x) => !blank(x)) }))
    .filter((p) => !blank(p.name) || p.stages.length > 0)
  if (pipelines.length > pkg.maxPipelines) {
    w.push(`You have listed ${pipelines.length} sales processes; your package includes ${pkg.maxPipelines}. We will talk through the options with you.`)
  }
  const long = pipelines.filter((p) => arr(p.stages).length > pkg.maxStagesPerPipeline)
  if (long.length) {
    w.push(`${long.length === 1 ? 'One sales process has' : 'Some sales processes have'} more than ${pkg.maxStagesPerPipeline} steps, which is the most your package includes. We can help simplify this.`)
  }
  const users = (arr(answers.team_users) as { name?: unknown }[]).filter((u) => !blank(u?.name))
  if (users.length > pkg.maxUsers) {
    w.push(`You have listed ${users.length} users; your package includes up to ${pkg.maxUsers}. We will confirm the best way forward.`)
  }
  const recipes = arr(answers.automation_recipes).filter((r) => STANDARD_RECIPES.includes(String(r))).length
  const other = nonEmpty(answers.other_automation)
  if (recipes + (other ? 1 : 0) > pkg.maxRecipes) {
    w.push(`You have asked for more automations than the ${pkg.maxRecipes} included in your package.`)
  }
  if (other) {
    w.push('Your extra automation request needs a quick review with us before we can confirm it is included.')
  }
  const reports = arr(answers.reporting_needs).filter((r) => NON_STANDARD_REPORTS.includes(String(r)))
  if (reports.length) {
    w.push('Some of the reports you asked for (such as source tracking or tailored reports) may go beyond the standard dashboards. We will review them with you.')
  }
  const band = typeof answers.import_rows === 'string' ? ROW_BANDS[answers.import_rows] : undefined
  if (band !== undefined && band > pkg.maxImportRows) {
    w.push(`Your data import looks larger than the ${pkg.maxImportRows.toLocaleString('en-GB')} records included in your package. We will agree how to handle it.`)
  }
  const extra = nonEmpty(answers.customer_extra_fields)
    ? (answers.customer_extra_fields as string).split(/[\n,]/).filter((s) => s.trim()).length
    : 0
  if (arr(answers.customer_fields).length + extra > pkg.maxCustomFields) {
    w.push(`You would like to record more customer details than the ${pkg.maxCustomFields} fields included in your package. We will help prioritise them.`)
  }
  return w
}
