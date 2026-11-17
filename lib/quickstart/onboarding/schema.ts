import { z } from 'zod'
import { ALL_FIELDS, NOT_SURE, type OnbField } from './sections'

export const MAX_BODY_BYTES = 200 * 1024
const STR = 2000

const str = z.string().max(STR)
const notSure = z.literal(NOT_SURE)

function typeSchema(f: OnbField): z.ZodTypeAny {
  switch (f.type) {
    case 'multi':
      return z.array(str).max(50)
    case 'number':
      return z.union([z.number().finite(), str])
    case 'users':
      return z
        .array(z.object({ name: str, email: str, role: z.enum(['admin', 'regular']), team: str.optional() }))
        .max(50)
    case 'pipelines':
      return z.array(z.object({ name: str, stages: z.array(str).max(20) })).max(10)
    default:
      return str
  }
}

const shape: Record<string, z.ZodTypeAny> = {}
for (const f of ALL_FIELDS) {
  shape[f.key] = f.allowNotSure ? z.union([notSure, typeSchema(f)]).optional() : typeSchema(f).optional()
}

/** Lenient: unknown keys (including injected package fields) are stripped. */
export const onboardingDraftSchema = z.object(shape)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URLISH = /^(https?:\/\/)?[^\s./]+(\.[^\s./]+)+(\/\S*)?$/

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

export const onboardingSubmitSchema = onboardingDraftSchema.superRefine((a, ctx) => {
  const rec = a as Record<string, unknown>
  const add = (key: string, message: string) => ctx.addIssue({ code: 'custom', path: [key], message })
  for (const f of ALL_FIELDS) {
    const v = rec[f.key]
    if (v === NOT_SURE) continue
    if (f.required) {
      let missing = isEmpty(v)
      if (!missing && f.type === 'pipelines') {
        missing = !(v as { name: string }[]).some((p) => p.name.trim() !== '')
      }
      if (!missing && f.type === 'users') {
        missing = !(v as { name: string }[]).some((u) => u.name.trim() !== '')
      }
      if (missing) {
        add(f.key, 'Please answer this, or choose "Not sure".')
        continue
      }
    }
    if (isEmpty(v)) continue
    if (f.type === 'email' && !EMAIL.test((v as string).trim())) add(f.key, 'Please enter a valid email address.')
    if (f.type === 'url' && !URLISH.test((v as string).trim())) add(f.key, 'Please enter a valid web address.')
    if (f.type === 'users') {
      const bad = (v as { email: string }[]).some((u) => u.email.trim() !== '' && !EMAIL.test(u.email.trim()))
      if (bad) add(f.key, 'One or more email addresses look incorrect.')
    }
  }
})

export type OnboardingAnswers = Record<string, unknown>

export function buildFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) (out[String(issue.path[0] ?? '_')] ??= []).push(issue.message)
  return out
}
