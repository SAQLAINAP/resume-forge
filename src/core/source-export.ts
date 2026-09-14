import type { ResumeData } from './types'
import { dateRange, joinNonEmpty, prettyUrl, scoreLabel } from './format'
import { activeSummary } from './variants'

/**
 * Deterministic source serializers for the v3 beta source editor. We render
 * the résumé into three plain-text formats — LaTeX, Markdown, HTML — so the
 * user can hand it to a downstream toolchain (Overleaf, static site, blog,
 * jobs portal that only takes plain text). None of the outputs are meant to
 * round-trip back into ResumeData; they are one-way "give me the words in a
 * different container".
 *
 * The LaTeX output targets a stock `article` class with `enumitem` (already the
 * baseline for every LaTeX resume template on Overleaf). We don't require a
 * bespoke class — copy-paste into any Overleaf blank document should compile.
 */

export type SourceFormat = 'latex' | 'markdown' | 'html'

export const SOURCE_FORMATS: Array<{ id: SourceFormat; label: string; extension: string; mime: string }> = [
  { id: 'latex', label: 'LaTeX', extension: 'tex', mime: 'application/x-tex' },
  { id: 'markdown', label: 'Markdown', extension: 'md', mime: 'text/markdown' },
  { id: 'html', label: 'HTML', extension: 'html', mime: 'text/html' },
]

export function toSource(data: ResumeData, format: SourceFormat): string {
  switch (format) {
    case 'latex':
      return toLatex(data)
    case 'markdown':
      return toMarkdown(data)
    case 'html':
      return toHtml(data)
  }
}

/* -- LaTeX ---------------------------------------------------------------- */

function escLatex(s: string | undefined | null): string {
  if (!s) return ''
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}')
}

function latexBullets(items: string[]): string {
  if (!items.length) return ''
  const lines = items.map((b) => `  \\item ${escLatex(b)}`).join('\n')
  return `\\begin{itemize}[leftmargin=*,itemsep=0pt,parsep=0pt]\n${lines}\n\\end{itemize}`
}

export function toLatex(data: ResumeData): string {
  const { basics } = data
  const out: string[] = []
  out.push('\\documentclass[10pt,a4paper]{article}')
  out.push('\\usepackage[margin=15mm]{geometry}')
  out.push('\\usepackage{enumitem}')
  out.push('\\usepackage[hidelinks]{hyperref}')
  out.push('\\usepackage{titlesec}')
  out.push('\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]')
  out.push('\\titlespacing*{\\section}{0pt}{8pt}{4pt}')
  out.push('\\pagestyle{empty}')
  out.push('\\begin{document}')
  out.push('')
  out.push(`\\begin{center}{\\huge \\textbf{${escLatex(basics.fullName || 'Your Name')}}}\\\\[2pt]`)
  const contactBits: string[] = []
  if (basics.email) contactBits.push(`\\href{mailto:${basics.email}}{${escLatex(basics.email)}}`)
  if (basics.phone) contactBits.push(escLatex(basics.phone))
  if (basics.location) contactBits.push(escLatex(basics.location))
  for (const l of basics.links) if (l.url) contactBits.push(`\\href{${l.url}}{${escLatex(l.label || prettyUrl(l.url))}}`)
  if (contactBits.length) out.push(contactBits.join(' \\quad '))
  out.push('\\end{center}')
  out.push('')

  const summary = activeSummary(basics)
  if (summary.trim()) {
    out.push('\\section*{Summary}')
    out.push(escLatex(summary))
    out.push('')
  }

  if (data.experience.length) {
    out.push('\\section*{Experience}')
    for (const e of data.experience) {
      out.push(`\\textbf{${escLatex(e.company)}} \\hfill ${escLatex(dateRange(e.startDate, e.endDate))}\\\\`)
      out.push(`\\textit{${escLatex(joinNonEmpty([e.role, e.location]))}}\\\\[-4pt]`)
      out.push(latexBullets(e.bullets))
      if (e.tech.length) out.push(`\\textbf{Stack:} ${escLatex(e.tech.join(', '))}`)
      out.push('')
    }
  }

  if (data.education.length) {
    out.push('\\section*{Education}')
    for (const ed of data.education) {
      out.push(`\\textbf{${escLatex(ed.institution)}} \\hfill ${escLatex(dateRange(ed.startDate, ed.endDate, 'Expected'))}\\\\`)
      out.push(`${escLatex(joinNonEmpty([ed.degree, ed.field]))} \\hfill ${escLatex(scoreLabel(ed.score, ed.scoreType))}\\\\`)
      if (ed.coursework.length) out.push(`\\textit{Coursework:} ${escLatex(ed.coursework.join(', '))}`)
      out.push('')
    }
  }

  if (data.projects.length) {
    out.push('\\section*{Projects}')
    for (const p of data.projects) {
      out.push(`\\textbf{${escLatex(p.name)}} \\hfill ${escLatex(dateRange(p.startDate, p.endDate))}\\\\`)
      if (p.tech.length) out.push(`\\textit{${escLatex(p.tech.join(', '))}}\\\\[-4pt]`)
      out.push(latexBullets(p.bullets))
      out.push('')
    }
  }

  if (data.skills.length) {
    out.push('\\section*{Skills}')
    for (const s of data.skills) out.push(`\\textbf{${escLatex(s.category)}:} ${escLatex(s.items.join(', '))}\\\\`)
    out.push('')
  }

  if (data.achievements.length) {
    out.push('\\section*{Achievements}')
    out.push(
      latexBullets(
        data.achievements.map((a) => joinNonEmpty([a.title, a.issuer, a.description], ' — ')),
      ),
    )
    out.push('')
  }

  if (data.publications.length) {
    out.push('\\section*{Publications}')
    out.push(latexBullets(data.publications.map((p) => joinNonEmpty([p.authors, p.title, p.venue], '. '))))
    out.push('')
  }

  out.push('\\end{document}')
  return out.join('\n')
}

