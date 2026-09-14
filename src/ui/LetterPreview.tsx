import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CoverLetter, ResumeData } from '../core/types'
import type { LetterTemplateEntry } from '../templates/coverLetters'

/**
 * Scaled preview + print portal for cover letters. Deliberate near-duplication
 * of Preview.tsx — the two callers have different generic parameters and
 * merging them behind a `<T>` wrapper hides a live line-count difference (a
 * letter is one page, a résumé can be many) rather than making the code
 * cleaner.
 */

export function LetterPreview({
  template,
  data,
  letter,
  nodeRef,
  fit = true,
}: {
  template: LetterTemplateEntry
  data: ResumeData
  letter: CoverLetter
  nodeRef?: React.RefObject<HTMLDivElement | null>
  fit?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    const measure = () => {
      const w = inner.offsetWidth
      const h = inner.offsetHeight
      if (!w) return
      const s = fit ? Math.min(1, (wrap.clientWidth - 2) / w) : 1
      setScale(s)
      setHeight(h * s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [fit, template.id, data, letter])

  const { Component } = template
  return (
    <div ref={wrapRef} className="w-full" style={{ height: height || undefined }}>
      <div
        ref={innerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'fit-content' }}
        className="shadow-lg ring-1 ring-ink-200"
      >
        <div ref={nodeRef}>
          <Component data={data} letter={letter} />
        </div>
      </div>
    </div>
  )
}

export function LetterPrintSurface({
  template,
  data,
  letter,
}: {
  template: LetterTemplateEntry
  data: ResumeData
  letter: CoverLetter
}) {
  const [host, setHost] = useState<HTMLElement | null>(null)
  useEffect(() => {
    let node = document.getElementById('rf-print-root')
    if (!node) {
      node = document.createElement('div')
      node.id = 'rf-print-root'
      document.body.appendChild(node)
    }
    node.style.display = 'none'
    setHost(node)
  }, [])
  if (!host) return null
  const { Component } = template
  return createPortal(<Component data={data} letter={letter} />, host)
}
