'use client'
import type { UserRow } from '@/lib/quickstart/onboarding/sections'

const MAX_USERS = 50

type Props = {
  id: string
  value: unknown
  disabled?: boolean
  maxUsers: number
  describedBy?: string
  invalid?: boolean
  onChange: (rows: UserRow[]) => void
}

export function toUserRows(v: unknown): UserRow[] {
  if (!Array.isArray(v)) return []
  return v.map((u) => ({
    name: typeof u?.name === 'string' ? u.name : '',
    email: typeof u?.email === 'string' ? u.email : '',
    role: u?.role === 'admin' ? 'admin' : 'regular',
    ...(typeof u?.team === 'string' ? { team: u.team } : {}),
  }))
}

const BLANK: UserRow = { name: '', email: '', role: 'regular' }

export default function UsersEditor({ id, value, disabled, maxUsers, describedBy, invalid, onChange }: Props) {
  const parsed = toUserRows(value)
  const rows = parsed.length ? parsed : [BLANK]
  const named = rows.filter((r) => r.name.trim() !== '').length
  const setRow = (i: number, patch: Partial<UserRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <div className="qs-users" id={id} aria-invalid={invalid ? true : undefined} aria-describedby={describedBy}>
      {rows.map((r, i) => (
        <div className="qs-user" key={i} role="group" aria-label={`Team member ${i + 1}`}>
          <div>
            <label className="qs-sublabel" htmlFor={`${id}-${i}-name`}>Name</label>
            <input id={`${id}-${i}-name`} className="qs-input" type="text" value={r.name} disabled={disabled} maxLength={200}
              autoComplete="off" onChange={(e) => setRow(i, { name: e.target.value })} />
          </div>
          <div>
            <label className="qs-sublabel" htmlFor={`${id}-${i}-email`}>Work email</label>
            <input id={`${id}-${i}-email`} className="qs-input" type="email" inputMode="email" value={r.email} disabled={disabled}
              maxLength={200} autoComplete="off" onChange={(e) => setRow(i, { email: e.target.value })} />
          </div>
          <div>
            <label className="qs-sublabel" htmlFor={`${id}-${i}-role`}>Access</label>
            <select id={`${id}-${i}-role`} className="qs-select" value={r.role} disabled={disabled}
              onChange={(e) => setRow(i, { role: e.target.value === 'admin' ? 'admin' : 'regular' })}>
              <option value="regular">Regular user</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="qs-sublabel" htmlFor={`${id}-${i}-team`}>Team (optional)</label>
            <input id={`${id}-${i}-team`} className="qs-input" type="text" value={r.team ?? ''} disabled={disabled} maxLength={200}
              onChange={(e) => setRow(i, { team: e.target.value })} />
          </div>
          {!disabled && rows.length > 1 && (
            <button type="button" className="qs-linkbtn qs-user-remove" aria-label={`Remove team member ${i + 1}`}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}>
              Remove
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <div className="qs-pipe-actions">
          <button type="button" className="qs-addbtn" disabled={rows.length >= MAX_USERS}
            onClick={() => onChange([...rows, { ...BLANK }])}>
            + Add a person
          </button>
          <span className={`qs-count${named > maxUsers ? ' over' : ''}`} aria-live="polite">
            {named} of {maxUsers} users included in your package
          </span>
        </div>
      )}
    </div>
  )
}
