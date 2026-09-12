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
}

/** Every array-shaped section of ResumeData. Used to drive generic list editors. */
export type SectionKey = Exclude<keyof ResumeData, 'basics'>

export interface Profile {
  id: string
  /** Display name for the profile picker — the app is multi-person by design. */
  label: string
  relationship: 'Self' | 'Family' | 'Friend' | 'Client' | 'Other'
  createdAt: ISODate
  updatedAt: ISODate
  data: ResumeData
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
}
