export type ISODate = string

export interface Link {
  id: string
  label: string
  url: string
  /** Canonical kind lets templates pick icons/short forms without string sniffing. */
  kind: 'linkedin' | 'github' | 'portfolio' | 'twitter' | 'scholar' | 'other'
}

export interface Basics {
  fullName: string
  headline: string
  email: string
  phone: string
  dob: string
  location: string
  summary: string
  links: Link[]
  /**
   * Section-level variants (v3). Alternative summaries the user can swap between
   * per résumé — kept on Basics because summary is the single field people
   * actually tailor per application. `summaryVariantIndex === null` means "use
   * the base summary above"; otherwise it's an index into `summaryVariants`.
   * Deliberately narrow: we shipped variants for the field the JD matcher told
   * us gets rewritten most, not the general N-variants-of-M-fields matrix.
   */
  summaryVariants?: string[]
  summaryVariantIndex?: number | null
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  score: string
  scoreType: 'CGPA' | 'GPA' | 'Percentage'
  location: string
  coursework: string[]
}

export interface Experience {
  id: string
  company: string
  role: string
  employmentType: 'Full-time' | 'Internship' | 'Contract' | 'Freelance' | 'Part-time'
  startDate: string
  endDate: string
  current: boolean
  location: string
  bullets: string[]
  tech: string[]
}

export interface Project {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  url: string
  bullets: string[]
  tech: string[]
}

export interface SkillGroup {
  id: string
  category: string
  items: string[]
}

export interface Achievement {
  id: string
  title: string
  issuer: string
  date: string
  description: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  credentialId: string
  url: string
}

export interface Publication {
  id: string
  title: string
  venue: string
  date: string
  authors: string
  url: string
}

export interface Position {
  id: string
  title: string
  organization: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface Extracurricular {
  id: string
  activity: string
  organization: string
  date: string
  description: string
}

export interface LanguageSkill {
  id: string
  language: string
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic'
}

/* -- CV-only sections (v3, beta) ------------------------------------------- */
/**
 * These sections are used by the academic/research CV template family and are
 * optional on every résumé template — a professional résumé profile will have
 * empty arrays here and never see the wizard ask for them.
 */

export interface Grant {
  id: string
  title: string
  funder: string
  amount: string
  startDate: string
  endDate: string
  role: string
  description: string
}

export interface TeachingRole {
  id: string
  course: string
  institution: string
  role: 'Instructor' | 'TA' | 'Guest' | 'Lab' | 'Other'
  term: string
  description: string
}

export interface ServiceRole {
  id: string
  role: string
  organization: string
  startDate: string
  endDate: string
  description: string
}

export interface InvitedTalk {
  id: string
  title: string
  venue: string
  date: string
  location: string
  url: string
}

export interface ResumeData {
  basics: Basics
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: SkillGroup[]
  achievements: Achievement[]
  certifications: Certification[]
  publications: Publication[]
  positions: Position[]
  extracurriculars: Extracurricular[]
  languages: LanguageSkill[]
  /** CV-only. Empty for résumé profiles; used by the academic template family. */
  grants: Grant[]
  teaching: TeachingRole[]
  service: ServiceRole[]
  talks: InvitedTalk[]
}

/** Every array-shaped section of ResumeData. Used to drive generic list editors. */
export type SectionKey = Exclude<keyof ResumeData, 'basics'>

/**
 * CV-only sections. Kept as a subset of SectionKey (not a separate type) so a
 * template can list `sections: ['grants', 'teaching', ...]` and the same
 * completeness/wizard machinery walks them uniformly.
 */
export type CvOnlySectionKey = 'grants' | 'teaching' | 'service' | 'talks'

/* -- Cover letters (v3) --------------------------------------------------- */
/**
 * A cover letter is a distinct artefact but reuses the profile's contact
 * information. Storing them on the same Profile keeps the "one person, one
 * file" mental model — the profile is the person, not the résumé.
 */
export interface CoverLetter {
  id: string
  label: string
  templateId: string
  company: string
  jobTitle: string
  hiringManager: string
  hiringAddress: string
  date: string
  greeting: string
  /** Free-form markdown-lite body. Split on blank lines into paragraphs at render. */
  body: string
  closing: string
  createdAt: ISODate
  updatedAt: ISODate
}

export interface Profile {
  id: string
  /** Display name for the profile picker — the app is multi-person by design. */
  label: string
  relationship: 'Self' | 'Family' | 'Friend' | 'Client' | 'Other'
  createdAt: ISODate
  updatedAt: ISODate
  data: ResumeData
  /** Cover letters written under this profile. Empty on new profiles. */
  coverLetters?: CoverLetter[]
}

export type FlairCategory = 'role' | 'seniority' | 'format' | 'origin'

export interface Flair {
  id: string
  label: string
  category: FlairCategory
}

export interface TemplateMeta {
  id: string
  name: string
  /** Where the layout comes from — "IIT Bombay", "Harvard OCS", "Jake Gutierrez". */
  origin: string
  blurb: string
  flairs: string[]
  /** Sections the layout renders. Drives the "what are we still missing" diff. */
  sections: SectionKey[]
  /** Sections the layout looks broken without. */
  requiredSections: SectionKey[]
  columns: 1 | 2
  atsScore: 'excellent' | 'good' | 'fair'
  accent: string
  /**
   * Distinguishes résumé, academic CV and cover-letter templates so the gallery
   * can filter them and the wizard can pick the right form. Default is 'resume'.
   */
  kind?: 'resume' | 'cv' | 'letter'
  /** Beta chip. Set on CV templates and the source editor. */
  beta?: boolean
}

