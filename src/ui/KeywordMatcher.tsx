import { useMemo, useState } from 'react'
import type { ResumeData } from '../core/types'
import { matchKeywords } from '../core/keywords'

const TONE = (n: number) =>
  n >= 70 ? 'text-emerald-700 bg-emerald-50 ring-emerald-200' : n >= 40 ? 'text-amber-700 bg-amber-50 ring-amber-200' : 'text-red-700 bg-red-50 ring-red-200'

const STORAGE_KEY = 'rf-jd-scratch'

/**
 * JD paste box + intersection view. The scratch text is kept in localStorage
 * (not IndexedDB) so it clears if the user opens a private window — the JD is
 * transient by design, we never want to persist it into a profile export.
 */
export function KeywordMatcher({ data }: { data: ResumeData }) {
  const [jd, setJd] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  })

  const { matches, coverage } = useMemo(() => matchKeywords(jd, data), [jd, data])
  const missing = matches.filter((m) => !m.present)
  const present = matches.filter((m) => m.present)

  function onChange(value: string) {
    setJd(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* quota / private mode — non-fatal */
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-600">
          Paste the job description
        </label>
        <textarea
          value={jd}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full posting. It stays in this browser tab — nothing gets uploaded."
          className="min-h-[120px] w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
        />
      </div>

      {matches.length === 0 ? (
        <p className="text-[11px] text-ink-400">
          Overlap analysis runs entirely on-device. Paste a posting to see how your resume matches.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-400">Keyword coverage</p>
            <span className={`rounded-md px-2 py-0.5 text-sm font-bold ring-1 ${TONE(coverage)}`}>{coverage}%</span>
          </div>

          {missing.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                Missing from your resume
              </p>
              <div className="flex flex-wrap gap-1">
                {missing.slice(0, 20).map((m) => (
                  <span
                    key={m.token}
                    className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700 ring-1 ring-red-100"
                    title={`Appears ${m.count}× in the JD`}
                  >
                    {m.token}
                    {m.count > 1 && <span className="ml-1 text-red-400">×{m.count}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {present.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Already covered
              </p>
              <div className="flex flex-wrap gap-1">
                {present.slice(0, 20).map((m) => (
                  <span
                    key={m.token}
                    className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100"
                  >
                    {m.token}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-ink-400">
            Tokens are matched case-insensitively after stripping punctuation. Add missing terms to your skills or a bullet where they truthfully apply — never keyword-stuff.
          </p>
        </>
      )}
    </div>
  )
}
