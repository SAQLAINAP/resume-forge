import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES, type TemplateEntry } from '../templates/registry'
import { CATEGORY_LABEL, FLAIRS, FLAIR_MAP } from '../core/flairs'
import type { Flair } from '../core/types'
import { Button, Chip } from '../ui/atoms'
import { Preview } from '../ui/Preview'
import { useActiveProfile, useStore } from '../core/store'
import { completenessScore } from '../core/completeness'
import { SAMPLE_DATA } from '../core/sample'

const ATS_COPY: Record<TemplateEntry['atsScore'], { label: string; className: string; tip: string }> = {
  excellent: {
    label: 'ATS: excellent',
    className: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    tip: 'Single column, standard headings, no graphics. Parses cleanly everywhere.',
  },
  good: {
    label: 'ATS: good',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    tip: 'Uses a table or second column. Fine for most parsers, occasionally reorders on older ones.',
  },
  fair: {
    label: 'ATS: fair',
    className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    tip: 'Has a coloured header band. Great for humans and direct email, weaker through strict portals.',
  },
}

function groupFlairs(): Array<[Flair['category'], Flair[]]> {
  const order: Flair['category'][] = ['role', 'seniority', 'format', 'origin']
  return order.map((cat) => [cat, FLAIRS.filter((f) => f.category === cat)])
}

// Trending strip. Kept inline next to the search so the common cases don't
// require opening the full-filters drawer. Ordering picks one representative
// filter from each category axis (role, stage, format, region) plus SWE which
// is the single most-picked role in v2 telemetry-equivalent (session recall).
const TRENDING_FILTERS = ['swe', 'data', 'student', 'senior', 'one-page', 'us'] as const

export function Gallery() {
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const setLastTemplate = useStore((s) => s.setLastTemplate)
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  // Full filter grid is collapsed by default. Users see search + 6 trending
  // chips + a "More filters" toggle; the wall of 22 pills is opt-in.
  const [showAllFilters, setShowAllFilters] = useState(false)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      // AND across filters: picking "Research" + "India" should narrow, not widen.
      const flairOk = selected.every((f) => t.flairs.includes(f))
      const textOk =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.flairs.some((f) => FLAIR_MAP.get(f)?.label.toLowerCase().includes(q))
      return flairOk && textOk
    })
  }, [selected, query])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function choose(template: TemplateEntry) {
    setLastTemplate(template.id)
    navigate(`/build/${template.id}`)
  }

  const previewData = profile?.data ?? SAMPLE_DATA
  const usingSample = !profile

  // Trending chips minus any that were already selected (avoid duplicating a
  // chip that's already shown in the "Applied" strip below).
  const trending = TRENDING_FILTERS.filter((id) => !selected.includes(id))
    .map((id) => FLAIR_MAP.get(id))
    .filter((f): f is Flair => Boolean(f))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Choose a format</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Every layout here is a real format used by a real institution or hiring pipeline.
        </p>
      </header>

      {/* Compact filter bar: search + trending chips + "More filters" toggle.
          The full 22-chip grid is opt-in so the first thing on screen is the
          template gallery, not a wall of pills. */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formats, universities, roles…"
            className="min-w-0 flex-1 basis-64 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
          <button
            onClick={() => setShowAllFilters((v) => !v)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              showAllFilters || selected.length > 0
                ? 'border-accent-500/40 bg-accent-500/5 text-accent-700'
                : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
            }`}
            aria-expanded={showAllFilters}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 2h10M3 6h6M5 10h2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filters
            {selected.length > 0 && (
              <span className="rounded-full bg-accent-600 px-1.5 text-[10px] font-semibold text-white">
                {selected.length}
              </span>
            )}
          </button>
        </div>

        {/* Trending strip — one line, horizontally scrollable on small
            screens so it never wraps into a second row. */}
        {!showAllFilters && trending.length > 0 && (
          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Trending
            </span>
            {trending.map((f) => (
              <Chip key={f.id} onClick={() => toggle(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
        )}

        {/* Applied filters — shown even with the drawer closed so users always
            see what's narrowing the grid. */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Applied
            </span>
            {selected.map((id) => {
              const flair = FLAIR_MAP.get(id)
              if (!flair) return null
              return (
                <Chip key={id} active onClick={() => toggle(id)}>
                  {flair.label} ×
                </Chip>
              )
            })}
            <button
              onClick={() => setSelected([])}
              className="ml-1 text-[11px] font-medium text-ink-500 hover:text-ink-800 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Full filter grid — only when the user asks. Grouped by category. */}
        {showAllFilters && (
          <div className="space-y-2 rounded-xl border border-ink-200 bg-white p-4">
            {groupFlairs().map(([cat, flairs]) => (
              <div key={cat} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  {CATEGORY_LABEL[cat]}
                </span>
                {flairs.map((f) => (
                  <Chip key={f.id} active={selected.includes(f.id)} onClick={() => toggle(f.id)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 px-6 py-16 text-center text-sm text-ink-500">
          No format matches all of those filters. Try removing one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => {
            const ats = ATS_COPY[t.atsScore]
            const score = profile ? completenessScore(profile.data, t) : null
            return (
              <article
                key={t.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  onClick={() => choose(t)}
                  className="relative block h-56 overflow-hidden bg-ink-100 p-3 text-left"
                  aria-label={`Use ${t.name}`}
                >
                  <div className="pointer-events-none origin-top scale-[0.98]">
                    <Preview template={t} data={previewData} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-100 to-transparent" />
                  {/* Per-card "Sample" marker replaces the page-wide banner —
                      still signals that the preview isn't real user data, but
                      lives on the preview itself instead of eating vertical
                      space above the fold. Only when no profile exists. */}
                  {usingSample && (
                    <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-500 ring-1 ring-ink-200 backdrop-blur">
                      Sample
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                        {t.name}
                        {t.kind === 'cv' && (
                          <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-200">
                            CV
                          </span>
                        )}
                        {t.beta && (
                          <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                            Beta
                          </span>
                        )}
                      </h2>
                      <p className="text-[11px] text-ink-400">{t.origin}</p>
                    </div>
                    <span
                      title={ats.tip}
                      className={`shrink-0 cursor-help rounded-full px-2 py-0.5 text-[10px] font-semibold ${ats.className}`}
                    >
                      {ats.label}
                    </span>
                  </div>

                  <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-500">{t.blurb}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.flairs.slice(0, 5).map((f) => {
                      const flair = FLAIR_MAP.get(f)
                      if (!flair) return null
                      return (
                        <Chip key={f} title={CATEGORY_LABEL[flair.category]}>
                          {flair.label}
                        </Chip>
                      )
                    })}
                    {t.flairs.length > 5 && <Chip>+{t.flairs.length - 5}</Chip>}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    {score !== null ? (
                      <span className="text-[11px] text-ink-400">
                        Your profile fills <strong className="text-ink-700">{score}%</strong>
                      </span>
                    ) : (
                      <span />
                    )}
                    <Button variant="primary" size="sm" onClick={() => choose(t)}>
                      Use this
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
