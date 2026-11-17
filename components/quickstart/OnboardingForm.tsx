'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  NOT_SURE,
  SECTIONS,
  isFieldVisible,
  pruneHidden,
  type OnbField,
} from '@/lib/quickstart/onboarding/sections'
import { SCOPE_VERSION, type PackageLimits } from '@/lib/quickstart/packages'
import OnboardingField from './onboarding/OnboardingField'

type Answers = Record<string, unknown>
type Errors = Record<string, string>
type SaveState = 'idle' | 'saving' | 'saved' | 'retrying' | 'error' | 'stale'

type Props = {
  token: string
  company: string
  pkg: PackageLimits
  initialAnswers: Answers
  initialStatus: 'not_sent' | 'draft' | 'submitted'
  initialWarnings: string[]
  initialSavedAt: string | null
}

const REVIEW = SECTIONS.length
const DEBOUNCE_MS = 1500
const RETRY_DELAYS = [1000, 2000, 4000]

function isAnswered(f: OnbField, v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim() !== '' && v !== NOT_SURE
  if (typeof v === 'number') return true
  if (Array.isArray(v)) {
    if (f.type === 'pipelines' || f.type === 'users') {
      return (v as { name?: unknown }[]).some((r) => typeof r?.name === 'string' && r.name.trim() !== '')
    }
    return v.length > 0
  }
  return false
}

function sectionStats(index: number, answers: Answers) {
  const visible = SECTIONS[index].fields.filter((f) => isFieldVisible(f, answers))
  let answered = 0
  let notSure = 0
  let requiredOpen = 0
  for (const f of visible) {
    const v = answers[f.key]
    if (v === NOT_SURE) notSure++
    else if (isAnswered(f, v)) answered++
    else if (f.required) requiredOpen++
  }
  const requiredCount = visible.filter((f) => f.required).length
  // "Done" = every visible required field answered or marked not sure; with no required fields, at least one answer.
  const done = requiredCount > 0 ? requiredOpen === 0 : answered + notSure > 0
  return { visible, answered, notSure, requiredOpen, done, blank: visible.length - answered - notSure }
}

function Confirmation({ company }: { company: string }) {
  return (
    <div className="qs-card qs-result" tabIndex={-1} ref={(el) => el?.focus()}>
      <span className="qs-badge">{company}</span>
      <h2>Requirements received for review</h2>
      <p className="qs-text">We&apos;ll review your answers and confirm the scope before anything is built.</p>
      <p className="qs-note" style={{ marginTop: 12 }}>You can close this page. Nothing else is needed from you right now.</p>
    </div>
  )
}

