import { describe, expect, it } from 'vitest'
import { importJsonResume, looksLikeJsonResume } from '../import-jsonresume'

describe('looksLikeJsonResume', () => {
  it('accepts real-shaped payloads', () => {
    expect(looksLikeJsonResume({ basics: { name: 'x' } })).toBe(true)
    expect(looksLikeJsonResume({ work: [] })).toBe(true)
  })

  it('rejects non-objects and unrelated shapes', () => {
    expect(looksLikeJsonResume(null)).toBe(false)
    expect(looksLikeJsonResume('hi')).toBe(false)
    expect(looksLikeJsonResume({ hello: 'world' })).toBe(false)
  })
})

describe('importJsonResume', () => {
  it('maps a minimal JSON Resume payload into ResumeData', () => {
    const { label, data } = importJsonResume({
      basics: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        summary: 'Analytical engine pioneer',
        location: { city: 'London', country: 'UK' },
        profiles: [{ network: 'GitHub', url: 'https://github.com/ada' }],
      },
      work: [
        {
          name: 'Analytical Engine Co',
          position: 'Programmer',
          startDate: '1843-01',
          endDate: '1852-01',
          summary: 'Wrote the first algorithm.',
          highlights: ['Composed Note G for the analytical engine.'],
        },
      ],
      skills: [{ name: 'Languages', keywords: ['Ada', 'English'] }],
      languages: [{ language: 'English', fluency: 'Native' }],
    })

    expect(label).toBe('Ada Lovelace')
    expect(data.basics.fullName).toBe('Ada Lovelace')
    expect(data.basics.location).toContain('London')
    expect(data.basics.links.some((l) => l.kind === 'github')).toBe(true)

    expect(data.experience).toHaveLength(1)
    expect(data.experience[0].company).toBe('Analytical Engine Co')
    // summary + highlight both become bullets.
    expect(data.experience[0].bullets).toHaveLength(2)

    expect(data.skills[0].items).toEqual(['Ada', 'English'])
    expect(data.languages[0].proficiency).toBe('Native')

    // CV-only sections should be backfilled empty rather than undefined.
    expect(data.grants).toEqual([])
    expect(data.talks).toEqual([])
  })
})
