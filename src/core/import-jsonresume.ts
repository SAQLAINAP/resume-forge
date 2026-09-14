import { nanoid } from 'nanoid'
import { backfillResumeData } from './schema'
import type { Achievement, Certification, Education, Experience, LanguageSkill, Link, Project, Publication, ResumeData, SkillGroup } from './types'

/**
 * JSON Resume schema importer (https://jsonresume.org/schema).
 *
 * Why import JSON Resume specifically:
 *   - It's the closest thing the ecosystem has to a lingua franca. Every other
 *     builder either exports to it or can be persuaded to.
 *   - LinkedIn's own data export is a bundle of CSVs, which is a heavier
 *     integration for the same "get your data in fast" outcome. If we ever add
 *     a LinkedIn CSV importer, it will lower into this same ResumeData.
 *
 * The mapping is deliberately lossy in one direction: fields JSON Resume
 * carries that we don't render (image, profiles.network beyond the top link
 * types, references, interests) get preserved as best-effort but do not crash
 * the import. Fields we care about that JSON Resume doesn't have — e.g. the
 * distinct "positions" section Indian campus formats want — start empty and the
 * user can add them in-app.
 */

/** Loose JSON Resume shape; we only rely on the fields we actually map. */
interface JsonResume {
  basics?: {
    name?: string
    label?: string
    email?: string
    phone?: string
    url?: string
    summary?: string
    location?: { city?: string; region?: string; country?: string; countryCode?: string; address?: string; postalCode?: string }
    profiles?: Array<{ network?: string; username?: string; url?: string }>
  }
  work?: Array<{
    name?: string
    company?: string
    position?: string
    startDate?: string
    endDate?: string
    location?: string
    url?: string
    summary?: string
    highlights?: string[]
  }>
  education?: Array<{
    institution?: string
    area?: string
    studyType?: string
    startDate?: string
    endDate?: string
    score?: string
    gpa?: string
    courses?: string[]
    location?: string
  }>
  projects?: Array<{
    name?: string
    startDate?: string
    endDate?: string
    url?: string
    description?: string
    highlights?: string[]
    keywords?: string[]
    roles?: string[]
  }>
  skills?: Array<{ name?: string; keywords?: string[]; level?: string }>
  awards?: Array<{ title?: string; awarder?: string; date?: string; summary?: string }>
  certificates?: Array<{ name?: string; issuer?: string; date?: string; url?: string }>
  publications?: Array<{ name?: string; publisher?: string; releaseDate?: string; url?: string; summary?: string }>
  languages?: Array<{ language?: string; fluency?: string }>
}

