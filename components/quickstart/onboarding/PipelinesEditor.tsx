'use client'
import { useEffect, useRef } from 'react'
import type { PipelineRow } from '@/lib/quickstart/onboarding/sections'

const MAX_PIPELINES = 10
const MAX_STAGES = 20

type Props = {
  id: string
  value: unknown
  disabled?: boolean
  suggestions?: string[]
  maxPipelines: number
  maxStages: number
  describedBy?: string
  invalid?: boolean
  onChange: (rows: PipelineRow[]) => void
}

const EMPTY: PipelineRow = { name: '', stages: [] }

export function toPipelineRows(v: unknown): PipelineRow[] {
  if (!Array.isArray(v)) return []
  return v.map((p) => ({
    name: typeof p?.name === 'string' ? p.name : '',
    stages: Array.isArray(p?.stages) ? p.stages.filter((s: unknown): s is string => typeof s === 'string') : [],
  }))
}

export default function PipelinesEditor({
  id, value, disabled, suggestions = [], maxPipelines, maxStages, describedBy, invalid, onChange,
}: Props) {
  const parsed = toPipelineRows(value)
  const rows = parsed.length ? parsed : [EMPTY]
  const root = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingFocus.current) return
    const el = root.current?.querySelector<HTMLElement>(`[data-focus="${pendingFocus.current}"]`)
    pendingFocus.current = null
    el?.focus()
  })

  const setRow = (pi: number, row: PipelineRow) => onChange(rows.map((r, i) => (i === pi ? row : r)))

  function move(pi: number, si: number, dir: -1 | 1) {
    const stages = [...rows[pi].stages]
    const to = si + dir
    if (to < 0 || to >= stages.length) return
    ;[stages[si], stages[to]] = [stages[to], stages[si]]
    pendingFocus.current = `p${pi}-s${to}-${dir === -1 ? 'up' : 'down'}`
    // If the button is now disabled at an edge, fall back to the other direction.
    if ((dir === -1 && to === 0) || (dir === 1 && to === stages.length - 1)) {
      pendingFocus.current = `p${pi}-s${to}-${dir === -1 ? 'down' : 'up'}`
    }
    setRow(pi, { ...rows[pi], stages })
  }

  return (
    <div ref={root} className="qs-pipes" id={id} aria-invalid={invalid ? true : undefined} aria-describedby={describedBy}>
      {rows.map((p, pi) => {
        const count = p.stages.filter((s) => s.trim() !== '').length
        const over = count > maxStages
        return (
          <div className="qs-pipe" key={pi}>
            <div className="qs-pipe-head">
              <label className="qs-sublabel" htmlFor={`${id}-p${pi}-name`}>
                {rows.length > 1 ? `Sales process ${pi + 1}: name` : 'Name of your sales process'}
              </label>
              {rows.length > 1 && !disabled && (
                <button
                  type="button"
                  className="qs-linkbtn"
                  onClick={() => onChange(rows.filter((_, i) => i !== pi))}
                  aria-label={`Remove sales process ${pi + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              id={`${id}-p${pi}-name`}
              className="qs-input"
              type="text"
              value={p.name}
              disabled={disabled}
              maxLength={200}
              placeholder="e.g. New business"
              onChange={(e) => setRow(pi, { ...p, name: e.target.value })}
            />
            <div className="qs-sublabel" id={`${id}-p${pi}-stages`}>Steps, in order</div>
            <ol className="qs-stagelist" aria-labelledby={`${id}-p${pi}-stages`}>
              {p.stages.map((s, si) => (
                <li className="qs-stage" key={si}>
                  <span className="qs-stage-n" aria-hidden="true">{si + 1}</span>
                  <input
                    className="qs-input"
                    type="text"
                    data-focus={`p${pi}-s${si}-input`}
                    value={s}
                    disabled={disabled}
                    maxLength={200}
                    aria-label={`Step ${si + 1}${rows.length > 1 ? ` of sales process ${pi + 1}` : ''}`}
                    onChange={(e) => setRow(pi, { ...p, stages: p.stages.map((x, i) => (i === si ? e.target.value : x)) })}
                  />
                  <div className="qs-stage-btns">
                    <button
                      type="button"
                      className="qs-iconbtn"
                      data-focus={`p${pi}-s${si}-up`}
                      disabled={disabled || si === 0}
                      aria-label={`Move step ${si + 1} up`}
                      onClick={() => move(pi, si, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="qs-iconbtn"
                      data-focus={`p${pi}-s${si}-down`}
                      disabled={disabled || si === p.stages.length - 1}
                      aria-label={`Move step ${si + 1} down`}
                      onClick={() => move(pi, si, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="qs-iconbtn"
                      disabled={disabled}
                      aria-label={`Remove step ${si + 1}`}
                      onClick={() => {
                        pendingFocus.current = `p${pi}-add`
                        setRow(pi, { ...p, stages: p.stages.filter((_, i) => i !== si) })
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <div className="qs-pipe-actions">
              <button
                type="button"
                className="qs-addbtn"
                data-focus={`p${pi}-add`}
                disabled={disabled || p.stages.length >= MAX_STAGES}
                onClick={() => {
                  pendingFocus.current = `p${pi}-s${p.stages.length}-input`
                  setRow(pi, { ...p, stages: [...p.stages, ''] })
                }}
              >
                + Add a step
              </button>
              <span className={`qs-count${over ? ' over' : ''}`} aria-live="polite">
                {count} of {maxStages} steps included in your package
              </span>
            </div>
            {suggestions.length > 0 && !disabled && (
              <div className="qs-suggest">
                <span className="qs-sublabel">Suggested steps</span>
                <div className="qs-chips">
                  {suggestions.map((sg) => (
                    <button
                      key={sg}
                      type="button"
                      className="qs-sugchip"
                      disabled={p.stages.length >= MAX_STAGES}
                      onClick={() => setRow(pi, { ...p, stages: [...p.stages, sg] })}
                    >
                      + {sg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
      {!disabled && (
        <div className="qs-pipe-actions">
          <button
            type="button"
            className="qs-addbtn"
            disabled={rows.length >= MAX_PIPELINES}
            onClick={() => onChange([...rows, { name: '', stages: [] }])}
          >
            + Add another sales process
          </button>
          <span className={`qs-count${rows.filter((r) => r.name.trim() || r.stages.length).length > maxPipelines ? ' over' : ''}`}>
            {rows.filter((r) => r.name.trim() || r.stages.length).length} of {maxPipelines} sales process{maxPipelines === 1 ? '' : 'es'} included
          </span>
        </div>
      )}
    </div>
  )
}
