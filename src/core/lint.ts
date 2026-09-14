import type { ResumeData } from './types'

/**
 * Rule-based bullet linter. Everything here is intentionally coarse — the goal
 * is to flag the three or four things that reliably weaken bullets (no verb,
 * no number, hedging language, monster length) without pretending to be an LLM.
 * Runs on-device in microseconds so we can score every bullet on every keystroke.
 */

export type BulletIssue =
  | 'no-verb'
  | 'weak-verb'
  | 'no-number'
  | 'too-long'
  | 'too-short'
  | 'first-person'
  | 'hedging'
  | 'ends-with-period-only'

export interface BulletFinding {
  section: 'experience' | 'projects' | 'positions'
  itemId: string
  itemLabel: string
  index: number
  text: string
  issues: BulletIssue[]
  score: number
}

// Strong action verbs — a small vocabulary of "past-tense achievements". Not
// exhaustive; matches the head token, so "led", "leads", "leading" all pass.
const STRONG_VERBS = new Set([
  'led', 'built', 'shipped', 'designed', 'architected', 'launched', 'owned', 'delivered',
  'reduced', 'cut', 'grew', 'increased', 'improved', 'accelerated', 'scaled', 'migrated',
  'rewrote', 'refactored', 'implemented', 'developed', 'created', 'automated', 'streamlined',
  'introduced', 'drove', 'spearheaded', 'coordinated', 'negotiated', 'analysed', 'analyzed',
  'evaluated', 'audited', 'optimised', 'optimized', 'debugged', 'diagnosed', 'unblocked',
  'mentored', 'coached', 'trained', 'hired', 'onboarded', 'presented', 'authored', 'published',
  'proposed', 'prototyped', 'benchmarked', 'measured', 'quantified', 'wrote', 'released',
  'deployed', 'orchestrated', 'consolidated', 'partnered', 'championed', 'saved', 'earned',
  'won', 'ranked', 'awarded', 'secured', 'raised', 'sold', 'closed', 'expanded',
  'reorganised', 'reorganized', 'transformed', 'converted', 'boosted', 'eliminated',
  'resolved', 'fixed', 'patched', 'tuned', 'profiled', 'instrumented', 'debounced',
])

// Weak/vague verbs — pass the "starts with a verb" check but say very little.
const WEAK_VERBS = new Set([
  'helped', 'worked', 'assisted', 'participated', 'contributed', 'supported', 'handled',
  'managed', 'did', 'was', 'were', 'am', 'am,', 'made', 'used', 'got', 'took', 'gave',
  'responsible', 'tasked', 'involved',
])

// Hedges downgrade a bullet even when the rest reads well.
const HEDGES = ['possibly', 'maybe', 'somewhat', 'kind of', 'sort of', 'various', 'several', 'many', 'a lot of', 'multiple']

const FIRST_PERSON = /\b(i|me|my|mine|we|our|us)\b/i
const NUMBER_LIKE = /(\d[\d,.]*\s*(?:%|k|m|bn|ms|s|min|hr|hrs|x|×)?)|(\bp\d{2}\b)/i

function normHead(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  // Very small lemmatiser: strip common inflections.
  if (STRONG_VERBS.has(w)) return w
  if (w.endsWith('ing') && STRONG_VERBS.has(w.slice(0, -3))) return w.slice(0, -3)
  if (w.endsWith('s') && STRONG_VERBS.has(w.slice(0, -1))) return w.slice(0, -1)
  return w
}

export function scoreBullet(raw: string): { issues: BulletIssue[]; score: number } {
  const text = raw.trim()
  const issues: BulletIssue[] = []
  if (!text) return { issues: [], score: 0 }

  const words = text.split(/\s+/)
  const first = normHead(words[0] ?? '')

  if (WEAK_VERBS.has(first)) issues.push('weak-verb')
  else if (!STRONG_VERBS.has(first)) issues.push('no-verb')

  if (!NUMBER_LIKE.test(text)) issues.push('no-number')
  if (words.length > 32) issues.push('too-long')
  if (words.length < 5) issues.push('too-short')
  if (FIRST_PERSON.test(text)) issues.push('first-person')

  const lower = text.toLowerCase()
  if (HEDGES.some((h) => lower.includes(h))) issues.push('hedging')

  // A bullet that is just prose ("I did X, then Y.") without a metric ends up
  // reading like a filler line — flag it lightly.
  if (text.endsWith('.') && !NUMBER_LIKE.test(text) && words.length < 12) {
    issues.push('ends-with-period-only')
  }

  // Score: start at 100, subtract per issue with different weights.
  const weight: Record<BulletIssue, number> = {
    'no-verb': 30,
    'weak-verb': 20,
    'no-number': 20,
    'too-long': 15,
    'too-short': 15,
    'first-person': 10,
    hedging: 8,
    'ends-with-period-only': 4,
  }
  const score = Math.max(0, 100 - issues.reduce((sum, i) => sum + weight[i], 0))
  return { issues, score }
}

export const ISSUE_COPY: Record<BulletIssue, string> = {
  'no-verb': 'Start with a strong past-tense verb (Built, Cut, Owned, Migrated).',
  'weak-verb': 'Swap the opener for a stronger verb — "helped/managed" is filler.',
  'no-number': 'Add a metric: percent, latency, throughput, dollar figure, team size.',
  'too-long': 'Long bullets get skimmed. Split it or trim it under ~30 words.',
  'too-short': 'Too terse to say anything — add the mechanism or the outcome.',
  'first-person': 'Résumés drop "I / we / my". Every bullet is already about you.',
  hedging: 'Cut the hedge ("several", "various", "many") and name the count.',
  'ends-with-period-only': 'Reads like prose. Add a number or a mechanism.',
}

export function scanResume(data: ResumeData): BulletFinding[] {
  const findings: BulletFinding[] = []

  for (const e of data.experience) {
    e.bullets.forEach((b, i) => {
      if (!b.trim()) return
      const { issues, score } = scoreBullet(b)
      findings.push({
        section: 'experience',
        itemId: e.id,
        itemLabel: [e.role, e.company].filter(Boolean).join(' · ') || 'Role',
        index: i,
        text: b,
        issues,
        score,
      })
    })
  }
  for (const p of data.projects) {
    p.bullets.forEach((b, i) => {
      if (!b.trim()) return
      const { issues, score } = scoreBullet(b)
      findings.push({
        section: 'projects',
        itemId: p.id,
        itemLabel: p.name || 'Project',
        index: i,
        text: b,
        issues,
        score,
      })
    })
  }
  for (const p of data.positions) {
    p.bullets.forEach((b, i) => {
      if (!b.trim()) return
      const { issues, score } = scoreBullet(b)
      findings.push({
        section: 'positions',
        itemId: p.id,
        itemLabel: p.title || 'Position',
        index: i,
        text: b,
        issues,
        score,
      })
    })
  }

  return findings
}

export function averageScore(findings: BulletFinding[]): number {
  if (findings.length === 0) return 0
  return Math.round(findings.reduce((s, f) => s + f.score, 0) / findings.length)
}
