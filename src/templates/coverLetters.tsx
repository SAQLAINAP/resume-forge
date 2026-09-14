import type { CoverLetter, ResumeData } from '../core/types'

/**
 * Cover-letter templates. Same registry pattern as résumé templates — each
 * layout is a pure function of (data, letter) — so the same print/PNG/PDF
 * pipelines work with zero changes. Sharing the résumé's Profile means the
 * contact block, name and links come from the same source of truth.
 */

export interface LetterTemplateProps {
  data: ResumeData
  letter: CoverLetter
}

/** Split the body on blank lines into paragraphs so the user can just paste. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function formatLetterDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

/* -- Formal Block ---------------------------------------------------------- */

export function FormalBlockLetter({ data, letter }: LetterTemplateProps) {
  return (
    <div className="rf-page rf-letter rf-letter-formal rf-serif">
      <header className="rf-letter-head">
        <div className="rf-letter-sender">
          <div className="rf-letter-name">{data.basics.fullName || 'Your Name'}</div>
          <div className="rf-small rf-muted">
            {[data.basics.email, data.basics.phone, data.basics.location].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div className="rf-letter-date">{formatLetterDate(letter.date)}</div>
      </header>

      {(letter.hiringManager || letter.company || letter.hiringAddress) && (
        <div className="rf-letter-recipient">
          {letter.hiringManager && <div>{letter.hiringManager}</div>}
          {letter.company && <div>{letter.company}</div>}
          {letter.hiringAddress && <div className="rf-small">{letter.hiringAddress}</div>}
        </div>
      )}

      {letter.jobTitle && <p className="rf-letter-subject">Re: {letter.jobTitle}</p>}

      <p className="rf-letter-greeting">{letter.greeting}</p>

      <div className="rf-letter-body">
        {paragraphs(letter.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <p className="rf-letter-closing">{letter.closing}</p>
      <p className="rf-letter-signature">{data.basics.fullName}</p>
    </div>
  )
}

/* -- Modern Header --------------------------------------------------------- */

export function ModernHeaderLetter({ data, letter }: LetterTemplateProps) {
  return (
    <div className="rf-page rf-letter rf-letter-modern rf-sans">
      <header className="rf-letter-modern-head">
        <div>
          <div className="rf-letter-name-lg">{data.basics.fullName || 'Your Name'}</div>
          {data.basics.headline && <div className="rf-small rf-muted">{data.basics.headline}</div>}
        </div>
        <div className="rf-small rf-muted rf-letter-modern-contact">
          <div>{data.basics.email}</div>
          <div>{data.basics.phone}</div>
          <div>{data.basics.location}</div>
        </div>
      </header>
      <div className="rf-rule" />

      <div className="rf-letter-modern-meta">
        <div>
          {letter.hiringManager && <div className="rf-h3">{letter.hiringManager}</div>}
          {letter.company && <div>{letter.company}</div>}
          {letter.hiringAddress && <div className="rf-small rf-muted">{letter.hiringAddress}</div>}
        </div>
        <div className="rf-letter-date">{formatLetterDate(letter.date)}</div>
      </div>

      {letter.jobTitle && <p className="rf-letter-subject"><strong>Re:</strong> {letter.jobTitle}</p>}

      <p className="rf-letter-greeting">{letter.greeting}</p>

      <div className="rf-letter-body">
        {paragraphs(letter.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <p className="rf-letter-closing">{letter.closing}</p>
      <p className="rf-letter-signature">{data.basics.fullName}</p>
    </div>
  )
}

/* -- Split Column ---------------------------------------------------------- */

export function SplitColumnLetter({ data, letter }: LetterTemplateProps) {
  return (
    <div className="rf-page rf-letter rf-letter-split rf-sans">
      <aside className="rf-letter-split-side">
        <div className="rf-letter-name">{data.basics.fullName || 'Your Name'}</div>
        {data.basics.headline && <div className="rf-small rf-muted">{data.basics.headline}</div>}
        <div className="rf-letter-split-contact">
          {data.basics.email && <div>{data.basics.email}</div>}
          {data.basics.phone && <div>{data.basics.phone}</div>}
          {data.basics.location && <div>{data.basics.location}</div>}
          {data.basics.links.slice(0, 3).map((l) => (
            <div key={l.id}>{l.url}</div>
          ))}
        </div>
        <div className="rf-letter-split-recipient">
          <div className="rf-small rf-muted">To</div>
          {letter.hiringManager && <div>{letter.hiringManager}</div>}
          {letter.company && <div>{letter.company}</div>}
          {letter.hiringAddress && <div className="rf-small">{letter.hiringAddress}</div>}
          <div className="rf-letter-date rf-small rf-muted">{formatLetterDate(letter.date)}</div>
        </div>
      </aside>
      <div className="rf-letter-split-main">
        {letter.jobTitle && <h1 className="rf-letter-split-title">{letter.jobTitle}</h1>}
        <p className="rf-letter-greeting">{letter.greeting}</p>
        <div className="rf-letter-body">
          {paragraphs(letter.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="rf-letter-closing">{letter.closing}</p>
        <p className="rf-letter-signature">{data.basics.fullName}</p>
      </div>
    </div>
  )
}

/* -- Registry --------------------------------------------------------------- */

export interface LetterTemplateEntry {
  id: string
  name: string
  origin: string
  blurb: string
  accent: string
  Component: (p: LetterTemplateProps) => React.ReactElement
}

export const LETTER_TEMPLATES: LetterTemplateEntry[] = [
  {
    id: 'formal',
    name: 'Formal Block',
    origin: 'Standard business letter',
    blurb: 'Serif, right-aligned date, recipient block, greeting, closing. The safest default across industries.',
    accent: '#111827',
    Component: FormalBlockLetter,
  },
  {
    id: 'modern',
    name: 'Modern Header',
    origin: 'Resume Forge',
    blurb: 'Sans-serif banner header that pairs visually with the résumé accent. Same person, same brand.',
    accent: '#2563eb',
    Component: ModernHeaderLetter,
  },
  {
    id: 'split',
    name: 'Split Column',
    origin: 'Resume Forge',
    blurb: 'Sidebar for you and the recipient, letter body on the right. Reads like a card, prints like a letter.',
    accent: '#0f766e',
    Component: SplitColumnLetter,
  },
]

export const LETTER_TEMPLATE_MAP = new Map(LETTER_TEMPLATES.map((t) => [t.id, t]))

export function getLetterTemplate(id: string | null | undefined): LetterTemplateEntry {
  return (id && LETTER_TEMPLATE_MAP.get(id)) || LETTER_TEMPLATES[0]
}
