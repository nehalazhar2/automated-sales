'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { QUESTIONS, STEPS, type Question } from '@/lib/quickstart/qualification/questions'
import {
  pruneHidden,
  qualAnswersSchema,
  validateVisibleRequired,
  type QualAnswers,
} from '@/lib/quickstart/qualification/schema'
import Field from './Field'
import ResultCard, { type QualifyResult } from './ResultCard'

type Answers = Partial<QualAnswers>
type Errors = Record<string, string>

const visibleFor = (answers: Answers, step: number): Question[] =>
  QUESTIONS.filter((q) => q.step === step && (!q.showIf || q.showIf(answers)))

/** Errors for one step: required-visible plus email/website format. */
function validateStep(answers: Answers, step: number): Errors {
  const keys = new Set(visibleFor(answers, step).map((q) => q.key as string))
  const errors: Errors = {}
  for (const [k, msg] of Object.entries(validateVisibleRequired(answers))) {
    if (keys.has(k)) errors[k] = msg
  }
  for (const k of ['email', 'website'] as const) {
    const v = answers[k]
    if (!keys.has(k) || errors[k] || typeof v !== 'string' || v.trim() === '') continue
    const r = qualAnswersSchema.shape[k].safeParse(v)
    if (!r.success) {
      errors[k] = k === 'email' ? 'Enter a valid email address' : r.error.issues[0]?.message ?? 'Invalid value'
    }
  }
  return errors
}

/** crypto.randomUUID needs a secure context; fall back to a random id the server accepts. */
function newSubmissionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`
}

export default function QualificationWizard({ initialReferralDetail = '' }: { initialReferralDetail?: string }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>(() =>
    initialReferralDetail ? { referral_detail: initialReferralDetail } : {}
  )
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<{ message: string; retryable: boolean } | null>(null)
  const [result, setResult] = useState<QualifyResult | null>(null)
  const [focusTick, setFocusTick] = useState(0)

  const submissionId = useRef<string>('')
  const honeypot = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const errorFocusPending = useRef(false)

  const visible = useMemo(() => visibleFor(answers, step), [answers, step])
  const meta = STEPS.find((s) => s.n === step)!
  const isLast = step === STEPS.length

  // Move focus to the step heading when the step changes (not on first render).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    // A pending error focus (e.g. server 400 moved us to the step with the bad field) wins.
    if (errorFocusPending.current) return
    titleRef.current?.focus()
  }, [step])

  // Focus first invalid field after a failed Continue / server rejection.
  useEffect(() => {
    if (!focusTick) return
    errorFocusPending.current = false
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!el) return
    if (el.tagName === 'FIELDSET') el.querySelector<HTMLElement>('input')?.focus()
    else el.focus()
  }, [focusTick])

  function requestErrorFocus() {
    errorFocusPending.current = true
    setFocusTick((t) => t + 1)
  }

  function onChange(key: Question['key'], value: string | string[]) {
    setAnswers((a) => ({ ...a, [key]: value }))
    setErrors((e) => {
      if (!e[key]) return e
      const { [key]: _removed, ...rest } = e
      return rest
    })
  }

  async function submit() {
    setPending(true)
    setSubmitError(null)
    try {
      if (!submissionId.current) submissionId.current = newSubmissionId()
      const res = await fetch('/api/quickstart/qualify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submissionId.current,
          answers: pruneHidden(answers),
          honeypot: honeypot.current?.value ?? '',
        }),
      })
      let body: {
        ok?: boolean
        outcome?: QualifyResult['outcome']
        package?: QualifyResult['package']
        fieldErrors?: Record<string, string[] | undefined>
      } = {}
      try {
        body = await res.json()
      } catch {
        /* non-JSON response */
      }
      if (res.ok && body.ok && body.outcome) {
        setResult({ outcome: body.outcome, package: body.package })
        return
      }
      if (res.status === 400) {
        // Map server field errors back to fields; fall back to re-validating every step.
        const known = new Set(QUESTIONS.map((q) => q.key as string))
        const mapped: Errors = {}
        for (const [k, msgs] of Object.entries(body.fieldErrors ?? {})) {
          if (known.has(k) && msgs?.[0]) mapped[k] = msgs[0]
        }
        // Exact mapping from the server; client re-validation only when nothing could be mapped.
        if (Object.keys(mapped).length === 0) {
          for (const s of STEPS) Object.assign(mapped, validateStep(answers, s.n))
        }
        const firstKey = QUESTIONS.find((q) => mapped[q.key])
        if (firstKey) {
          setErrors(mapped)
          setStep(firstKey.step)
          requestErrorFocus()
          setSubmitError({ message: 'Some answers need another look. Please check the highlighted fields and try again.', retryable: false })
          return
        }
        // Nothing we can point at: treat as a retryable failure rather than a dead end.
        setSubmitError({ message: 'Something went wrong sending your answers. Nothing has been lost, so please try again.', retryable: true })
        return
      }
      setSubmitError({ message: 'Something went wrong sending your answers. Nothing has been lost, so please try again.', retryable: true })
    } catch {
      setSubmitError({ message: 'We couldn’t reach the server. Check your connection and try again.', retryable: true })
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    const errs = validateStep(answers, step)
    setErrors(errs)
    if (Object.keys(errs).length) {
      requestErrorFocus()
      return
    }
    if (isLast) void submit()
    else setStep((s) => s + 1)
  }

  if (result) return <ResultCard result={result} />

  return (
    <div className="qs-card">
      <div
        className="qs-steps"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step}
        aria-valuetext={`Step ${step} of ${STEPS.length}: ${meta.title}`}
      >
        {STEPS.map((s) => (
          <i key={s.n} className={s.n <= step ? 'on' : undefined} />
        ))}
      </div>
      <div className="qs-stepmeta">
        <span>Step {step} of {STEPS.length}</span>
        <span>About 4 minutes in total</span>
      </div>
      <h2 className="qs-title" ref={titleRef} tabIndex={-1}>
        <span className="qs-vh">Step {step} of {STEPS.length}: </span>{meta.title}
      </h2>
      {step > 1 && step < STEPS.length && (
        <p className="qs-sub">Choose &ldquo;Not sure&rdquo; if you don&apos;t know. We&apos;ll go through it with you.</p>
      )}
      <p className="qs-hint" style={{ marginTop: 0 }}><span className="qs-req" aria-hidden="true">*</span> marks a required question.</p>

      <form ref={formRef} className="qs-form" onSubmit={onSubmit} noValidate>
        {visible.map((q) => (
          <Field
            key={q.key}
            question={q}
            value={answers[q.key] as string | string[] | undefined}
            error={errors[q.key]}
            onChange={onChange}
          />
        ))}

        <div className="qs-honeypot" aria-hidden="true">
          <input ref={honeypot} type="text" name="qs_hp_x" tabIndex={-1} autoComplete="new-password" defaultValue="" />
        </div>

        {submitError && (
          <div className="qs-alert" role="alert">
            {submitError.message}
            {submitError.retryable && (
              <div>
                <button type="button" className="as-btn as-btn-secondary" onClick={() => void submit()} disabled={pending}>
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        <div className="qs-btns">
          {step > 1 ? (
            <button
              type="button"
              className="as-btn as-btn-secondary"
              onClick={() => {
                setErrors({})
                setSubmitError(null)
                setStep((s) => s - 1)
              }}
              disabled={pending}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="as-btn as-btn-primary" disabled={pending}>
            {isLast ? (pending ? 'Sending…' : 'Get my recommendation') : 'Continue →'}
          </button>
        </div>
      </form>
    </div>
  )
}
