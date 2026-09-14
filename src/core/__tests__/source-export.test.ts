import { describe, expect, it } from 'vitest'
import { toHtml, toLatex, toMarkdown } from '../source-export'
import { emptyResumeData } from '../schema'

function sampleData() {
  const data = emptyResumeData()
  data.basics.fullName = 'Test User'
  data.basics.email = 'test@example.com'
  data.basics.summary = 'A short summary with a & ampersand.'
  data.experience.push({
    id: 'e1',
    company: 'Acme',
    role: 'Engineer',
    employmentType: 'Full-time',
    startDate: '2020-01',
    endDate: '',
    current: true,
    location: 'Remote',
    bullets: ['Shipped 3 things in 40%'],
    tech: ['TypeScript'],
  })
  return data
}

describe('source exporters', () => {
  it('LaTeX escapes special characters', () => {
    const src = toLatex(sampleData())
    // The '&' in the summary must be escaped for a stock article class to compile.
    expect(src).toContain('\\&')
    expect(src).toContain('\\begin{document}')
    expect(src).toContain('\\end{document}')
  })

  it('Markdown includes section headings and the name as an H1', () => {
    const src = toMarkdown(sampleData())
    expect(src.startsWith('# Test User')).toBe(true)
    expect(src).toContain('## Experience')
    expect(src).toContain('- Shipped 3 things in 40%')
  })

  it('HTML escapes ampersands and quotes', () => {
    const src = toHtml(sampleData())
    expect(src).toContain('<!doctype html>')
    expect(src).toContain('&amp;')
    // Section heading rendered.
    expect(src).toContain('<h2>Experience</h2>')
  })
})
