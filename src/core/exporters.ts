import { saveAs } from 'file-saver'
import { toPng } from 'html-to-image'
import type { CoverLetter, ResumeData, SectionKey } from './types'

export function safeFileName(name: string, templateName: string, ext: string): string {
  const base = (name || 'resume').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
  const tpl = templateName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
  return `${base || 'resume'}-${tpl}.${ext}`.toLowerCase()
}

/* -- PDF ------------------------------------------------------------------- */

/**
 * PDF export goes through the browser's own print pipeline rather than
 * rasterising to canvas. A canvas-based PDF is an image: an ATS extracts zero
 * text from it, which defeats the entire point of the product. Printing keeps
 * real glyphs, real font metrics and selectable/searchable text.
 */
export function exportPdf(): void {
  window.print()
}

/* -- PNG ------------------------------------------------------------------- */

export async function exportPng(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await toPng(node, {
    // 3x gives a crisp image on retina and when pasted into a deck.
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: { transform: 'none', boxShadow: 'none', margin: '0' },
  })
  const blob = await (await fetch(dataUrl)).blob()
  saveAs(blob, fileName)
}

/* -- DOCX ------------------------------------------------------------------ */

/**
 * Word export is generated from the data model, not from the DOM. An
 * HTML-to-Word conversion carries the CSS layout across as tables and
 * positioned frames, which is exactly what ATS parsers choke on. Rebuilding it
 * with native Word headings and bullets gives a file that both a human and a
 * parser can read, and that the user can actually edit afterwards.
 */
export async function exportDocx(
  data: ResumeData,
  sectionOrder: SectionKey[],
  fileName: string,
): Promise<void> {
  const { buildDocx } = await import('./docx-export')
  saveAs(await buildDocx(data, sectionOrder), fileName)
}

/** Cover letter DOCX. Same lazy-import trick as the résumé exporter. */
export async function exportLetterDocx(data: ResumeData, letter: CoverLetter, fileName: string): Promise<void> {
  const { buildLetterDocx } = await import('./docx-export')
  saveAs(await buildLetterDocx(data, letter), fileName)
}

/* -- JSON backup ----------------------------------------------------------- */

export function exportJson(data: unknown, fileName: string): void {
  saveAs(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), fileName)
}
