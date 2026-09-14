import { describe, expect, it } from 'vitest'
import { matchKeywords, resumeTokens, tokenise } from '../keywords'
import { emptyResumeData } from '../schema'

/**
 * Keyword matching drives the JD panel — regressions here silently break the
 * feature (matches drop to zero without an obvious error). Cover the tokenizer
 * quirks that come up in real JDs: dotted acronyms, hyphenated compounds,
 * stopword suppression.
 */
describe('tokenise', () => {
  it('preserves technical tokens with dots, slashes and hashes', () => {
    const tokens = tokenise('React.js and Node.js with CI/CD and C#/.NET')
    expect(tokens).toContain('react.js')
    expect(tokens).toContain('node.js')
    expect(tokens).toContain('ci/cd')
    expect(tokens).toContain('c#/.net')
  })

  it('strips stopwords', () => {
    const tokens = tokenise('You will work with the team on the project')
    // 'work', 'team' are on the JD-noise stoplist.
    expect(tokens).not.toContain('work')
    expect(tokens).not.toContain('team')
    expect(tokens).not.toContain('the')
  })
})

describe('matchKeywords', () => {
  it('returns 0 coverage for an empty JD', () => {
    const { matches, coverage } = matchKeywords('', emptyResumeData())
    expect(matches).toEqual([])
    expect(coverage).toBe(0)
  })

  it('intersects the JD against the resume tokens', () => {
    const data = emptyResumeData()
    data.skills.push({ id: 's1', category: 'Languages', items: ['Python', 'TypeScript'] })
    data.experience.push({
      id: 'e1',
      company: 'Acme',
      role: 'Backend engineer',
      employmentType: 'Full-time',
      startDate: '2022-01',
      endDate: '',
      current: true,
      location: '',
      bullets: ['Built a Postgres pipeline for analytics'],
      tech: ['Postgres', 'Kafka'],
    })
    const jd = 'Looking for a Python engineer with Postgres and Kafka experience. TypeScript a plus.'
    const { matches, coverage } = matchKeywords(jd, data)
    expect(coverage).toBeGreaterThan(0)
    const present = new Set(matches.filter((m) => m.present).map((m) => m.token))
    expect(present.has('python')).toBe(true)
    expect(present.has('postgres')).toBe(true)
    expect(present.has('kafka')).toBe(true)
  })
})

describe('resumeTokens', () => {
  it('deduplicates tokens across sections', () => {
    const data = emptyResumeData()
    data.skills.push({ id: 's1', category: 'Skills', items: ['Python'] })
    data.experience.push({
      id: 'e1',
      company: 'Acme',
      role: 'SWE',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      bullets: ['Wrote Python code'],
      tech: ['Python'],
    })
    const bag = resumeTokens(data)
    // Same token from three sources — still one entry in the set.
    expect(bag.has('python')).toBe(true)
  })
})
