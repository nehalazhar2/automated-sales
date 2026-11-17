import { describe, expect, it } from 'vitest'
import { selectKeys, type SelectKeyState } from '@/components/quickstart/selectKeys'

const labels = ['Apple', 'Avocado', 'Banana', 'Blueberry', 'Cherry', 'Date', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Nectarine']
const ctx = (over: Partial<{ selected: number; now: number; count: number; labels: string[] }> = {}) => ({
  count: labels.length, labels, selected: -1, now: 1000, ...over,
})
const closed: SelectKeyState = { open: false, active: 0, typed: '', typedAt: 0 }
const open = (active = 0): SelectKeyState => ({ open: true, active, typed: '', typedAt: 0 })

describe('selectKeys navigation', () => {
  it('Down/Up move within bounds', () => {
    expect(selectKeys(open(0), 'ArrowDown', ctx()).state.active).toBe(1)
    expect(selectKeys(open(11), 'ArrowDown', ctx()).state.active).toBe(11)
    expect(selectKeys(open(3), 'ArrowUp', ctx()).state.active).toBe(2)
    expect(selectKeys(open(0), 'ArrowUp', ctx()).state.active).toBe(0)
  })
  it('Home/End/PageUp/PageDown', () => {
    expect(selectKeys(open(5), 'Home', ctx()).state.active).toBe(0)
    expect(selectKeys(open(5), 'End', ctx()).state.active).toBe(11)
    expect(selectKeys(open(11), 'PageUp', ctx()).state.active).toBe(1)
    expect(selectKeys(open(3), 'PageUp', ctx()).state.active).toBe(0)
    expect(selectKeys(open(3), 'PageDown', ctx()).state.active).toBe(11)
    expect(selectKeys(open(0), 'PageDown', ctx()).state.active).toBe(10)
  })
  it('opens from closed with Enter, Space, Alt+Down, Down, Up on the selected option', () => {
    for (const k of ['Enter', ' ', 'Alt+ArrowDown', 'ArrowDown', 'ArrowUp']) {
      const r = selectKeys(closed, k, ctx({ selected: 4 }))
      expect(r.action).toBe('open')
      expect(r.state.open).toBe(true)
      expect(r.state.active).toBe(4)
    }
  })
  it('opens on the first option when nothing is selected', () => {
    expect(selectKeys(closed, 'ArrowDown', ctx()).state.active).toBe(0)
  })
  it('Home/End while closed open at the ends', () => {
    expect(selectKeys(closed, 'End', ctx()).state).toMatchObject({ open: true, active: 11 })
  })
  it('Enter/Space select when open; Alt+Up selects', () => {
    expect(selectKeys(open(3), 'Enter', ctx()).action).toBe('select')
    expect(selectKeys(open(3), ' ', ctx()).action).toBe('select')
    expect(selectKeys(open(3), 'Alt+ArrowUp', ctx()).action).toBe('select')
    expect(selectKeys(open(3), 'Enter', ctx()).state.open).toBe(false)
  })
  it('Escape closes without selecting', () => {
    const r = selectKeys(open(3), 'Escape', ctx())
    expect(r.action).toBe('close')
    expect(r.state.open).toBe(false)
  })
  it('Escape while closed does nothing', () => {
    expect(selectKeys(closed, 'Escape', ctx()).action).toBeUndefined()
  })
  it('Tab selects the active option and lets focus move on', () => {
    const r = selectKeys(open(2), 'Tab', ctx())
    expect(r.action).toBe('selectAndTab')
    expect(r.state.open).toBe(false)
  })
  it('Tab while closed does nothing', () => {
    expect(selectKeys(closed, 'Tab', ctx()).action).toBeUndefined()
  })
  it('handles an empty list', () => {
    const r = selectKeys(open(0), 'ArrowDown', ctx({ count: 0, labels: [] }))
    expect(r.state.active).toBe(0)
    expect(selectKeys(open(0), 'Enter', ctx({ count: 0, labels: [] })).action).toBe('close')
  })
})

describe('selectKeys type-ahead', () => {
  it('jumps to the first match', () => {
    expect(selectKeys(open(0), 'g', ctx()).state.active).toBe(7)
    expect(selectKeys(open(0), 'N', ctx()).state.active).toBe(11)
  })
  it('opens the list when typing while closed', () => {
    const r = selectKeys(closed, 'k', ctx())
    expect(r.action).toBe('open')
    expect(r.state).toMatchObject({ open: true, active: 8 })
  })
  it('repeated letter cycles through matches and wraps', () => {
    let s = open(0)
    s = selectKeys(s, 'b', ctx({ now: 1000 })).state
    expect(s.active).toBe(2)
    s = selectKeys(s, 'b', ctx({ now: 1100 })).state
    expect(s.active).toBe(3)
    s = selectKeys(s, 'b', ctx({ now: 1200 })).state
    expect(s.active).toBe(2)
  })
  it('multi-letter buffer matches the prefix', () => {
    let s = open(0)
    s = selectKeys(s, 'b', ctx({ now: 1000 })).state
    s = selectKeys(s, 'l', ctx({ now: 1100 })).state
    expect(s.typed).toBe('bl')
    expect(s.active).toBe(3)
  })
  it('buffer resets after 500ms', () => {
    let s = open(0)
    s = selectKeys(s, 'b', ctx({ now: 1000 })).state
    s = selectKeys(s, 'l', ctx({ now: 1600 })).state
    expect(s.typed).toBe('l')
    expect(s.active).toBe(9)
  })
  it('skips empty labels (the clear option) in type-ahead', () => {
    const withClear = ['', 'Cherry', 'Date']
    const r = selectKeys(open(2), 'c', { count: 3, labels: withClear, selected: -1, now: 1000 })
    expect(r.state.active).toBe(1)
    expect(selectKeys(open(1), 'c', { count: 3, labels: withClear, selected: -1, now: 1000 }).state.active).toBe(1)
  })
  it('no match keeps the active option', () => {
    expect(selectKeys(open(4), 'z', ctx()).state.active).toBe(4)
  })
  it('ignores modified keys and unknown named keys', () => {
    expect(selectKeys(open(4), 'F5', ctx()).state).toEqual(open(4))
    expect(selectKeys(open(4), 'Ctrl+a', ctx()).state).toEqual(open(4))
  })
})
