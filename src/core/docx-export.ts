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
import type { CoverLetter, ResumeData, SectionKey } from './types'
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

/* -- Cover letter DOCX ----------------------------------------------------- */

/**
 * Cover letters are structurally simple — a block-format business letter is
 * sender / date / recipient / greeting / body paragraphs / closing / signature.
 * We do the same native-primitives rebuild here that we do for the résumé, so
 * the .docx is a real Word letter with proper paragraph spacing and no
 * positioned frames. Layout differences between our three letter templates are
 * screen/PDF-only; the DOCX collapses to one canonical, ATS-safe form.
 */
export async function buildLetterDocx(data: ResumeData, letter: CoverLetter): Promise<Blob> {
  const { basics } = data
  const paras: Paragraph[] = []

  paras.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: basics.fullName || 'Your Name', bold: true, size: 28, font: FONT })],
    }),
  )
  const contact = joinNonEmpty([basics.email, basics.phone, basics.location], '  •  ')
  if (contact) {
    paras.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: contact, size: 19, font: FONT, color: '444444' })],
      }),
    )
  }

  if (letter.date) {
    paras.push(new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: letter.date, size: 20, font: FONT })] }))
  }

  const recipient = [letter.hiringManager, letter.company, letter.hiringAddress].filter(Boolean)
  for (const line of recipient) {
    paras.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: line, size: 20, font: FONT })] }))
  }
  if (recipient.length) paras.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun('')] }))

  if (letter.jobTitle) {
    paras.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: 'Re: ', bold: true, size: 20, font: FONT }),
          new TextRun({ text: letter.jobTitle, size: 20, font: FONT }),
        ],
      }),
    )
  }

  if (letter.greeting) {
    paras.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: letter.greeting, size: 20, font: FONT })] }))
  }

  for (const para of letter.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    paras.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: para, size: 20, font: FONT })],
      }),
    )
  }

  if (letter.closing) {
    paras.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: letter.closing, size: 20, font: FONT })] }))
  }
  paras.push(new Paragraph({ spacing: { before: 60, after: 0 }, children: [new TextRun({ text: basics.fullName, bold: true, size: 20, font: FONT })] }))

  const doc = new Document({
    creator: 'Resume Forge',
    title: `${basics.fullName} — Cover letter — ${letter.company || 'Application'}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
        children: paras,
      },
    ],
  })
  return Packer.toBlob(doc)
}
