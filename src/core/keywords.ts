import type { ResumeData } from './types'

/**
 * Offline JD keyword matcher. Everything runs in-process so the JD text never
 * leaves the tab — the user can paste a confidential posting without worrying
 * it hits our server (there is no server).
 *
 * The algorithm is deliberately dumb: tokenise, strip stopwords, keep tokens
 * that look like proper nouns / capitalised / technical, then set-intersect
 * against a bag of tokens drawn from the resume. LLMs can do this "better"
 * but at a cost that violates the offline promise; the crude version is fine
 * for ATS overlap and gives instant feedback.
 */

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'should', 'could', 'may',
  'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'you', 'your', 'we',
  'our', 'they', 'their', 'he', 'she', 'it', 'its', 'his', 'her', 'them', 'us', 'me', 'my',
  'so', 'too', 'very', 'just', 'about', 'over', 'under', 'up', 'down', 'out', 'off', 'again',
  'any', 'all', 'some', 'no', 'not', 'nor', 'own', 'same', 'other', 'more', 'most', 'less',
  'few', 'many', 'much', 'per', 'via', 'into', 'onto', 'than', 'when', 'where', 'while',
  'who', 'whom', 'what', 'which', 'why', 'how', 'because', 'though', 'although', 'work',
  'working', 'looking', 'seeking', 'you', 'candidate', 'role', 'team', 'company', 'us',
  'position', 'opportunity', 'ability', 'able', 'strong', 'good', 'excellent', 'great',
  'preferred', 'required', 'must', 'plus', 'nice', 'have', 'skills', 'experience', 'years',
  'year', 'must-have', 'ideally', 'etc',
])

// Keep the raw case for user-visible token but normalise for matching.
function normalise(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9+#./]/g, '')
}

/** Splits a chunk of text into keyword-shaped tokens. */
export function tokenise(text: string): string[] {
  // Preserve dotted acronyms and hyphenated compounds — "React.js", "GraphQL",
  // "CI/CD", "kube-proxy" are all legitimate JD keywords.
  const raw = text.match(/[A-Za-z][A-Za-z0-9+#./-]{1,}/g) ?? []
  const out: string[] = []
  for (const w of raw) {
    const norm = normalise(w)
    if (norm.length < 2) continue
    if (STOPWORDS.has(norm)) continue
    out.push(norm)
  }
  return out
}

/** Collects the set of tokens the resume already contains. */
export function resumeTokens(data: ResumeData): Set<string> {
  const bag = new Set<string>()
  const push = (s: string) => tokenise(s).forEach((t) => bag.add(t))

  push(data.basics.headline)
  push(data.basics.summary)

  for (const e of data.experience) {
    push(e.role)
    push(e.company)
    e.bullets.forEach(push)
    e.tech.forEach(push)
  }
  for (const p of data.projects) {
    push(p.name)
    p.bullets.forEach(push)
    p.tech.forEach(push)
  }
  for (const s of data.skills) {
    push(s.category)
    s.items.forEach(push)
  }
  for (const c of data.certifications) push(c.name)
  for (const p of data.publications) {
    push(p.title)
    push(p.venue)
  }
  return bag
}

export interface KeywordMatch {
  token: string
  count: number
  present: boolean
}

export function matchKeywords(jd: string, data: ResumeData): {
  matches: KeywordMatch[]
  coverage: number
} {
  const tokens = tokenise(jd)
  if (tokens.length === 0) return { matches: [], coverage: 0 }

  const freq = new Map<string, number>()
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1)

  const resume = resumeTokens(data)
  const matches: KeywordMatch[] = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([token, count]) => ({ token, count, present: resume.has(token) }))

  const hit = matches.filter((m) => m.present).length
  const coverage = matches.length === 0 ? 0 : Math.round((hit / matches.length) * 100)
  return { matches, coverage }
}
