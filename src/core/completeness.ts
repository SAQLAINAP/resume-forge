import { BASICS_FIELDS, SECTION_MAP, isItemComplete, itemsOf } from './schema'
import type { ResumeData, SectionKey } from './types'
import type { TemplateEntry } from '../templates/registry'

export interface Gap {
  kind: 'basics' | 'section'
  key: string
  label: string
  why: string
  /** Blocking gaps stop the resume from being usable; optional ones just weaken it. */
  blocking: boolean
}

function basicsGaps(data: ResumeData, template: TemplateEntry): Gap[] {
  const gaps: Gap[] = []
  for (const field of BASICS_FIELDS) {
    const value = (data.basics as unknown as Record<string, string>)[field.key] ?? ''
    if (value.trim()) continue
    // DOB is only ever asked for by formats that print it.
    if (field.key === 'dob' && template.id !== 'iitkgp') continue
    if (!field.required && field.key !== 'location') continue
    gaps.push({
      kind: 'basics',
      key: field.key,
      label: field.label,
      why: 'Every template prints your contact header.',
      blocking: Boolean(field.required),
    })
  }
  return gaps
}

export function gapsFor(data: ResumeData, template: TemplateEntry): Gap[] {
  const gaps = basicsGaps(data, template)

  for (const key of template.sections) {
    const def = SECTION_MAP.get(key)
    if (!def) continue
    const items = itemsOf(data, key)
    const usable = items.filter((item) => isItemComplete(def, item))
    if (usable.length > 0) continue
    gaps.push({
      kind: 'section',
      key,
      label: def.label,
      why: def.why,
      blocking: template.requiredSections.includes(key),
    })
  }

  return gaps
}

export function blockingGaps(data: ResumeData, template: TemplateEntry): Gap[] {
  return gapsFor(data, template).filter((g) => g.blocking)
}

/** 0–100. Weighted so required sections move the needle more than nice-to-haves. */
export function completenessScore(data: ResumeData, template: TemplateEntry): number {
  let earned = 0
  let total = 0

  for (const field of BASICS_FIELDS.filter((f) => f.required)) {
    total += 2
    if (((data.basics as unknown as Record<string, string>)[field.key] ?? '').trim()) earned += 2
  }

  for (const key of template.sections) {
    const def = SECTION_MAP.get(key)
    if (!def) continue
    const weight = template.requiredSections.includes(key) ? 3 : 1
    total += weight
    const items = itemsOf(data, key)
    if (items.some((item) => isItemComplete(def, item))) earned += weight
  }

  return total === 0 ? 0 : Math.round((earned / total) * 100)
}

/** Sections a template renders that the profile already has content for. */
export function filledSections(data: ResumeData, template: TemplateEntry): SectionKey[] {
  return template.sections.filter((key) => {
    const def = SECTION_MAP.get(key)
    if (!def) return false
    return itemsOf(data, key).some((item) => isItemComplete(def, item))
  })
}

/**
 * Sections the profile has content for that this template will silently drop.
 * Worth surfacing — losing your publications because you switched template is
 * the kind of thing people only notice after they have already applied.
 */
export function droppedSections(data: ResumeData, template: TemplateEntry): SectionKey[] {
  const rendered = new Set<SectionKey>(template.sections)
  const all = [...SECTION_MAP.keys()]
  return all.filter((key) => {
    if (rendered.has(key)) return false
    const def = SECTION_MAP.get(key)!
    return itemsOf(data, key).some((item) => isItemComplete(def, item))
  })
}