/* -- Markdown ------------------------------------------------------------- */

export function toMarkdown(data: ResumeData): string {
  const { basics } = data
  const out: string[] = []
  out.push(`# ${basics.fullName || 'Your Name'}`)
  if (basics.headline) out.push(`_${basics.headline}_`)
  const contactBits: string[] = []
  if (basics.email) contactBits.push(basics.email)
  if (basics.phone) contactBits.push(basics.phone)
  if (basics.location) contactBits.push(basics.location)
  for (const l of basics.links) if (l.url) contactBits.push(`[${l.label || prettyUrl(l.url)}](${l.url})`)
  if (contactBits.length) out.push(contactBits.join(' · '))
  out.push('')

  const summary = activeSummary(basics)
  if (summary.trim()) {
    out.push('## Summary')
    out.push('')
    out.push(summary)
    out.push('')
  }

  if (data.experience.length) {
    out.push('## Experience')
    out.push('')
    for (const e of data.experience) {
      out.push(`### ${e.company} — ${e.role}`)
      out.push(`_${joinNonEmpty([dateRange(e.startDate, e.endDate), e.location])}_`)
      out.push('')
      for (const b of e.bullets) out.push(`- ${b}`)
      if (e.tech.length) out.push(`\n**Stack:** ${e.tech.join(', ')}`)
      out.push('')
    }
  }

  if (data.education.length) {
    out.push('## Education')
    out.push('')
    for (const ed of data.education) {
      out.push(`### ${ed.institution}`)
      out.push(`_${joinNonEmpty([ed.degree, ed.field])}_ — ${dateRange(ed.startDate, ed.endDate, 'Expected')}`)
      const s = scoreLabel(ed.score, ed.scoreType)
      if (s) out.push(`Score: ${s}`)
      if (ed.coursework.length) out.push(`Coursework: ${ed.coursework.join(', ')}`)
      out.push('')
    }
  }

  if (data.projects.length) {
    out.push('## Projects')
    out.push('')
    for (const p of data.projects) {
      out.push(`### ${p.name}`)
      if (p.tech.length) out.push(`_${p.tech.join(', ')}_`)
      out.push('')
      for (const b of p.bullets) out.push(`- ${b}`)
      out.push('')
    }
  }

  if (data.skills.length) {
    out.push('## Skills')
    out.push('')
    for (const s of data.skills) out.push(`- **${s.category}:** ${s.items.join(', ')}`)
    out.push('')
  }

  if (data.achievements.length) {
    out.push('## Achievements')
    out.push('')
    for (const a of data.achievements) {
      out.push(`- **${a.title}**${a.issuer ? ` — ${a.issuer}` : ''}${a.description ? `. ${a.description}` : ''}`)
    }
    out.push('')
  }

  if (data.publications.length) {
    out.push('## Publications')
    out.push('')
    for (const p of data.publications) {
      out.push(`- ${joinNonEmpty([p.authors, `_${p.title}_`, p.venue], '. ')}`)
    }
    out.push('')
  }

  return out.join('\n').trimEnd() + '\n'
}

/* -- HTML ----------------------------------------------------------------- */

