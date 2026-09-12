import type { ComponentType } from 'react'
import type { SectionKey, TemplateMeta } from '../core/types'
import type { TemplateProps } from './primitives'
import {
  DeedyTemplate,
  ExecTemplate,
  HarvardTemplate,
  IitbTemplate,
  IitkgpTemplate,
  JakeTemplate,
  MitTemplate,
  NitTemplate,
  PlainTemplate,
  ResearchTemplate,
  StanfordTemplate,
} from './layouts'

export interface TemplateEntry extends TemplateMeta {
  Component: ComponentType<TemplateProps>
}

const CAMPUS_SECTIONS: SectionKey[] = [
  'education',
  'experience',
  'projects',
  'skills',
  'achievements',
  'positions',
  'extracurriculars',
]

export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'jake',
    name: "Jake's Resume",
    origin: 'Jake Gutierrez · Overleaf',
    blurb:
      'The single most-used LaTeX resume on the internet. Centred header, hairline rules, brutally efficient one page.',
    flairs: ['swe', 'student', 'intern', 'one-page', 'dense', 'photo-free', 'us'],
    sections: ['education', 'experience', 'projects', 'skills', 'achievements'],
    requiredSections: ['education'],
    columns: 1,
    atsScore: 'excellent',
    accent: '#111827',
    Component: JakeTemplate,
  },
  {
    id: 'deedy',
    name: 'Deedy Two-Column',
    origin: 'Debarghya Das',
    blurb:
      'Sidebar for education and skills, wide column for impact. Fits ~30% more content per page than a single column.',
    flairs: ['swe', 'data', 'student', 'two-column', 'dense', 'photo-free', 'us'],
    sections: ['education', 'experience', 'projects', 'skills', 'achievements', 'certifications', 'languages'],
    requiredSections: ['education', 'skills'],
    columns: 2,
    atsScore: 'good',
    accent: '#0b7285',
    Component: DeedyTemplate,
  },
  {
    id: 'harvard',
    name: 'Harvard OCS',
    origin: 'Harvard Office of Career Services',
    blurb:
      'The conservative gold standard. Small-caps header, ruled sections, zero decoration. Safe in front of any reader.',
    flairs: ['consulting', 'non-tech', 'research', 'student', 'one-page', 'airy', 'photo-free', 'us'],
    sections: ['education', 'experience', 'projects', 'positions', 'skills', 'languages'],
    requiredSections: ['education', 'experience'],
    columns: 1,
    atsScore: 'excellent',
    accent: '#a51c30',
    Component: HarvardTemplate,
  },
  {
    id: 'mit',
    name: 'MIT Engineering',
    origin: 'MIT Career Advising',
    blurb:
      'Left-aligned header with a crimson rule under every section. Built for engineering and research-heavy histories.',
    flairs: ['swe', 'core-eng', 'research', 'student', 'one-page', 'dense', 'us'],
    sections: ['education', 'experience', 'projects', 'publications', 'skills', 'achievements'],
    requiredSections: ['education'],
    columns: 1,
    atsScore: 'excellent',
    accent: '#750014',
    Component: MitTemplate,
  },
  {
    id: 'stanford',
    name: 'Stanford Modern',
    origin: 'Stanford BEAM',
    blurb:
      'Experience-first with a short profile up top. The right shape once you have real work history to lead with.',
    flairs: ['swe', 'product', 'design', 'mid', 'one-page', 'airy', 'us'],
    sections: ['experience', 'education', 'projects', 'skills', 'achievements'],
    requiredSections: ['experience'],
    columns: 1,
    atsScore: 'excellent',
    accent: '#8c1515',
    Component: StanfordTemplate,
  },
  {
    id: 'iitb',
    name: 'IIT Bombay Campus',
    origin: 'IIT Bombay Placement Cell',
    blurb:
      'Shaded section bars and the marks table placement cells expect. Optimised for the one-page campus deadline.',
    flairs: ['swe', 'core-eng', 'data', 'student', 'intern', 'one-page', 'dense', 'india'],
    sections: CAMPUS_SECTIONS,
    requiredSections: ['education', 'achievements'],
    columns: 1,
    atsScore: 'good',
    accent: '#333333',
    Component: IitbTemplate,
  },
  {
    id: 'iitkgp',
    name: 'IIT Kharagpur Standard',
    origin: 'IIT Kharagpur CDC',
    blurb:
      'Centred header, education table, achievements promoted above internships — the CDC-mandated ordering.',
    flairs: ['swe', 'core-eng', 'consulting', 'student', 'intern', 'one-page', 'dense', 'india'],
    sections: CAMPUS_SECTIONS,
    requiredSections: ['education', 'achievements'],
    columns: 1,
    atsScore: 'good',
    accent: '#222222',
    Component: IitkgpTemplate,
  },
  {
    id: 'nit',
    name: 'NIT Jamshedpur',
    origin: 'NIT Jamshedpur T&P Cell',
    blurb:
      'Split header with contact block on the right, navy accents, and room for certifications alongside training.',
    flairs: ['core-eng', 'swe', 'student', 'intern', 'one-page', 'dense', 'india'],
    sections: [...CAMPUS_SECTIONS, 'certifications'],
    requiredSections: ['education'],
    columns: 1,
    atsScore: 'good',
    accent: '#10316b',
    Component: NitTemplate,
  },
  {
    id: 'plain',
    name: 'Plain ATS',
    origin: 'Resume Forge',
    blurb:
      'Maximum machine readability. Standard headings, no columns, no rules, no glyphs. Use it when the posting screams "portal".',
    flairs: ['non-tech', 'marketing', 'swe', 'mid', 'senior', 'airy', 'photo-free', 'us', 'europe'],
    sections: [
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'achievements',
      'languages',
    ],
    requiredSections: ['experience'],
    columns: 1,
    atsScore: 'excellent',
    accent: '#374151',
    Component: PlainTemplate,
  },
  {
    id: 'exec',
    name: 'Executive Brief',
    origin: 'Resume Forge',
    blurb:
      'Dark header band, summary-led, achievements pulled out of the role bullets. For senior and leadership applications.',
    flairs: ['senior', 'product', 'consulting', 'non-tech', 'marketing', 'airy', 'europe', 'us'],
    sections: ['experience', 'achievements', 'skills', 'education', 'certifications', 'positions', 'languages'],
    requiredSections: ['experience'],
    columns: 1,
    atsScore: 'fair',
    accent: '#1f2937',
    Component: ExecTemplate,
  },
  {
    id: 'research',
    name: 'Academic CV',
    origin: 'Resume Forge',
    blurb:
      'Publications directly under education, grants and awards given their own block. Grows past one page on purpose.',
    flairs: ['research', 'data', 'senior', 'airy', 'photo-free', 'europe', 'us'],
    sections: [
      'education',
      'publications',
      'experience',
      'achievements',
      'projects',
      'skills',
      'languages',
      'positions',
    ],
    requiredSections: ['education', 'publications'],
    columns: 1,
    atsScore: 'good',
    accent: '#374151',
    Component: ResearchTemplate,
  },
]

export const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]))

export function getTemplate(id: string | null | undefined): TemplateEntry {
  return (id && TEMPLATE_MAP.get(id)) || TEMPLATES[0]
}
