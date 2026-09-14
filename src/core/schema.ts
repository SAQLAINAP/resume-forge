import { nanoid } from 'nanoid'
import type {
  Achievement,
  Certification,
  Education,
  Experience,
  Extracurricular,
  Grant,
  InvitedTalk,
  LanguageSkill,
  Position,
  Project,
  Publication,
  ResumeData,
  SectionKey,
  ServiceRole,
  SkillGroup,
  TeachingRole,
} from './types'

export type FieldType = 'text' | 'textarea' | 'date' | 'month' | 'select' | 'bullets' | 'tags' | 'url'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: readonly string[]
  hint?: string
  /** Blank values block "is this section complete?" checks. */
  required?: boolean
  half?: boolean
}

export interface SectionDef {
  key: SectionKey
  label: string
  singular: string
  /** Shown in the wizard to explain why a template wants this. */
  why: string
  fields: FieldDef[]
  factory: () => unknown
  /** Used to render a one-line summary in collapsed list rows. */
  titleOf: (item: any) => string
  subtitleOf: (item: any) => string
}

const BULLET_HINT = 'One achievement per line. Lead with a verb, end with a number where you can.'

export const SECTIONS: SectionDef[] = [
  {
    key: 'education',
    label: 'Education',
    singular: 'Degree',
    why: 'Campus and university formats lead with education, so this drives the whole top block.',
    fields: [
      { key: 'institution', label: 'Institution', type: 'text', required: true, placeholder: 'IIT Bombay' },
      { key: 'degree', label: 'Degree', type: 'text', required: true, placeholder: 'B.Tech' },
      { key: 'field', label: 'Field of study', type: 'text', placeholder: 'Computer Science & Engineering' },
      { key: 'location', label: 'Location', type: 'text', half: true, placeholder: 'Mumbai, India' },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true, hint: 'Leave blank if ongoing' },
      { key: 'scoreType', label: 'Score type', type: 'select', half: true, options: ['CGPA', 'GPA', 'Percentage'] },
      { key: 'score', label: 'Score', type: 'text', half: true, placeholder: '8.74' },
      { key: 'coursework', label: 'Relevant coursework', type: 'tags', hint: 'Comma separated. Only worth adding if you have little work experience.' },
    ],
    factory: (): Education => ({
      id: nanoid(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      score: '',
      scoreType: 'CGPA',
      location: '',
      coursework: [],
    }),
    titleOf: (e: Education) => e.institution || 'New education entry',
    subtitleOf: (e: Education) => [e.degree, e.field].filter(Boolean).join(' · '),
  },
  {
    key: 'experience',
    label: 'Work experience',
    singular: 'Role',
    why: 'The single highest-weighted section for almost every ATS and every recruiter.',
    fields: [
      { key: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Plivo' },
      { key: 'role', label: 'Title', type: 'text', required: true, placeholder: 'Software Engineer' },
      {
        key: 'employmentType',
        label: 'Type',
        type: 'select',
        half: true,
        options: ['Full-time', 'Internship', 'Contract', 'Freelance', 'Part-time'],
      },
      { key: 'location', label: 'Location', type: 'text', half: true, placeholder: 'Bengaluru, India' },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true, hint: 'Leave blank if this is your current role' },
      { key: 'bullets', label: 'What you did', type: 'bullets', required: true, hint: BULLET_HINT },
      { key: 'tech', label: 'Tech / tools used', type: 'tags' },
    ],
    factory: (): Experience => ({
      id: nanoid(),
      company: '',
      role: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      bullets: [],
      tech: [],
    }),
    titleOf: (e: Experience) => e.role || 'New role',
    subtitleOf: (e: Experience) => e.company,
  },
  {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    why: 'Carries the technical weight when your work history is short.',
    fields: [
      { key: 'name', label: 'Project name', type: 'text', required: true },
      { key: 'role', label: 'Your role', type: 'text', half: true, placeholder: 'Solo · Team of 4' },
      { key: 'url', label: 'Link', type: 'url', half: true, placeholder: 'https://github.com/...' },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true },
      { key: 'bullets', label: 'Description', type: 'bullets', required: true, hint: BULLET_HINT },
      { key: 'tech', label: 'Built with', type: 'tags' },
    ],
    factory: (): Project => ({
      id: nanoid(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      url: '',
      bullets: [],
      tech: [],
    }),
    titleOf: (p: Project) => p.name || 'New project',
    subtitleOf: (p: Project) => p.tech.slice(0, 4).join(', '),
  },
  {
    key: 'skills',
    label: 'Skills',
    singular: 'Skill group',
    why: 'Keyword matching happens here. Group them so a human can scan it too.',
    fields: [
      { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Languages' },
      { key: 'items', label: 'Skills', type: 'tags', required: true, placeholder: 'Python, Go, TypeScript' },
    ],
    factory: (): SkillGroup => ({ id: nanoid(), category: '', items: [] }),
    titleOf: (s: SkillGroup) => s.category || 'New group',
    subtitleOf: (s: SkillGroup) => s.items.join(', '),
  },
  {
    key: 'achievements',
    label: 'Achievements',
    singular: 'Achievement',
    why: 'Indian campus formats treat this as a headline section — ranks, olympiads, hackathons.',
    fields: [
      { key: 'title', label: 'Achievement', type: 'text', required: true, placeholder: 'AIR 412, JEE Advanced' },
      { key: 'issuer', label: 'Awarded by', type: 'text', half: true },
      { key: 'date', label: 'Date', type: 'month', half: true },
      { key: 'description', label: 'Detail', type: 'textarea' },
    ],
    factory: (): Achievement => ({ id: nanoid(), title: '', issuer: '', date: '', description: '' }),
    titleOf: (a: Achievement) => a.title || 'New achievement',
    subtitleOf: (a: Achievement) => a.issuer,
  },
  {
    key: 'positions',
    label: 'Positions of responsibility',
    singular: 'Position',
    why: 'A standard, expected section on Indian campus resumes. Leadership signal elsewhere.',
    fields: [
      { key: 'title', label: 'Position', type: 'text', required: true, placeholder: 'Head, Web Ops' },
      { key: 'organization', label: 'Organisation', type: 'text', required: true },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true },
      { key: 'bullets', label: 'Impact', type: 'bullets', hint: BULLET_HINT },
    ],
    factory: (): Position => ({ id: nanoid(), title: '', organization: '', startDate: '', endDate: '', bullets: [] }),
    titleOf: (p: Position) => p.title || 'New position',
    subtitleOf: (p: Position) => p.organization,
  },
  {
    key: 'certifications',
    label: 'Certifications',
    singular: 'Certification',
    why: 'Cheap credibility for career switchers and cloud/security roles.',
    fields: [
      { key: 'name', label: 'Certification', type: 'text', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text', half: true },
      { key: 'date', label: 'Issued', type: 'month', half: true },
      { key: 'credentialId', label: 'Credential ID', type: 'text', half: true },
      { key: 'url', label: 'Verify URL', type: 'url', half: true },
    ],
    factory: (): Certification => ({ id: nanoid(), name: '', issuer: '', date: '', credentialId: '', url: '' }),
    titleOf: (c: Certification) => c.name || 'New certification',
    subtitleOf: (c: Certification) => c.issuer,
  },
  {
    key: 'publications',
    label: 'Publications',
    singular: 'Publication',
    why: 'Required by research and PhD-track formats, ignored by everything else.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'venue', label: 'Venue', type: 'text', half: true, placeholder: 'NeurIPS 2025' },
      { key: 'date', label: 'Date', type: 'month', half: true },
      { key: 'authors', label: 'Authors', type: 'text', hint: 'Bold your own name by writing it exactly as in Basics.' },
      { key: 'url', label: 'DOI / link', type: 'url' },
    ],
    factory: (): Publication => ({ id: nanoid(), title: '', venue: '', date: '', authors: '', url: '' }),
    titleOf: (p: Publication) => p.title || 'New publication',
    subtitleOf: (p: Publication) => p.venue,
  },
  {
    key: 'extracurriculars',
    label: 'Extracurriculars',
    singular: 'Activity',
    why: 'Rounds out a fresher resume and gives interviewers something human to open with.',
    fields: [
      { key: 'activity', label: 'Activity', type: 'text', required: true },
      { key: 'organization', label: 'Organisation', type: 'text', half: true },
      { key: 'date', label: 'Date', type: 'month', half: true },
      { key: 'description', label: 'Detail', type: 'textarea' },
    ],
    factory: (): Extracurricular => ({ id: nanoid(), activity: '', organization: '', date: '', description: '' }),
    titleOf: (e: Extracurricular) => e.activity || 'New activity',
    subtitleOf: (e: Extracurricular) => e.organization,
  },
  {
    key: 'languages',
    label: 'Languages',
    singular: 'Language',
    why: 'Matters for Europe and for any role with a regional market attached.',
    fields: [
      { key: 'language', label: 'Language', type: 'text', required: true },
      {
        key: 'proficiency',
        label: 'Proficiency',
        type: 'select',
        options: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'],
      },
    ],
    factory: (): LanguageSkill => ({ id: nanoid(), language: '', proficiency: 'Fluent' }),
    titleOf: (l: LanguageSkill) => l.language || 'New language',
    subtitleOf: (l: LanguageSkill) => l.proficiency,
  },
  /* -- CV-only sections (v3 beta) --------------------------------------- */
  {
    key: 'grants',
    label: 'Grants & Funding',
    singular: 'Grant',
    why: 'Academic CVs treat this as a first-class section — reviewers look for it before publications.',
    fields: [
      { key: 'title', label: 'Grant title', type: 'text', required: true },
      { key: 'funder', label: 'Funder', type: 'text', half: true, placeholder: 'NSF · DFG · SERB' },
      { key: 'amount', label: 'Amount', type: 'text', half: true, placeholder: '$120,000' },
      { key: 'role', label: 'Your role', type: 'text', half: true, placeholder: 'PI · Co-PI · Contributor' },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true },
      { key: 'description', label: 'Detail', type: 'textarea' },
    ],
    factory: (): Grant => ({ id: nanoid(), title: '', funder: '', amount: '', startDate: '', endDate: '', role: '', description: '' }),
    titleOf: (g: Grant) => g.title || 'New grant',
    subtitleOf: (g: Grant) => [g.funder, g.amount].filter(Boolean).join(' · '),
  },
  {
    key: 'teaching',
    label: 'Teaching',
    singular: 'Course',
    why: 'CV-standard block for anyone who has TAed, guest-lectured or run a course.',
    fields: [
      { key: 'course', label: 'Course', type: 'text', required: true, placeholder: 'CS231n — Deep Learning' },
      { key: 'institution', label: 'Institution', type: 'text', half: true },
      { key: 'role', label: 'Role', type: 'select', half: true, options: ['Instructor', 'TA', 'Guest', 'Lab', 'Other'] },
      { key: 'term', label: 'Term', type: 'text', placeholder: 'Fall 2025' },
      { key: 'description', label: 'Detail', type: 'textarea' },
    ],
    factory: (): TeachingRole => ({ id: nanoid(), course: '', institution: '', role: 'TA', term: '', description: '' }),
    titleOf: (t: TeachingRole) => t.course || 'New course',
    subtitleOf: (t: TeachingRole) => [t.role, t.institution].filter(Boolean).join(' · '),
  },
  {
    key: 'service',
    label: 'Academic Service',
    singular: 'Service role',
    why: 'Reviewing, committee work, editorships — the parts of a CV that show academic citizenship.',
    fields: [
      { key: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Reviewer' },
      { key: 'organization', label: 'Organisation', type: 'text', half: true, placeholder: 'NeurIPS PC' },
      { key: 'startDate', label: 'Start', type: 'month', half: true },
      { key: 'endDate', label: 'End', type: 'month', half: true },
      { key: 'description', label: 'Detail', type: 'textarea' },
    ],
    factory: (): ServiceRole => ({ id: nanoid(), role: '', organization: '', startDate: '', endDate: '', description: '' }),
    titleOf: (s: ServiceRole) => s.role || 'New service role',
    subtitleOf: (s: ServiceRole) => s.organization,
  },
  {
    key: 'talks',
    label: 'Invited Talks',
    singular: 'Talk',
    why: 'CVs list keynotes, invited talks and workshop presentations separately from publications.',
    fields: [
      { key: 'title', label: 'Talk title', type: 'text', required: true },
      { key: 'venue', label: 'Venue', type: 'text', half: true, placeholder: 'ICLR Workshop on…' },
      { key: 'date', label: 'Date', type: 'month', half: true },
      { key: 'location', label: 'Location', type: 'text', half: true },
      { key: 'url', label: 'Link', type: 'url', half: true },
    ],
    factory: (): InvitedTalk => ({ id: nanoid(), title: '', venue: '', date: '', location: '', url: '' }),
    titleOf: (t: InvitedTalk) => t.title || 'New talk',
    subtitleOf: (t: InvitedTalk) => t.venue,
  },
]