function escHtml(s: string | undefined | null): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function toHtml(data: ResumeData): string {
  const { basics } = data
  const out: string[] = []
  out.push('<!doctype html>')
  out.push('<html lang="en">')
  out.push('<head>')
  out.push('  <meta charset="utf-8">')
  out.push(`  <title>${escHtml(basics.fullName || 'Résumé')}</title>`)
  out.push('  <style>')
  out.push('    body { font-family: Georgia, serif; max-width: 780px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }')
  out.push('    h1 { margin: 0; font-size: 28px; }')
  out.push('    h2 { border-bottom: 1px solid #999; text-transform: uppercase; letter-spacing: 0.06em; font-size: 13px; margin-top: 28px; }')
  out.push('    h3 { margin: 12px 0 2px; font-size: 14px; }')
  out.push('    .meta { color: #555; font-size: 13px; }')
  out.push('    ul { padding-left: 20px; }')
  out.push('  </style>')
  out.push('</head>')
  out.push('<body>')
  out.push(`  <h1>${escHtml(basics.fullName || 'Your Name')}</h1>`)
  if (basics.headline) out.push(`  <p class="meta"><em>${escHtml(basics.headline)}</em></p>`)
  const contactBits: string[] = []
  if (basics.email) contactBits.push(`<a href="mailto:${escHtml(basics.email)}">${escHtml(basics.email)}</a>`)
  if (basics.phone) contactBits.push(escHtml(basics.phone))
  if (basics.location) contactBits.push(escHtml(basics.location))
  for (const l of basics.links) if (l.url) contactBits.push(`<a href="${escHtml(l.url)}">${escHtml(l.label || prettyUrl(l.url))}</a>`)
  if (contactBits.length) out.push(`  <p class="meta">${contactBits.join(' · ')}</p>`)

  const summary = activeSummary(basics)
  if (summary.trim()) {
    out.push('  <h2>Summary</h2>')
    out.push(`  <p>${escHtml(summary)}</p>`)
  }

  if (data.experience.length) {
    out.push('  <h2>Experience</h2>')
    for (const e of data.experience) {
      out.push(`  <h3>${escHtml(e.company)} — ${escHtml(e.role)}</h3>`)
      out.push(`  <p class="meta">${escHtml(joinNonEmpty([dateRange(e.startDate, e.endDate), e.location]))}</p>`)
      if (e.bullets.length) out.push(`  <ul>${e.bullets.map((b) => `<li>${escHtml(b)}</li>`).join('')}</ul>`)
      if (e.tech.length) out.push(`  <p class="meta"><strong>Stack:</strong> ${escHtml(e.tech.join(', '))}</p>`)
    }
  }

  if (data.education.length) {
    out.push('  <h2>Education</h2>')
    for (const ed of data.education) {
      out.push(`  <h3>${escHtml(ed.institution)}</h3>`)
      out.push(`  <p class="meta">${escHtml(joinNonEmpty([ed.degree, ed.field]))} — ${escHtml(dateRange(ed.startDate, ed.endDate, 'Expected'))}</p>`)
      const s = scoreLabel(ed.score, ed.scoreType)
      if (s) out.push(`  <p class="meta">Score: ${escHtml(s)}</p>`)
    }
  }

  if (data.projects.length) {
    out.push('  <h2>Projects</h2>')
    for (const p of data.projects) {
      out.push(`  <h3>${escHtml(p.name)}</h3>`)
      if (p.tech.length) out.push(`  <p class="meta">${escHtml(p.tech.join(', '))}</p>`)
      if (p.bullets.length) out.push(`  <ul>${p.bullets.map((b) => `<li>${escHtml(b)}</li>`).join('')}</ul>`)
    }
  }

  if (data.skills.length) {
    out.push('  <h2>Skills</h2>')
    out.push('  <ul>')
    for (const s of data.skills) out.push(`    <li><strong>${escHtml(s.category)}:</strong> ${escHtml(s.items.join(', '))}</li>`)
    out.push('  </ul>')
  }

  if (data.achievements.length) {
    out.push('  <h2>Achievements</h2>')
    out.push('  <ul>')
    for (const a of data.achievements) {
      out.push(`    <li><strong>${escHtml(a.title)}</strong>${a.issuer ? ` — ${escHtml(a.issuer)}` : ''}${a.description ? `. ${escHtml(a.description)}` : ''}</li>`)
    }
    out.push('  </ul>')
  }

  if (data.publications.length) {
    out.push('  <h2>Publications</h2>')
    out.push('  <ul>')
    for (const p of data.publications) {
      out.push(`    <li>${escHtml(joinNonEmpty([p.authors, p.title, p.venue], '. '))}</li>`)
    }
    out.push('  </ul>')
  }

  out.push('</body>')
  out.push('</html>')
  return out.join('\n')
}