/** JSON Resume URLs sometimes start with the domain only. Normalise for display. */
function trimHttp(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function guessLinkKind(url: string, network: string | undefined): Link['kind'] {
  const s = (url + ' ' + (network ?? '')).toLowerCase()
  if (s.includes('linkedin')) return 'linkedin'
  if (s.includes('github')) return 'github'
  if (s.includes('twitter') || s.includes('x.com')) return 'twitter'
  if (s.includes('scholar')) return 'scholar'
  if (s.includes('portfolio') || s.includes('personal')) return 'portfolio'
  return 'other'
}

type JsonResumeLocation = NonNullable<NonNullable<JsonResume['basics']>['location']>

function joinLocation(loc: JsonResumeLocation | undefined): string {
  if (!loc) return ''
  const parts = [loc.city, loc.region, loc.country].filter(Boolean)
  return parts.join(', ')
}

/** Map JSON Resume fluency strings to our closed set; unknown → 'Professional'. */
function mapProficiency(fluency: string | undefined): LanguageSkill['proficiency'] {
  const s = (fluency ?? '').trim().toLowerCase()
  if (s.startsWith('nativ')) return 'Native'
  if (s.startsWith('fluen')) return 'Fluent'
  if (s.startsWith('prof') || s.startsWith('c1') || s.startsWith('c2')) return 'Professional'
  if (s.startsWith('inter') || s.startsWith('b1') || s.startsWith('b2')) return 'Intermediate'
  if (s.startsWith('basic') || s.startsWith('a1') || s.startsWith('a2') || s.startsWith('elem')) return 'Basic'
  return 'Professional'
}

/** Best-effort detection of whether an object looks like JSON Resume. */
export function looksLikeJsonResume(obj: unknown): obj is JsonResume {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return Boolean(o.basics || o.work || o.education || o.skills)
}

export function importJsonResume(src: JsonResume): { label: string; data: ResumeData } {
  const b = src.basics ?? {}
  const links: Link[] = []
  if (b.url) links.push({ id: nanoid(), label: trimHttp(b.url), url: b.url, kind: 'portfolio' })
  for (const p of b.profiles ?? []) {
    if (!p?.url) continue
    links.push({ id: nanoid(), label: p.network || trimHttp(p.url), url: p.url, kind: guessLinkKind(p.url, p.network) })
  }

  const experience: Experience[] = (src.work ?? []).map((w) => ({
    id: nanoid(),
    company: w.name || w.company || '',
    role: w.position || '',
    employmentType: 'Full-time',
    startDate: w.startDate || '',
    endDate: w.endDate || '',
    current: !w.endDate,
    location: w.location || '',
    bullets: [...(w.summary ? [w.summary] : []), ...(w.highlights ?? [])].filter(Boolean),
    tech: [],
  }))

  const education: Education[] = (src.education ?? []).map((e) => ({
    id: nanoid(),
    institution: e.institution || '',
    degree: e.studyType || '',
    field: e.area || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    // JSON Resume uses either `score` or `gpa`; take whichever's populated.
    score: e.score || e.gpa || '',
    scoreType: e.gpa ? 'GPA' : e.score && Number(e.score) <= 10 ? 'CGPA' : 'Percentage',
    location: e.location || '',
    coursework: e.courses ?? [],
  }))

  const projects: Project[] = (src.projects ?? []).map((p) => ({
    id: nanoid(),
    name: p.name || '',
    role: (p.roles ?? []).join(', '),
    startDate: p.startDate || '',
    endDate: p.endDate || '',
    url: p.url || '',
    bullets: [...(p.description ? [p.description] : []), ...(p.highlights ?? [])].filter(Boolean),
    tech: p.keywords ?? [],
  }))

  const skills: SkillGroup[] = (src.skills ?? []).map((s) => ({
    id: nanoid(),
    category: s.name || 'Skills',
    items: s.keywords ?? [],
  }))

  const achievements: Achievement[] = (src.awards ?? []).map((a) => ({
    id: nanoid(),
    title: a.title || '',
    issuer: a.awarder || '',
    date: a.date || '',
    description: a.summary || '',
  }))

  const certifications: Certification[] = (src.certificates ?? []).map((c) => ({
    id: nanoid(),
    name: c.name || '',
    issuer: c.issuer || '',
    date: c.date || '',
    credentialId: '',
    url: c.url || '',
  }))

  const publications: Publication[] = (src.publications ?? []).map((p) => ({
    id: nanoid(),
    title: p.name || '',
    venue: p.publisher || '',
    date: p.releaseDate || '',
    authors: '',
    url: p.url || '',
  }))

  const languages: LanguageSkill[] = (src.languages ?? []).map((l) => ({
    id: nanoid(),
    language: l.language || '',
    proficiency: mapProficiency(l.fluency),
  }))

  const data = backfillResumeData({
    basics: {
      fullName: b.name || '',
      headline: b.label || '',
      email: b.email || '',
      phone: b.phone || '',
      dob: '',
      location: joinLocation(b.location),
      summary: b.summary || '',
      links,
      summaryVariants: [],
      summaryVariantIndex: null,
    },
    education,
    experience,
    projects,
    skills,
    achievements,
    certifications,
    publications,
    positions: [],
    extracurriculars: [],
    languages,
  })
  return { label: b.name || 'Imported profile', data }
}

