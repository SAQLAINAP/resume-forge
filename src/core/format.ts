const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Accepts "2025-03" or "2025-03-14"; anything unparseable passes through untouched. */
export function formatMonth(value: string): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return value
  const month = Number(match[2])
  if (month < 1 || month > 12) return match[1]
  return `${MONTHS[month - 1]} ${match[1]}`
}

export function dateRange(start: string, end: string, presentLabel = 'Present'): string {
  const from = formatMonth(start)
  const to = end ? formatMonth(end) : from ? presentLabel : ''
  if (!from && !to) return ''
  if (!from) return to
  return `${from} – ${to}`
}

export function joinNonEmpty(parts: Array<string | undefined | null>, sep = ' · '): string {
  return parts.filter((p) => p && String(p).trim()).join(sep)
}

/** Strips the scheme so links read cleanly on paper without losing the href. */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function scoreLabel(score: string, type: string): string {
  if (!score) return ''
  return type === 'Percentage' ? `${score}%` : `${type} ${score}`
}
