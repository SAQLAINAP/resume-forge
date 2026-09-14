import { useEffect, useState } from 'react'
import type { TemplateEntry } from '../templates/registry'

/**
 * Measures the actual rendered height of the resume against the target paper
 * height (A4 = 297mm, Letter = 279mm) and reports how many pages it will use.
 * Works by observing the rendered preview node — no separate offscreen render,
 * so a change in the editor shows up in the meter within a frame.
 */
export function PageFitMeter({
  template,
  previewRef,
}: {
  template: TemplateEntry
  previewRef: React.RefObject<HTMLDivElement | null>
}) {
  const [heightMm, setHeightMm] = useState(0)

  useEffect(() => {
    const node = previewRef.current
    if (!node) return

    const measure = () => {
      // The Preview transforms with scale(); getBoundingClientRect includes the
      // transform, so we back it out by reading the CSS pixel size of the
      // unscaled inner element.
      const rect = node.getBoundingClientRect()
      const parentStyle = node.parentElement ? getComputedStyle(node.parentElement) : null
      const scaleMatch = parentStyle?.transform?.match(/matrix\(([^,]+),/)
      const scale = scaleMatch ? Number(scaleMatch[1]) || 1 : 1
      const pxHeight = rect.height / scale
      // 96 CSS px == 25.4 mm at the browser's assumed DPI.
      const mm = (pxHeight / 96) * 25.4
      setHeightMm(mm)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    if (node.parentElement) ro.observe(node.parentElement)
    return () => ro.disconnect()
  }, [previewRef, template.id])

  const pageMm = template.id === 'plain' ? 279 : 297 // Letter for Plain ATS, A4 elsewhere
  const pages = heightMm > 0 ? Math.max(1, Math.ceil(heightMm / pageMm)) : 1
  const fillPct = Math.round((heightMm / pageMm) * 100)
  const overflow = heightMm - pageMm * (pages - 1)
  const overflowPct = Math.round((overflow / pageMm) * 100)

  const tone =
    pages === 1
      ? fillPct > 95
        ? 'text-amber-700'
        : 'text-emerald-700'
      : 'text-red-700'
  const advice =
    pages === 1
      ? fillPct > 95
        ? 'One page, but the last section is against the edge. Trim a bullet to be safe.'
        : fillPct > 60
          ? 'Comfortable one-pager. Room for another bullet if it earns its keep.'
          : 'Well under a page. Add sections or expand bullets — a half-full resume looks thin.'
      : `Spills onto page ${pages}. Cut roughly ${Math.round((heightMm - pageMm) / 5) * 5}mm — usually the oldest role, unused coursework or a hedging bullet.`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Fits on</p>
          <p className={`text-lg font-bold ${tone}`}>
            {pages} page{pages === 1 ? '' : 's'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-400">
            Fill of {pages === 1 ? 'page 1' : `page ${pages}`}
          </p>
          <p className={`text-lg font-bold ${tone}`}>
            {pages === 1 ? fillPct : overflowPct}%
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full transition-all ${pages === 1 ? (fillPct > 95 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-red-500'}`}
          style={{ width: `${Math.min(100, pages === 1 ? fillPct : 100)}%` }}
        />
      </div>

      <p className="text-[11px] text-ink-500">{advice}</p>

      <p className="text-[10px] text-ink-400">
        Estimated from the preview at print scale. Some fonts render slightly differently in Chrome vs. Firefox — expect ±2mm.
      </p>
    </div>
  )
}
