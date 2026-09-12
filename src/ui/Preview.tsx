import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ResumeData } from '../core/types'
import type { TemplateEntry } from '../templates/registry'

/**
 * Renders the resume at its true physical size and then scales it down with a
 * transform. Scaling rather than reflowing is deliberate — it guarantees the
 * preview shares exact line breaks and page boundaries with the printed PDF.
 */
export function Preview({
  template,
  data,
  nodeRef,
  fit = true,
}: {
  template: TemplateEntry
  data: ResumeData
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
      const pageWidth = inner.offsetWidth
      const pageHeight = inner.offsetHeight
      if (!pageWidth) return
      const next = fit ? Math.min(1, (wrap.clientWidth - 2) / pageWidth) : 1
      setScale(next)
      setHeight(pageHeight * next)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [fit, template.id, data])

  const { Component } = template

  return (
    <div ref={wrapRef} className="w-full" style={{ height: height || undefined }}>
      <div
        ref={innerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'fit-content' }}
        className="shadow-lg ring-1 ring-ink-200"
      >
        <div ref={nodeRef}>
          <Component data={data} />
        </div>
      </div>
    </div>
  )
}

/**
 * A second, unscaled copy of the document mounted into a dedicated body-level
 * node. Print CSS hides the app and shows only this, so the PDF never inherits
 * the preview's transform or the app's layout.
 */
export function PrintSurface({ template, data }: { template: TemplateEntry; data: ResumeData }) {
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
  return createPortal(<Component data={data} />, host)
}