export const SECTION_MAP = new Map(SECTIONS.map((s) => [s.key, s]))

export const BASICS_FIELDS: FieldDef[] = [
  { key: 'fullName', label: 'Full name', type: 'text', required: true, placeholder: 'Saqlain P' },
  { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Software Engineer', hint: 'Optional. Some formats show it under your name.' },
  { key: 'email', label: 'Email', type: 'text', required: true, half: true },
  { key: 'phone', label: 'Phone', type: 'text', required: true, half: true },
  { key: 'location', label: 'Location', type: 'text', half: true, placeholder: 'Bengaluru, India' },
  { key: 'dob', label: 'Date of birth', type: 'date', half: true, hint: 'Only a few regions expect this. Never sent unless a template uses it.' },
  { key: 'summary', label: 'Summary', type: 'textarea', hint: '2–3 lines. Skip it if you have strong bullets — most recruiters do not read it.' },
]

export function emptyResumeData(): ResumeData {
  return {
    basics: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      dob: '',
      location: '',
      summary: '',
      links: [],
      summaryVariants: [],
      summaryVariantIndex: null,
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    achievements: [],
    certifications: [],
    publications: [],
    positions: [],
    extracurriculars: [],
    languages: [],
    grants: [],
    teaching: [],
    service: [],
    talks: [],
  }
}

/**
 * Persist migration: v2 profiles didn't have the CV sections or variant fields.
 * When rehydrating an older profile, backfill those with empty defaults so the
 * rest of the app can treat them as always-present. Non-destructive.
 */
export function backfillResumeData(data: Partial<ResumeData> | undefined): ResumeData {
  const empty = emptyResumeData()
  if (!data) return empty
  const basics = { ...empty.basics, ...(data.basics ?? {}) }
  return {
    basics,
    education: data.education ?? [],
    experience: data.experience ?? [],
    projects: data.projects ?? [],
    skills: data.skills ?? [],
    achievements: data.achievements ?? [],
    certifications: data.certifications ?? [],
    publications: data.publications ?? [],
    positions: data.positions ?? [],
    extracurriculars: data.extracurriculars ?? [],
    languages: data.languages ?? [],
    grants: data.grants ?? [],
    teaching: data.teaching ?? [],
    service: data.service ?? [],
    talks: data.talks ?? [],
  }
}

/**
 * Section arrays are heterogeneous unions, but every generic consumer (list
 * editors, completeness checks) only needs indexed field access. This is the
 * one place that widening happens, so the casts do not spread through the app.
 */
export function itemsOf(data: ResumeData, key: SectionKey): Array<Record<string, unknown>> {
  return data[key] as unknown as Array<Record<string, unknown>>
}

/** True when every `required: true` field on the item has content. */
export function isItemComplete(section: SectionDef, item: Record<string, unknown>): boolean {
  return section.fields
    .filter((f) => f.required)
    .every((f) => {
      const value = item[f.key]
      if (Array.isArray(value)) return value.length > 0
      return typeof value === 'string' ? value.trim().length > 0 : value != null
    })
}
