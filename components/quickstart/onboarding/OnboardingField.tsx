'use client'
import { NOT_SURE, type OnbField } from '@/lib/quickstart/onboarding/sections'
import type { PackageLimits } from '@/lib/quickstart/packages'
import { errorId, fieldId, toggleMulti } from '../Field'
import Select from '../Select'
import PipelinesEditor from './PipelinesEditor'
import UsersEditor from './UsersEditor'

type Props = {
  field: OnbField
  value: unknown
  error?: string
  pkg: PackageLimits
  onChange: (key: string, value: unknown) => void
  /** Toggle 'not sure'; the form remembers the previous answer so unticking restores it. */
  onNotSure: (key: string, checked: boolean, empty: unknown) => void
}

function emptyFor(f: OnbField): unknown {
  return f.type === 'multi' || f.type === 'users' || f.type === 'pipelines' ? [] : ''
}

export default function OnboardingField({ field: f, value, error, pkg, onChange, onNotSure }: Props) {
  const id = fieldId(f.key)
  const eid = errorId(f.key)
  const hintId = `${id}-hint`
  const notSure = value === NOT_SURE
  const invalid = error ? true : undefined
  const describedBy = [f.hint ? hintId : null, error ? eid : null].filter(Boolean).join(' ') || undefined
  const hintEl = f.hint ? <div id={hintId} className="qs-hint">{f.hint}</div> : null
  // Only the generic "required" message is rewritten; any other server message is shown as is.
  const isRequiredMsg = !!error && error.startsWith('Please answer')
  const errText =
    isRequiredMsg && f.type === 'users' ? 'Add at least one person’s name, or tick Not sure.'
    : isRequiredMsg && f.type === 'pipelines' ? 'Give your sales process a name, or tick Not sure.'
    : error
  const errorEl = error ? <div id={eid} className="qs-error">{errText}</div> : null
  const req = f.required ? <span className="qs-req" aria-hidden="true"> *</span> : null
  const aReq = f.required ? true : undefined
  const options = f.options ?? []
  const set = (v: unknown) => onChange(f.key, v)

  const notSureEl = f.allowNotSure ? (
    <label className="qs-notsure">
      <input
        type="checkbox"
        checked={notSure}
        onChange={(e) => onNotSure(f.key, e.target.checked, emptyFor(f))}
      />
      <span>Not sure — let&apos;s cover it on the discovery call<span className="qs-vh"> ({f.label})</span></span>
    </label>
  ) : null

  const str = typeof value === 'string' && !notSure ? value : ''

  if (f.type === 'multi' || (f.type === 'select' && options.length <= 4)) {
    const multi = f.type === 'multi'
    const selected = multi && Array.isArray(value) ? (value as string[]) : []
    return (
      <fieldset className="qs-field" data-qs-field={f.key} aria-invalid={invalid} aria-describedby={describedBy}>
        <legend>{f.label}{req}</legend>
        <div className="qs-chips">
          {options.map((o) => (
            <label key={o.value} className="qs-chip">
              <input
                type={multi ? 'checkbox' : 'radio'}
                required={!multi && f.required ? true : undefined}
                name={f.key}
                value={o.value}
                disabled={notSure}
                checked={multi ? selected.includes(o.value) : str === o.value}
                onChange={(e) => (multi ? set(toggleMulti(selected, o.value, e.target.checked)) : set(o.value))}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        {hintEl}
        {notSureEl}
        {errorEl}
      </fieldset>
    )
  }

  if (f.type === 'users' || f.type === 'pipelines') {
    return (
      <fieldset className="qs-field" data-qs-field={f.key}>
        <legend>{f.label}{req}</legend>
        {f.type === 'users' ? (
          <UsersEditor id={id} value={value} disabled={notSure} maxUsers={pkg.maxUsers}
            describedBy={describedBy} invalid={isRequiredMsg} emailInvalid={!!error && !isRequiredMsg} onChange={set} />
        ) : (
          <PipelinesEditor id={id} value={value} disabled={notSure} suggestions={f.suggestions}
            maxPipelines={pkg.maxPipelines} maxStages={pkg.maxStagesPerPipeline}
            describedBy={describedBy} invalid={!!error} onChange={set} />
        )}
        {hintEl}
        {notSureEl}
        {errorEl}
      </fieldset>
    )
  }

  return (
    <div className="qs-field" data-qs-field={f.key}>
      <label className="qs-label" id={`${id}-label`} htmlFor={id}>{f.label}{req}</label>
      {f.type === 'select' ? (
        <Select id={id} labelId={`${id}-label`} options={options} value={str} disabled={notSure} invalid={!!invalid}
          required={f.required} describedBy={describedBy} onChange={set} />
      ) : f.type === 'textarea' ? (
        <textarea id={id} className="qs-textarea" value={str} disabled={notSure} maxLength={2000}
          aria-invalid={invalid} aria-required={aReq} aria-describedby={describedBy} onChange={(e) => set(e.target.value)} />
      ) : (
        <input
          id={id}
          className="qs-input"
          type={f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
          inputMode={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : undefined}
          autoComplete="off"
          maxLength={2000}
          value={f.type === 'number' && typeof value === 'number' ? String(value) : str}
          disabled={notSure}
          aria-invalid={invalid}
          aria-required={aReq}
          aria-describedby={describedBy}
          onChange={(e) => set(e.target.value)}
        />
      )}
      {hintEl}
      {notSureEl}
      {errorEl}
    </div>
  )
}
