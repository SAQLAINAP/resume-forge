import { describe, expect, it } from 'vitest'
import { activeSummary } from '../variants'
import type { Basics } from '../types'

function makeBasics(patch: Partial<Basics> = {}): Basics {
  return {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
    summary: 'base',
    links: [],
    summaryVariants: [],
    summaryVariantIndex: null,
    ...patch,
  }
}

describe('activeSummary', () => {
  it('returns the base summary when no variant is active', () => {
    expect(activeSummary(makeBasics())).toBe('base')
  })

  it('returns the selected variant when in range', () => {
    const b = makeBasics({ summaryVariants: ['first', 'second'], summaryVariantIndex: 1 })
    expect(activeSummary(b)).toBe('second')
  })

  it('falls back to the base summary if the variant is blank', () => {
    const b = makeBasics({ summaryVariants: ['   '], summaryVariantIndex: 0 })
    expect(activeSummary(b)).toBe('base')
  })

  it('falls back if the index is out of range', () => {
    const b = makeBasics({ summaryVariants: ['only'], summaryVariantIndex: 5 })
    expect(activeSummary(b)).toBe('base')
  })
})
