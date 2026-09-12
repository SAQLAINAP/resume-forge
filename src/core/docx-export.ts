import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx'
import type { ResumeData, SectionKey } from './types'
import { dateRange, joinNonEmpty, prettyUrl, scoreLabel } from './format'

/**
 * Isolated in its own module so the ~350KB docx library lands in a chunk that
 * is only fetched when the user actually asks for a Word file.
 */

const FONT = 'Calibri'
const RIGHT_TAB = 9026

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 21, font: FONT, characterSpacing: 20 })],
  })
}

/** Title on the left, dates flush right via a tab stop — the Word way to do it. */
function titleWithDate(left: TextRun[], right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { before: 80, after: 0 },
    children: [...left, new TextRun({ text: `\t${right}`, size: 19, font: FONT, color: '444444' })],
  })
}

function body(text: string, opts: { italic?: boolean; size?: number; color?: string } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 0 },
    children: [
      new TextRun({ text, italics: opts.italic, size: opts.size ?? 20, font: FONT, color: opts.color }),
    ],
  })
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 20, font: FONT })],
  })
}

function bulletsOf(items: string[]): Paragraph[] {
  return items.filter((b) => b.trim()).map(bullet)
}

function sectionParagraphs(section: SectionKey, data: ResumeData): Paragraph[] {
  const out: Paragraph[] = []

  switch (section) {
    case 'education':
      if (!data.education.length) return []
      out.push(heading('Education'))
      for (const e of data.education) {
        out.push(
          titleWithDate(
            [new TextRun({ text: e.institution, bold: true, size: 21, font: FONT })],
            dateRange(e.startDate, e.endDate, 'Expected'),
          ),
        )
        out.push(body(joinNonEmpty([e.degree, e.field, scoreLabel(e.score, e.scoreType)]), { italic: true }))
        if (e.coursework.length) out.push(body(`Coursework: ${e.coursework.join(', ')}`, { size: 19, color: '444444' }))
      }
      return out

    case 'experience':
      if (!data.experience.length) return []
      out.push(heading('Experience'))
      for (const x of data.experience) {
        out.push(
          titleWithDate(
            [new TextRun({ text: x.company, bold: true, size: 21, font: FONT })],
            dateRange(x.startDate, x.endDate),
          ),
        )
        out.push(body(joinNonEmpty([x.role, x.location]), { italic: true }))
        out.push(...bulletsOf(x.bullets))
        if (x.tech.length) out.push(body(`Stack: ${x.tech.join(', ')}`, { size: 19, color: '444444' }))
      }
      return out

    case 'projects':
      if (!data.projects.length) return []
      out.push(heading('Projects'))
      for (const p of data.projects) {
        out.push(
          titleWithDate(
            [
              new TextRun({ text: p.name, bold: true, size: 21, font: FONT }),
              ...(p.tech.length
                ? [new TextRun({ text: ` | ${p.tech.join(', ')}`, italics: true, size: 19, font: FONT })]
                : []),
            ],
            dateRange(p.startDate, p.endDate),
          ),
        )
        if (p.url) out.push(body(prettyUrl(p.url), { size: 19, color: '444444' }))
        out.push(...bulletsOf(p.bullets))
      }
      return out

    case 'skills':
      if (!data.skills.length) return []
      out.push(heading('Skills'))
      for (const s of data.skills) {
        out.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [
              new TextRun({ text: `${s.category}: `, bold: true, size: 20, font: FONT }),
              new TextRun({ text: s.items.join(', '), size: 20, font: FONT }),
            ],
          }),
        )
      }
      return out

    case 'achievements':
      if (!data.achievements.length) return []
      out.push(heading('Achievements'))
      for (const a of data.achievements) {
        out.push(bullet(joinNonEmpty([a.title, a.issuer, a.description], ' — ')))
      }
      return out

    case 'positions':
      if (!data.positions.length) return []
      out.push(heading('Positions of Responsibility'))
      for (const p of data.positions) {
        out.push(
          titleWithDate(
            [
              new TextRun({ text: p.title, bold: true, size: 21, font: FONT }),
              new TextRun({ text: ` — ${p.organization}`, italics: true, size: 20, font: FONT }),
            ],
            dateRange(p.startDate, p.endDate),
          ),
        )
        out.push(...bulletsOf(p.bullets))
      }
      return out

    case 'certifications':
      if (!data.certifications.length) return []
      out.push(heading('Certifications'))
      for (const c of data.certifications) {
        out.push(bullet(joinNonEmpty([c.name, c.issuer, dateRange(c.date, c.date).split(' – ')[0]], ' — ')))
      }
      return out

    case 'publications':
      if (!data.publications.length) return []
      out.push(heading('Publications'))
      for (const p of data.publications) {
        out.push(bullet(joinNonEmpty([p.authors, p.title, p.venue], '. ')))
      }
      return out

    case 'extracurriculars':
      if (!data.extracurriculars.length) return []
      out.push(heading('Extracurricular Activities'))
      for (const e of data.extracurriculars) {
        out.push(bullet(joinNonEmpty([e.activity, e.organization, e.description], ' — ')))
      }
      return out

    case 'languages':
      if (!data.languages.length) return []
      out.push(heading('Languages'))
      out.push(body(data.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')))
      return out

    default:
      return []
  }
}

/**
 * Word export is generated from the data model, not from the DOM. An
 * HTML-to-Word conversion carries the CSS layout across as tables and
 * positioned frames, which is exactly what ATS parsers choke on. Rebuilding it
 * with native Word headings and bullets gives a file that both a human and a
 * parser can read, and that the user can actually edit afterwards.
 */
export async function buildDocx(
  data: ResumeData,
  sectionOrder: SectionKey[],
): Promise<Blob> {
  const { basics } = data
  const contact = joinNonEmpty(
    [basics.phone, basics.email, basics.location, ...basics.links.map((l) => prettyUrl(l.url))],
    '  •  ',
  )

  const header: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 40 },
      children: [new TextRun({ text: basics.fullName || 'Your Name', bold: true, size: 36, font: FONT })],
    }),
  ]
  if (basics.headline) {
    header.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: basics.headline, size: 21, font: FONT, color: '444444' })],
      }),
    )
  }
  if (contact) {
    header.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: contact, size: 19, font: FONT, color: '444444' })],
      }),
    )
  }
  if (basics.summary.trim()) {
    header.push(heading('Summary'), body(basics.summary))
  }

  const doc = new Document({
    creator: 'Resume Forge',
    title: `${basics.fullName} — Resume`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: [...header, ...sectionOrder.flatMap((s) => sectionParagraphs(s, data))],
      },
    ],
  })

  return Packer.toBlob(doc)
}
