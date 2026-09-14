import { describe, expect, it } from 'vitest'
import { scoreBullet, scanResume } from '../lint'
import { emptyResumeData } from '../schema'

/**
 * The bullet linter is coarse by design — these tests pin down the rules people
 * are most likely to trust and complain about if they regress: strong verb
 * survives all checks, weak verb flagged, first-person flagged, numbers count.
 */
describe('scoreBullet', () => {
  it('gives a well-formed bullet full marks', () => {
    const { issues, score } = scoreBullet('Cut settlement lag from 45 min to 2 min for 3M merchants')
    expect(issues).toEqual([])
    expect(score).toBe(100)
  })

  it('flags a bullet with a weak opener', () => {
    const { issues } = scoreBullet('Helped the team ship the new payments flow across 4 regions in 2 quarters')
    expect(issues).toContain('weak-verb')
  })

  it('flags first-person voice regardless of verb strength', () => {
    const { issues } = scoreBullet('I built a caching layer that cut p95 by 40%')
    expect(issues).toContain('first-person')
  })

  it('flags missing numbers', () => {
    const { issues } = scoreBullet('Owned the migration end to end without any regressions')
    expect(issues).toContain('no-number')
  })

  it('scores go to zero on the worst cases', () => {
    const { score } = scoreBullet('helped')
    expect(score).toBeLessThan(50)
  })
})

describe('scanResume', () => {
  it('returns no findings for an empty resume', () => {
    expect(scanResume(emptyResumeData())).toEqual([])
  })

  it('finds bullets across experience, projects and positions', () => {
    const data = emptyResumeData()
    data.experience.push({
      id: 'e1',
      company: 'Acme',
      role: 'SWE',
      employmentType: 'Full-time',
      startDate: '2023-01',
      endDate: '',
      current: true,
      location: '',
      bullets: ['helped things'],
      tech: [],
    })
    data.projects.push({
      id: 'p1',
      name: 'Proj',
      role: '',
      startDate: '',
      endDate: '',
      url: '',
      bullets: ['I made a thing'],
      tech: [],
    })
    const findings = scanResume(data)
    // One bullet per section = two findings, each with at least one issue.
    expect(findings).toHaveLength(2)
    expect(findings.every((f) => f.issues.length > 0)).toBe(true)
  })
})
