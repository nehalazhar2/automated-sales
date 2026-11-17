'use client'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { selectKeys, type SelectKeyState } from './selectKeys'

export type SelectOption = { value: string; label: string }

type Props = {
  id: string
  /** id of the visible <label>; combined with the trigger id so the value is announced too. */
  labelId: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  required?: boolean
  /** Renders a hidden input so server-action forms still post the value. */
  name?: string
}

const GAP = 4
const MAX_LIST = 320

type Placement = { flip: boolean; maxHeight: number }

/** Viewport rect intersected with every clipping ancestor (e.g. `.qs-ob{overflow:clip}`), minus a sticky header. */
function visibleBounds(el: HTMLElement) {
  let top = 0
  let bottom = window.innerHeight
  const header = document.querySelector<HTMLElement>('.site-header')
  if (header) {
    const pos = getComputedStyle(header).position
    if (pos === 'sticky' || pos === 'fixed') top = Math.max(top, header.getBoundingClientRect().bottom)
  }
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const cs = getComputedStyle(p)
    if (cs.overflowY !== 'visible') {
      const r = p.getBoundingClientRect()
      top = Math.max(top, r.top)
      bottom = Math.min(bottom, r.bottom)
    }
  }
  return { top, bottom }
}

export default function Select({
  id, labelId, options, value, onChange, placeholder = 'Choose…', disabled, invalid, describedBy, required, name,
}: Props) {
  // Optional fields keep a way to clear the answer (the native select had an empty "Choose…" option).
  const items: SelectOption[] = required ? options : [{ value: '', label: 'No answer' }, ...options]
  const selIdx = items.findIndex((o) => o.value === value)
  const current = selIdx >= 0 ? items[selIdx] : undefined
  const showPlaceholder = !current || current.value === ''

  const [st, setSt] = useState<SelectKeyState>({ open: false, active: 0, typed: '', typedAt: 0 })
  const [placement, setPlacement] = useState<Placement>({ flip: false, maxHeight: MAX_LIST })
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const listId = `${id}-list`
  const optId = (i: number) => `${id}-opt-${i}`
  // The clear option is excluded from type-ahead (empty label never matches).
  const labels = items.map((o) => (o.value === '' ? '' : o.label))

  const close = useCallback((refocus: boolean) => {
    setSt((s) => ({ ...s, open: false, typed: '' }))
    if (refocus) btn.current?.focus()
  }, [])

  function choose(i: number) {
    const o = items[i]
    if (o && o.value !== value) onChange(o.value)
  }

  function openList() {
    setSt((s) => ({ ...s, open: true, active: Math.max(selIdx, 0), typed: '' }))
  }

  // Position next to the trigger: below by default, flipped above when there is no room, never outside the visible area.
  const place = useCallback((allowScroll: boolean) => {
    const b = btn.current
    const ul = list.current
    if (!b || !ul) return
    const cap = Math.min(MAX_LIST, Math.floor(window.innerHeight * 0.5))
    const need = Math.min(ul.scrollHeight + 2, cap)
    const measure = () => {
      const t = b.getBoundingClientRect()
      const v = visibleBounds(b)
      return { below: v.bottom - t.bottom - GAP - 4, above: t.top - v.top - GAP - 4 }
    }
    let { below, above } = measure()
    if (allowScroll && Math.max(below, above) < Math.min(need, 160)) {
      // Not enough room either side: bring the trigger to the top of the visible area so the list can open below it.
      const v = visibleBounds(b)
      window.scrollBy({ top: b.getBoundingClientRect().top - (v.top + 8), behavior: 'instant' })
      ;({ below, above } = measure())
    }
    const flip = below < need && above > below
    const avail = flip ? above : below
    const maxHeight = Math.max(Math.min(cap, avail), 88)
    setPlacement((p) => (p.flip === flip && p.maxHeight === maxHeight ? p : { flip, maxHeight }))
  }, [])

  useLayoutEffect(() => {
    if (!st.open) return
    place(true)
    const onMove = () => place(false)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [st.open, place])

  // Keep the active option visible inside the list (scrolls the list only, never the page).
  useLayoutEffect(() => {
    if (!st.open) return
    const ul = list.current
    const li = ul?.children[st.active] as HTMLElement | undefined
    if (!ul || !li) return
    if (li.offsetTop < ul.scrollTop) ul.scrollTop = li.offsetTop
    else if (li.offsetTop + li.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTop = li.offsetTop + li.offsetHeight - ul.clientHeight
  }, [st.open, st.active, placement.maxHeight])

  // Tap / click outside closes.
  useEffect(() => {
    if (!st.open) return
    const down = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', down)
    return () => document.removeEventListener('pointerdown', down)
  }, [st.open, close])

  useEffect(() => {
    if (disabled && st.open) close(false)
  }, [disabled, st.open, close])

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || e.ctrlKey || e.metaKey || e.nativeEvent.isComposing) return
    let key = e.key
    if (e.altKey) {
      if (key !== 'ArrowDown' && key !== 'ArrowUp') return
      key = `Alt+${key}`
    }
    const r = selectKeys(st, key, { count: items.length, labels, selected: selIdx, now: Date.now() })
    if (r.state === st && !r.action) return
    if (key !== 'Tab') e.preventDefault()
    setSt(r.state)
    if (r.action === 'select' || r.action === 'selectAndTab') choose(st.active)
  }

  const open = st.open && !disabled

  return (
    <div
      className="qs-cselect"
      ref={wrap}
      onBlur={(e) => {
        if (st.open && !wrap.current?.contains(e.relatedTarget as Node | null)) close(false)
      }}
    >
      <button
        ref={btn}
        id={id}
        type="button"
        role="combobox"
        className="qs-cselect-btn"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optId(st.active) : undefined}
        aria-labelledby={`${labelId} ${id}`}
        aria-invalid={invalid ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        data-placeholder={showPlaceholder || undefined}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => { if (e.key === ' ') e.preventDefault() }}
        onClick={() => {
          // Keyboard Enter/Space are prevented in onKeyDown/onKeyUp, so any click here is a pointer or AT activation.
          if (open) close(false)
          else openList()
        }}
      >
        <span className="qs-cselect-val">{showPlaceholder ? placeholder : current!.label}</span>
        <svg className="qs-cselect-chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {open ? (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          onMouseDown={(e) => e.preventDefault()}
          className={`qs-cselect-list${placement.flip ? ' is-flip' : ''}`}
          style={{ maxHeight: placement.maxHeight }}
        >
          {items.map((o, i) => (
            <li
              key={o.value || '__empty'}
              id={optId(i)}
              role="option"
              aria-selected={i === selIdx}
              className={`qs-cselect-opt${i === st.active ? ' is-active' : ''}${i === selIdx ? ' is-selected' : ''}${o.value === '' ? ' is-empty' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => { if (i !== st.active) setSt((s) => ({ ...s, active: i })) }}
              onClick={() => { choose(i); close(true) }}
            >
              <span>{o.label}</span>
              {i === selIdx ? (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="qs-cselect-tick">
                  <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
