/** Pure keyboard / type-ahead reducer for the QuickStart custom select (WAI-ARIA select-only combobox). */

export type SelectKeyState = { open: boolean; active: number; typed: string; typedAt: number }
export type SelectKeyAction = 'open' | 'close' | 'select' | 'selectAndTab'
export type SelectKeyCtx = { count: number; labels: string[]; selected: number; now: number }
export type SelectKeyResult = { state: SelectKeyState; action?: SelectKeyAction }

export const TYPEAHEAD_MS = 500
const PAGE = 10

const clamp = (n: number, count: number) => Math.max(0, Math.min(count - 1, n))

function findMatch(labels: string[], typed: string, active: number): number {
  const n = labels.length
  if (!n) return -1
  const repeated = typed.length > 1 && [...typed].every((c) => c === typed[0])
  const needle = repeated ? typed[0] : typed
  // A single (or repeated) letter cycles from the next option; a longer prefix may keep the current one.
  const start = needle.length === 1 ? active + 1 : active
  for (let i = 0; i < n; i++) {
    const idx = (((start + i) % n) + n) % n
    if (labels[idx] && labels[idx].toLowerCase().startsWith(needle)) return idx
  }
  return -1
}

export function selectKeys(state: SelectKeyState, key: string, ctx: SelectKeyCtx): SelectKeyResult {
  const { count } = ctx
  const start = ctx.selected >= 0 && ctx.selected < count ? ctx.selected : 0

  if (!state.open) {
    switch (key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Alt+ArrowDown':
        return { state: { ...state, open: true, active: start, typed: '' }, action: 'open' }
      case 'Home':
        return { state: { ...state, open: true, active: 0, typed: '' }, action: 'open' }
      case 'End':
        return { state: { ...state, open: true, active: clamp(count - 1, count), typed: '' }, action: 'open' }
    }
    if (key.length === 1) {
      const r = typeAhead({ ...state, active: start }, key, ctx)
      return { state: { ...r, open: true }, action: 'open' }
    }
    return { state }
  }

  switch (key) {
    case 'ArrowDown': return { state: { ...state, active: clamp(state.active + 1, count), typed: '' } }
    case 'ArrowUp': return { state: { ...state, active: clamp(state.active - 1, count), typed: '' } }
    case 'Home': return { state: { ...state, active: 0, typed: '' } }
    case 'End': return { state: { ...state, active: clamp(count - 1, count), typed: '' } }
    case 'PageDown': return { state: { ...state, active: clamp(state.active + PAGE, count), typed: '' } }
    case 'PageUp': return { state: { ...state, active: clamp(state.active - PAGE, count), typed: '' } }
    case 'Escape': return { state: { ...state, open: false, typed: '' }, action: 'close' }
    case 'Enter':
    case ' ':
    case 'Alt+ArrowUp':
      return { state: { ...state, open: false, typed: '' }, action: count ? 'select' : 'close' }
    case 'Tab':
      return { state: { ...state, open: false, typed: '' }, action: count ? 'selectAndTab' : 'close' }
  }
  if (key.length === 1 && key !== ' ') return { state: typeAhead(state, key, ctx) }
  return { state }
}

function typeAhead(state: SelectKeyState, key: string, ctx: SelectKeyCtx): SelectKeyState {
  const fresh = ctx.now - state.typedAt > TYPEAHEAD_MS
  const typed = (fresh ? '' : state.typed) + key.toLowerCase()
  const hit = findMatch(ctx.labels, typed, state.active)
  return { ...state, typed, typedAt: ctx.now, active: hit >= 0 ? hit : state.active }
}
