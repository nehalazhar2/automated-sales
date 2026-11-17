'use client'
import type { Question } from '@/lib/quickstart/qualification/questions'

export type FieldValue = string | string[] | undefined

export function fieldId(key: string) {
  return `qs-${key}`
}
export function errorId(key: string) {
  return `qs-${key}-err`
}

/** Toggle a multi-select value, keeping 'none' and 'not_sure' exclusive (R6). */
export function toggleMulti(current: string[], value: string, checked: boolean): string[] {
  if (!checked) return current.filter((v) => v !== value)
  if (value === 'none' || value === 'not_sure') return [value]
  return [...current.filter((v) => v !== 'none' && v !== 'not_sure'), value]
}

type Props = {
  question: Question
  value: FieldValue
  error?: string
  onChange: (key: Question['key'], value: string | string[]) => void
}

export default function Field({ question: q, value, error, onChange }: Props) {
  const id = fieldId(q.key)
  const eid = errorId(q.key)
  const hintId = `${id}-hint`
  const invalid = error ? true : undefined
  const describedBy = [q.hint && q.type !== 'multi' ? hintId : null, error ? eid : null].filter(Boolean).join(' ') || undefined
  const errorEl = error ? (
    <div id={eid} className="qs-error">{error}</div>
  ) : null
  const hintEl = q.hint ? <div id={hintId} className="qs-hint">{q.hint}</div> : null
  const options = q.options ?? []

  if (q.type === 'multi') {
    const selected = Array.isArray(value) ? value : []
    return (
      <fieldset
        className="qs-field"
        data-qs-field={q.key}
        aria-invalid={invalid}
        aria-describedby={[q.hint ? hintId : null, error ? eid : null].filter(Boolean).join(' ') || undefined}
      >
        <legend>{q.label}</legend>
        <div className="qs-chips">
          {options.map((o) => (
            <label key={o.value} className="qs-chip">
              <input
                type="checkbox"
                name={q.key}
                value={o.value}
                checked={selected.includes(o.value)}
                onChange={(e) => onChange(q.key, toggleMulti(selected, o.value, e.target.checked))}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        {hintEl}
        {errorEl}
      </fieldset>
    )
  }

  if (q.type === 'select' && options.length <= 4) {
    const current = typeof value === 'string' ? value : ''
    return (
      <fieldset className="qs-field" data-qs-field={q.key} aria-invalid={invalid} aria-describedby={describedBy}>
        <legend>{q.label}</legend>
        <div className="qs-chips">
          {options.map((o) => (
            <label key={o.value} className="qs-chip">
              <input
                type="radio"
                name={q.key}
                value={o.value}
                checked={current === o.value}
                onChange={() => onChange(q.key, o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        {hintEl}
        {errorEl}
      </fieldset>
    )
  }

  const str = typeof value === 'string' ? value : ''
  return (
    <div className="qs-field" data-qs-field={q.key}>
      <label className="qs-label" htmlFor={id}>{q.label}</label>
      {q.type === 'select' ? (
        <select
          id={id}
          className="qs-select"
          value={str}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(q.key, e.target.value)}
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : q.type === 'textarea' ? (
        <textarea
          id={id}
          className="qs-textarea"
          value={str}
          maxLength={2000}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(q.key, e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="qs-input"
          type={q.type === 'email' ? 'email' : q.type === 'url' ? 'text' : 'text'}
          inputMode={q.type === 'email' ? 'email' : q.type === 'url' ? 'url' : undefined}
          autoComplete={q.key === 'email' ? 'email' : q.key === 'name' ? 'name' : q.key === 'company' ? 'organization' : q.key === 'website' ? 'url' : 'off'}
          value={str}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(q.key, e.target.value)}
        />
      )}
      {hintEl}
      {errorEl}
    </div>
  )
}