export default function OnboardingForm({
  token, company, pkg, initialAnswers, initialStatus, initialWarnings, initialSavedAt,
}: Props) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [warnings, setWarnings] = useState<string[]>(initialWarnings)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<string | null>(initialSavedAt)
  const [mounted, setMounted] = useState(false)
  const [submitted, setSubmitted] = useState(initialStatus === 'submitted')
  const [stale, setStale] = useState<{ answers: Answers; savedAt: string | null } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [focusTick, setFocusTick] = useState(0)

  const answersRef = useRef<Answers>(initialAnswers)
  const baseRef = useRef<string | null>(initialSavedAt)
  const verRef = useRef(0) // bumped on every local change
  const savedVerRef = useRef(0) // version covered by the last successful save
  const chain = useRef<Promise<boolean> | null>(null)
  const needAgain = useRef(false)
  const staleRef = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alive = useRef(true)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const prevValues = useRef<Record<string, unknown>>({})
  const [advancing, setAdvancing] = useState(false)
  const advancingRef = useRef(false)

  const apiBase = `/api/quickstart/onboarding/${token}/`

  useEffect(() => {
    setMounted(true)
    alive.current = true
    return () => {
      alive.current = false
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const dirty = () => verRef.current !== savedVerRef.current

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty() && !staleRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [])

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  /** One save attempt sequence (with up to 3 retries on network/server errors). */
  const doRequest = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; ; attempt++) {
      if (staleRef.current || !alive.current) return false
      const sentVer = verRef.current
      setSaveState(attempt === 0 ? 'saving' : 'retrying')
      let retryable = false
      try {
        const res = await fetch(apiBase, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: pruneHidden(answersRef.current), baseSavedAt: baseRef.current }),
        })
        let body: Record<string, unknown> = {}
        try {
          body = await res.json()
        } catch {
          /* non-JSON */
        }
        if (res.ok && body.ok && typeof body.savedAt === 'string') {
          baseRef.current = body.savedAt
          savedVerRef.current = sentVer
          if (!alive.current) return true
          setSavedAt(body.savedAt)
          if (Array.isArray(body.warnings)) setWarnings(body.warnings as string[])
          setSaveState('saved')
          return true
        }
        if (res.status === 409 && body.error === 'stale') {
          staleRef.current = true
          if (needAgain.current) needAgain.current = false
          if (timer.current) clearTimeout(timer.current)
          setStale({
            answers: (body.answers as Answers) ?? {},
            savedAt: typeof body.savedAt === 'string' ? body.savedAt : null,
          })
          setSaveState('stale')
          return false
        }
        if (res.status === 409 && body.error === 'already_submitted') {
          staleRef.current = true
          setSubmitted(true)
          return false
        }
        if (res.status === 429 || res.status >= 500) retryable = true
      } catch {
        retryable = true
      }
      if (!retryable || attempt >= RETRY_DELAYS.length) {
        if (alive.current) setSaveState('error')
        return false
      }
      if (alive.current) setSaveState('retrying')
      await sleep(RETRY_DELAYS[attempt])
    }
  }, [apiBase])

  /** Strictly one request in flight; changes made meanwhile queue one follow-up. */
  const flush = useCallback((): Promise<boolean> => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    if (staleRef.current) return Promise.resolve(false)
    if (chain.current) {
      needAgain.current = true
      return chain.current
    }
    if (!dirty() && baseRef.current !== null) return Promise.resolve(true)
    // Before the first save, saving an unchanged seeded draft is still useful (persists the prefill).
    const p = (async () => {
      let ok = true
      do {
        needAgain.current = false
        ok = await doRequest()
      } while (ok && needAgain.current && !staleRef.current && alive.current)
      chain.current = null
      return ok
    })()
    chain.current = p
    return p
  }, [doRequest])

  const onChange = useCallback(
    (key: string, value: unknown) => {
      const next = { ...answersRef.current }
      if (value === undefined) delete next[key]
      else next[key] = value
      answersRef.current = next
      verRef.current++
      setAnswers(next)
      setErrors((e) => {
        if (!e[key]) return e
        const { [key]: _x, ...rest } = e
        return rest
      })
      if (staleRef.current) return
      if (chain.current) {
        needAgain.current = true
        return
      }
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS)
    },
    [flush]
  )

  const onNotSure = useCallback(
    (key: string, checked: boolean, empty: unknown) => {
      if (checked) {
        const cur = answersRef.current[key]
        if (cur !== undefined && cur !== NOT_SURE) prevValues.current[key] = cur
        onChange(key, NOT_SURE)
      } else {
        onChange(key, prevValues.current[key] ?? empty)
      }
    },
    [onChange]
  )

  function loadLatest() {
    if (!stale) return
    const next = stale.answers
    answersRef.current = next
    baseRef.current = stale.savedAt
    verRef.current++
    savedVerRef.current = verRef.current
    staleRef.current = false
    setAnswers(next)
    setSavedAt(stale.savedAt)
    setStale(null)
    setErrors({})
    setSaveState('saved')
    // Warnings refresh (best effort).
    void fetch(apiBase, { cache: 'no-store' })
      .then((r) => r.json())
      .then((b) => {
        if (b?.ok && Array.isArray(b.warnings) && alive.current) setWarnings(b.warnings)
      })
      .catch(() => {})
  }

  // Focus the section heading when the step changes (not on first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    titleRef.current?.focus()
  }, [step])

  // After a rejected submit, focus the first invalid field (declared after the heading effect so it wins).
  useEffect(() => {
    if (!focusTick) return
    const target = [...(formRef.current?.querySelectorAll<HTMLElement>('[data-qs-field]') ?? [])].find(
      (el) => errors[el.dataset.qsField ?? '']
    )
    target?.querySelector<HTMLElement>('input:not([disabled]),select,textarea,button')?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTick])

  const stats = useMemo(() => SECTIONS.map((_, i) => sectionStats(i, answers)), [answers])
  const section = step < REVIEW ? SECTIONS[step] : null
  const visibleFields = section ? stats[step].visible : []

  async function go(target: number) {
    if (target === step || submitting || advancingRef.current) return
    setSubmitError(null)
    void flush() // fire and forget; navigation never waits on the network
    setStep(target)
  }

  async function saveAndContinue() {
    if (advancingRef.current) return
    advancingRef.current = true
    setAdvancing(true)
    const from = step
    try {
      await flush()
      if (staleRef.current) return // banner is showing; stay put
      setStep(Math.min(from + 1, REVIEW))
    } finally {
      advancingRef.current = false
      setAdvancing(false)
    }
  }

  async function submit() {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const saved = await flush()
      if (staleRef.current) return
      if (!saved) {
        setSubmitError('We couldn’t save your latest answers just now. Please check your connection and try again.')
        return
      }
      const res = await fetch(`${apiBase}submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: pruneHidden(answersRef.current), baseSavedAt: baseRef.current }),
      })
      let body: Record<string, unknown> = {}
      try {
        body = await res.json()
      } catch {
        /* non-JSON */
      }
      if (res.ok && body.ok) {
        staleRef.current = true
        setSubmitted(true)
        return
      }
      if (res.status === 409 && body.error === 'stale') {
        staleRef.current = true
        setStale({
          answers: (body.answers as Answers) ?? {},
          savedAt: typeof body.savedAt === 'string' ? body.savedAt : null,
        })
        setSaveState('stale')
        return
      }
      if (res.status === 409 && body.error === 'already_submitted') {
        setSubmitted(true)
        return
      }
      if (res.status === 400 && body.error === 'invalid') {
        const fe = (body.fieldErrors ?? {}) as Record<string, string[] | undefined>
        const mapped: Errors = {}
        for (const [k, msgs] of Object.entries(fe)) if (msgs?.[0]) mapped[k] = msgs[0]
        const idx = SECTIONS.findIndex((s) => s.fields.some((f) => mapped[f.key]))
        if (idx >= 0) {
          setErrors(mapped)
          setStep(idx)
          setFocusTick((t) => t + 1)
          setSubmitError('Some answers need another look. We have taken you to the first one.')
          return
        }
      }
      setSubmitError('Something went wrong sending your answers. Nothing has been lost, so please try again.')
    } catch {
      setSubmitError('We couldn’t reach the server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <Confirmation company={company} />

  const indicator =
    saveState === 'saving' ? 'Saving…'
    : saveState === 'retrying' ? 'Couldn’t save — retrying'
    : saveState === 'error' ? 'Couldn’t save. Your answers are kept on this page; we’ll try again when you make a change.'
    : saveState === 'stale' ? 'Not saved: this form was updated somewhere else.'
    : savedAt && mounted
      ? `✓ Draft saved at ${new Date(savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. You can close this page and come back to the same link.`
      : 'Your answers save automatically. You can close this page and come back to the same link.'

  const warnBlock =
    warnings.length > 0 ? (
      <div className="qs-warn" role="status">
        <strong>Worth a quick conversation</strong>
        <ul>
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <span>You can keep going. We will talk through these with you before anything is agreed.</span>
      </div>
    ) : null

  return (
    <div className="qs-ob" ref={formRef}>
      <aside className="qs-side" aria-label="Sections">
        <h2 className="qs-side-co">{company}</h2>
        <div className="qs-side-pk">{pkg.name} · scope {SCOPE_VERSION}</div>
        <nav>
          <ol className="qs-side-list">
            {SECTIONS.map((s, i) => {
              const cur = i === step
              const done = stats[i].done
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`qs-sec${cur ? ' cur' : ''}${done ? ' done' : ''}`}
                    aria-current={cur ? 'step' : undefined}
                    onClick={() => void go(i)}
                    disabled={submitting}
                  >
                    <span className="qs-dot" aria-hidden="true">{done ? '✓' : i + 1}</span>
                    <span>
                      {s.title}
                      <span className="qs-vh">{done ? ' (complete)' : ''}</span>
                    </span>
                  </button>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                className={`qs-sec${step === REVIEW ? ' cur' : ''}`}
                aria-current={step === REVIEW ? 'step' : undefined}
                onClick={() => void go(REVIEW)}
                disabled={submitting}
              >
                <span className="qs-dot" aria-hidden="true">{REVIEW + 1}</span>
                <span>Review &amp; submit</span>
              </button>
            </li>
          </ol>
        </nav>
        <div className="qs-saved" role="status" aria-live="polite">{indicator}</div>
      </aside>

      <div className="qs-main">
        {stale && (
          <div className="qs-alert" role="alert">
            <strong>This form was updated somewhere else.</strong> To avoid overwriting those changes, saving is paused.
            <div>
              <button type="button" className="as-btn as-btn-secondary" onClick={loadLatest}>Load latest answers</button>
            </div>
          </div>
        )}

        {section ? (
          <>
            <div className="qs-stepmeta">
              <span>Section {step + 1} of {SECTIONS.length}</span>
              <span>Choose &ldquo;Not sure&rdquo; if you don&apos;t know</span>
            </div>
            <h2 className="qs-title qs-ob-title" ref={titleRef} tabIndex={-1}>{section.title}</h2>
            {section.intro && <p className="qs-sub">{section.intro}</p>}
            {section.notes?.map((n) => (
              <p key={n} className="qs-note-box">{n}</p>
            ))}
            {warnBlock}
            <div className="qs-form">
              {visibleFields.map((f) => (
                <OnboardingField
                  key={f.key}
                  field={f}
                  value={answers[f.key]}
                  error={errors[f.key]}
                  pkg={pkg}
                  onChange={onChange}
                  onNotSure={onNotSure}
                />
              ))}
            </div>
            <div className="qs-btns">
              {step > 0 ? (
                <button type="button" className="as-btn as-btn-secondary" onClick={() => void go(step - 1)} disabled={advancing}>
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="as-btn as-btn-primary" disabled={advancing} onClick={() => void saveAndContinue()}>
                {advancing ? 'Saving…' : step === REVIEW - 1 ? 'Save & review →' : 'Save & continue →'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="qs-stepmeta">
              <span>Final step</span>
              <span>Nothing is built until we confirm the scope</span>
            </div>
            <h2 className="qs-title qs-ob-title" ref={titleRef} tabIndex={-1}>Review &amp; submit</h2>
            <p className="qs-sub">Check each section, then submit. You can still go back and change anything first.</p>
            {warnBlock}
            <ul className="qs-review">
              {SECTIONS.map((s, i) => {
                const st = stats[i]
                return (
                  <li key={s.id}>
                    <div>
                      <strong>{s.title}</strong>
                      <div className="qs-hint">
                        {st.answered} answered · {st.notSure} not sure
                        {st.blank > 0 ? ` · ${st.blank} left blank` : ''}
                      </div>
                      {st.requiredOpen > 0 && (
                        <div className="qs-review-req">
                          {st.requiredOpen} required question{st.requiredOpen === 1 ? '' : 's'} still need an answer
                        </div>
                      )}
                    </div>
                    <button type="button" className="qs-linkbtn" onClick={() => void go(i)} disabled={submitting} aria-label={`Edit ${s.title}`}>
                      Edit
                    </button>
                  </li>
                )
              })}
            </ul>
            {submitError && <div className="qs-alert" role="alert">{submitError}</div>}
            <div className="qs-btns">
              <button type="button" className="as-btn as-btn-secondary" onClick={() => void go(REVIEW - 1)} disabled={submitting}>
                ← Back
              </button>
              <button type="button" className="as-btn as-btn-primary" onClick={() => void submit()} disabled={submitting || !!stale}>
                {submitting ? 'Submitting…' : 'Submit requirements'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
