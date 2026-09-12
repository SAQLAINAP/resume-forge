import type { ReactNode } from 'react'
import type { ResumeData } from '../core/types'
import { prettyUrl } from '../core/format'

export interface TemplateProps {
  data: ResumeData
}

export function Rule({ className = '' }: { className?: string }) {
  return <div className={`rf-rule ${className}`} />
}

/** Section wrapper that disappears entirely when it has nothing to show. */
export function Section({
  title,
  children,
  show = true,
  className = '',
  titleClassName = '',
}: {
  title: string
  children: ReactNode
  show?: boolean
  className?: string
  titleClassName?: string
}) {
  if (!show) return null
  return (
    <section className={`rf-section ${className}`}>
      <h2 className={`rf-h2 ${titleClassName}`}>{title}</h2>
      {children}
    </section>
  )
}

export function Bullets({ items, className = '' }: { items: string[]; className?: string }) {
  const clean = items.filter((b) => b.trim())
  if (!clean.length) return null
  return (
    <ul className={`rf-bullets ${className}`}>
      {clean.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

export function Row({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="rf-row">
      <div className="rf-row-left">{left}</div>
      <div className="rf-row-right">{right}</div>
    </div>
  )
}

export function LinkText({ url, label }: { url: string; label?: string }) {
  if (!url) return null
  return (
    <a href={url} className="rf-link">
      {label || prettyUrl(url)}
    </a>
  )
}

/** Renders the author list with the resume owner's name emphasised, as journals expect. */
export function Authors({ authors, owner }: { authors: string; owner: string }) {
  if (!authors) return null
  if (!owner || !authors.includes(owner)) return <span>{authors}</span>
  const [before, ...rest] = authors.split(owner)
  return (
    <span>
      {before}
      <strong>{owner}</strong>
      {rest.join(owner)}
    </span>
  )
}
