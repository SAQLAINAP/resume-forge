import type { Basics } from './types'

/**
 * Section-level variants live here — a tiny module so both the editor UI and
 * the template renderers can import without dragging React in. v3 covers the
 * summary only; wider variant support (experience orderings, alternate skill
 * groupings) will land in v4 once we see which additional fields users
 * actually swap between applications.
 *
 * `summaryVariantIndex === null` (or missing) means "use the base summary".
 * An out-of-range index falls back to the base too — a defensive belt in case
 * a variant gets deleted while it was active.
 */
export function activeSummary(basics: Basics): string {
  const idx = basics.summaryVariantIndex
  const variants = basics.summaryVariants ?? []
  if (idx == null || idx < 0 || idx >= variants.length) return basics.summary
  const chosen = variants[idx]
  return chosen.trim() ? chosen : basics.summary
}
