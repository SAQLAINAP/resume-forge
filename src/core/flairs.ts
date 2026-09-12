import type { Flair } from './types'

export const FLAIRS: Flair[] = [
  { id: 'swe', label: 'Software Engineering', category: 'role' },
  { id: 'data', label: 'Data / ML', category: 'role' },
  { id: 'research', label: 'Research & Academia', category: 'role' },
  { id: 'product', label: 'Product Management', category: 'role' },
  { id: 'design', label: 'Design / UX', category: 'role' },
  { id: 'consulting', label: 'Consulting & Finance', category: 'role' },
  { id: 'core-eng', label: 'Core Engineering', category: 'role' },
  { id: 'non-tech', label: 'Non-technical', category: 'role' },
  { id: 'marketing', label: 'Marketing & Growth', category: 'role' },

  { id: 'student', label: 'Student / Fresher', category: 'seniority' },
  { id: 'intern', label: 'Internship hunt', category: 'seniority' },
  { id: 'mid', label: 'Mid-level', category: 'seniority' },
  { id: 'senior', label: 'Senior / Lead', category: 'seniority' },

  { id: 'one-page', label: 'One page', category: 'format' },
  { id: 'two-column', label: 'Two column', category: 'format' },
  { id: 'dense', label: 'Dense', category: 'format' },
  { id: 'airy', label: 'Airy', category: 'format' },
  { id: 'photo-free', label: 'No photo', category: 'format' },

  { id: 'india', label: 'India', category: 'origin' },
  { id: 'us', label: 'US / Global', category: 'origin' },
  { id: 'europe', label: 'Europe', category: 'origin' },
]

export const FLAIR_MAP = new Map(FLAIRS.map((f) => [f.id, f]))

export const CATEGORY_LABEL: Record<Flair['category'], string> = {
  role: 'Role',
  seniority: 'Stage',
  format: 'Format',
  origin: 'Region',
}
