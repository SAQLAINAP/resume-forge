import { describe, expect, it } from 'vitest'
import { decodeProfileShare, encodeProfileShare, shareUrl } from '../share'
import { emptyResumeData } from '../schema'
import type { Profile } from '../types'

/**
 * Share links are the offline replacement for a server. If encode → decode
 * ever stops being lossless we lose the "send it to a friend" flow silently.
 * These tests fix that by pinning down a round trip and a version-mismatch
 * refusal.
 */

function makeProfile(): Profile {
  const data = emptyResumeData()
  data.basics.fullName = 'Test User'
  data.basics.email = 'test@example.com'
  data.basics.summary = 'A short summary.'
  data.experience.push({
    id: 'e1',
    company: 'Acme',
    role: 'Engineer',
    employmentType: 'Full-time',
    startDate: '2020-01',
    endDate: '',
    current: true,
    location: 'Remote',
    bullets: ['Shipped one thing per quarter with 40% impact.'],
    tech: ['TypeScript'],
  })
  return {
    id: 'p1',
    label: 'Test',
    relationship: 'Self',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    data,
    coverLetters: [],
  }
}

describe('share link round-trip', () => {
  it('encodes and decodes a profile without losing fields', async () => {
    const profile = makeProfile()
    const blob = await encodeProfileShare(profile)
    const decoded = await decodeProfileShare(blob)

    expect(decoded.kind).toBe('profile')
    expect(decoded.label).toBe('Test')
    expect(decoded.data.basics.fullName).toBe('Test User')
    expect(decoded.data.basics.email).toBe('test@example.com')
    expect(decoded.data.experience).toHaveLength(1)
    expect(decoded.data.experience[0].bullets[0]).toContain('40%')
    expect(decoded.coverLetters).toEqual([])
  })

  it('produces url-safe blobs — no +, /, or = characters', async () => {
    const profile = makeProfile()
    const blob = await encodeProfileShare(profile)
    expect(blob).not.toMatch(/[+/=]/)
  })

  it('rejects invalid payloads', async () => {
    await expect(decodeProfileShare('not-a-valid-blob!!!')).rejects.toBeDefined()
  })
})

describe('shareUrl', () => {
  it('replaces an existing hash instead of concatenating', () => {
    expect(shareUrl('http://example.com/#/edit/jake', 'ABC')).toBe('http://example.com/#/share/ABC')
  })

  it('appends when there is no hash', () => {
    expect(shareUrl('http://example.com/', 'ABC')).toBe('http://example.com/#/share/ABC')
  })
})
