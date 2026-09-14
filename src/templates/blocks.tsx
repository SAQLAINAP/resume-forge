import type { ResumeData } from '../core/types'
import { dateRange, joinNonEmpty, prettyUrl, scoreLabel } from '../core/format'
import { activeSummary } from '../core/variants'
import { Authors, Bullets, Row, Section } from './primitives'

/**
 * Reusable section renderers. Templates compose these and vary the *order*,
 * *column placement* and *CSS* — which is what actually differs between a
 * Harvard resume and an IIT Bombay one. The content logic is identical, so it
 * lives here once.
 */

export function ExperienceBlock({ data, title = 'Experience' }: { data: ResumeData; title?: string }) {
  if (!data.experience.length) return null
  return (
    <Section title={title}>
      {data.experience.map((e) => (
        <div className="rf-entry" key={e.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{e.company}</span>
                {e.location && <span className="rf-muted rf-small"> — {e.location}</span>}
              </>
            }
            right={dateRange(e.startDate, e.endDate)}
          />
          <Row
            left={<span className="rf-italic">{joinNonEmpty([e.role, e.employmentType !== 'Full-time' ? e.employmentType : ''])}</span>}
            right={null}
          />
          <Bullets items={e.bullets} />
          {e.tech.length > 0 && (
            <div className="rf-small rf-muted" style={{ marginTop: '0.6mm' }}>
              <strong>Stack:</strong> {e.tech.join(', ')}
            </div>
          )}
        </div>
      ))}
    </Section>
  )
}

export function EducationBlock({ data, title = 'Education' }: { data: ResumeData; title?: string }) {
  if (!data.education.length) return null
  return (
    <Section title={title}>
      {data.education.map((e) => (
        <div className="rf-entry" key={e.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{e.institution}</span>
                {e.location && <span className="rf-muted rf-small"> — {e.location}</span>}
              </>
            }
            right={dateRange(e.startDate, e.endDate, 'Expected')}
          />
          <Row
            left={<span className="rf-italic">{joinNonEmpty([e.degree, e.field])}</span>}
            right={scoreLabel(e.score, e.scoreType)}
          />
          {e.coursework.length > 0 && (
            <div className="rf-small rf-muted" style={{ marginTop: '0.5mm' }}>
              <strong>Coursework:</strong> {e.coursework.join(', ')}
            </div>
          )}
        </div>
      ))}
    </Section>
  )
}

/** Compact grid used by Indian campus formats, which expect a marks table. */
export function EducationTableBlock({ data }: { data: ResumeData }) {
  if (!data.education.length) return null
  return (
    <Section title="Education">
      <table className="rf-table">
        <thead>
          <tr>
            <th>Degree</th>
            <th>Institution</th>
            <th>Score</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {data.education.map((e) => (
            <tr key={e.id}>
              <td>{joinNonEmpty([e.degree, e.field], ', ')}</td>
              <td>{e.institution}</td>
              <td>{scoreLabel(e.score, e.scoreType)}</td>
              <td>{dateRange(e.startDate, e.endDate, 'Present')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

export function ProjectsBlock({ data, title = 'Projects' }: { data: ResumeData; title?: string }) {
  if (!data.projects.length) return null
  return (
    <Section title={title}>
      {data.projects.map((p) => (
        <div className="rf-entry" key={p.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{p.name}</span>
                {p.tech.length > 0 && <span className="rf-italic rf-small"> | {p.tech.join(', ')}</span>}
                {p.url && (
                  <span className="rf-small rf-muted">
                    {' '}
                    ·{' '}
                    <a className="rf-link" href={p.url}>
                      {prettyUrl(p.url)}
                    </a>
                  </span>
                )}
              </>
            }
            right={dateRange(p.startDate, p.endDate)}
          />
          <Bullets items={p.bullets} />
        </div>
      ))}
    </Section>
  )
}

export function SkillsBlock({ data, title = 'Skills' }: { data: ResumeData; title?: string }) {
  if (!data.skills.length) return null
  return (
    <Section title={title}>
      {data.skills.map((s) => (
        <div className="rf-skill-row" key={s.id}>
          <span className="rf-skill-cat">{s.category}:</span>
          <span>{s.items.join(', ')}</span>
        </div>
      ))}
    </Section>
  )
}

/** Stacked variant for narrow sidebars where a label + inline list would wrap badly. */
export function SkillsStackedBlock({ data, title = 'Skills' }: { data: ResumeData; title?: string }) {
  if (!data.skills.length) return null
  return (
    <Section title={title}>
      {data.skills.map((s) => (
        <div className="rf-entry" key={s.id}>
          <div className="rf-h3 rf-small">{s.category}</div>
          <div className="rf-small">{s.items.join(', ')}</div>
        </div>
      ))}
    </Section>
  )
}

export function AchievementsBlock({ data, title = 'Achievements' }: { data: ResumeData; title?: string }) {
  if (!data.achievements.length) return null
  return (
    <Section title={title}>
      <ul className="rf-bullets">
        {data.achievements.map((a) => (
          <li key={a.id}>
            <strong>{a.title}</strong>
            {a.issuer && <span className="rf-muted"> — {a.issuer}</span>}
            {a.date && <span className="rf-muted rf-small"> ({dateRange(a.date, a.date).split(' – ')[0]})</span>}
            {a.description && <div className="rf-small rf-muted">{a.description}</div>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function PositionsBlock({ data, title = 'Positions of Responsibility' }: { data: ResumeData; title?: string }) {
  if (!data.positions.length) return null
  return (
    <Section title={title}>
      {data.positions.map((p) => (
        <div className="rf-entry" key={p.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{p.title}</span>
                <span className="rf-italic"> — {p.organization}</span>
              </>
            }
            right={dateRange(p.startDate, p.endDate)}
          />
          <Bullets items={p.bullets} />
        </div>
      ))}
    </Section>
  )
}

export function CertificationsBlock({ data, title = 'Certifications' }: { data: ResumeData; title?: string }) {
  if (!data.certifications.length) return null
  return (
    <Section title={title}>
      <ul className="rf-bullets">
        {data.certifications.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong>
            {c.issuer && <span className="rf-muted"> — {c.issuer}</span>}
            {c.date && <span className="rf-muted rf-small"> ({dateRange(c.date, c.date).split(' – ')[0]})</span>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function PublicationsBlock({ data, title = 'Publications' }: { data: ResumeData; title?: string }) {
  if (!data.publications.length) return null
  return (
    <Section title={title}>
      <ul className="rf-bullets">
        {data.publications.map((p) => (
          <li key={p.id}>
            <Authors authors={p.authors} owner={data.basics.fullName} />
            {p.authors && '. '}
            <em>{p.title}</em>
            {p.venue && <span>. {p.venue}</span>}
            {p.date && <span className="rf-muted">, {dateRange(p.date, p.date).split(' – ')[0]}</span>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function ExtracurricularsBlock({ data, title = 'Extracurricular Activities' }: { data: ResumeData; title?: string }) {
  if (!data.extracurriculars.length) return null
  return (
    <Section title={title}>
      <ul className="rf-bullets">
        {data.extracurriculars.map((e) => (
          <li key={e.id}>
            <strong>{e.activity}</strong>
            {e.organization && <span className="rf-muted"> — {e.organization}</span>}
            {e.description && <div className="rf-small rf-muted">{e.description}</div>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function LanguagesBlock({ data, title = 'Languages' }: { data: ResumeData; title?: string }) {
  if (!data.languages.length) return null
  return (
    <Section title={title}>
      <div className="rf-small">{data.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}</div>
    </Section>
  )
}

/* -- CV-only blocks (v3 beta) --------------------------------------------- */

export function GrantsBlock({ data, title = 'Grants & Funding' }: { data: ResumeData; title?: string }) {
  if (!data.grants.length) return null
  return (
    <Section title={title}>
      {data.grants.map((g) => (
        <div className="rf-entry" key={g.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{g.title}</span>
                {g.role && <span className="rf-italic rf-small"> — {g.role}</span>}
              </>
            }
            right={dateRange(g.startDate, g.endDate)}
          />
          <Row
            left={
              <span className="rf-small">
                {joinNonEmpty([g.funder, g.amount], ' · ')}
              </span>
            }
            right={null}
          />
          {g.description && <div className="rf-small rf-muted">{g.description}</div>}
        </div>
      ))}
    </Section>
  )
}

export function TeachingBlock({ data, title = 'Teaching' }: { data: ResumeData; title?: string }) {
  if (!data.teaching.length) return null
  return (
    <Section title={title}>
      {data.teaching.map((t) => (
        <div className="rf-entry" key={t.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{t.course}</span>
                <span className="rf-italic rf-small"> — {t.role}</span>
              </>
            }
            right={t.term}
          />
          {t.institution && <div className="rf-small rf-muted">{t.institution}</div>}
          {t.description && <div className="rf-small rf-muted">{t.description}</div>}
        </div>
      ))}
    </Section>
  )
}

export function ServiceBlock({ data, title = 'Academic Service' }: { data: ResumeData; title?: string }) {
  if (!data.service.length) return null
  return (
    <Section title={title}>
      {data.service.map((s) => (
        <div className="rf-entry" key={s.id}>
          <Row
            left={
              <>
                <span className="rf-h3">{s.role}</span>
                {s.organization && <span className="rf-italic rf-small"> — {s.organization}</span>}
              </>
            }
            right={dateRange(s.startDate, s.endDate)}
          />
          {s.description && <div className="rf-small rf-muted">{s.description}</div>}
        </div>
      ))}
    </Section>
  )
}

export function TalksBlock({ data, title = 'Invited Talks' }: { data: ResumeData; title?: string }) {
  if (!data.talks.length) return null
  return (
    <Section title={title}>
      <ul className="rf-bullets">
        {data.talks.map((t) => (
          <li key={t.id}>
            <strong>{t.title}</strong>
            {t.venue && <span className="rf-muted"> — {t.venue}</span>}
            {t.location && <span className="rf-muted rf-small"> ({t.location})</span>}
            {t.date && <span className="rf-muted rf-small">, {dateRange(t.date, t.date).split(' – ')[0]}</span>}
            {t.url && (
              <span className="rf-small">
                {' '}
                ·{' '}
                <a className="rf-link" href={t.url}>
                  {prettyUrl(t.url)}
                </a>
              </span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function SummaryBlock({ data, title = 'Summary' }: { data: ResumeData; title?: string }) {
  const text = activeSummary(data.basics)
  if (!text.trim()) return null
  return (
    <Section title={title}>
      <p>{text}</p>
    </Section>
  )
}

export function ContactLine({ data, showDob = false }: { data: ResumeData; showDob?: boolean }) {
  const { basics } = data
  const parts: Array<{ key: string; node: React.ReactNode }> = []
  if (basics.phone) parts.push({ key: 'phone', node: basics.phone })
  if (basics.email)
    parts.push({
      key: 'email',
      node: (
        <a className="rf-link" href={`mailto:${basics.email}`}>
          {basics.email}
        </a>
      ),
    })
  if (basics.location) parts.push({ key: 'loc', node: basics.location })
  if (showDob && basics.dob) parts.push({ key: 'dob', node: `DOB ${basics.dob}` })
  for (const link of basics.links) {
    if (!link.url) continue
    parts.push({
      key: link.id,
      node: (
        <a className="rf-link" href={link.url}>
          {link.label || prettyUrl(link.url)}
        </a>
      ),
    })
  }
  if (!parts.length) return null
  return (
    <div className="rf-contact">
      {parts.map((p) => (
        <span key={p.key}>{p.node}</span>
      ))}
    </div>
  )
}
