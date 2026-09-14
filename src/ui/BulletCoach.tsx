import { useMemo, useState } from 'react'
import type { ResumeData } from '../core/types'
import { ISSUE_COPY, averageScore, scanResume, type BulletFinding } from '../core/lint'

const TONE = (score: number) =>
  score >= 80 ? 'text-emerald-700 bg-emerald-50 ring-emerald-200' : score >= 55 ? 'text-amber-700 bg-amber-50 ring-amber-200' : 'text-red-700 bg-red-50 ring-red-200'

/**
 * Renders the linter's findings grouped by role. Deliberately static — no
 * "click to auto-fix" button because that would push the app into rewriting
 * user content, which is out of scope for v2 (and one of the things the user
 * explicitly did not want).
 */
export function BulletCoach({ data }: { data: ResumeData }) {
  const findings = useMemo(() => scanResume(data), [data])
  const avg = averageScore(findings)
  const withIssues = findings.filter((f) => f.issues.length > 0)
  const [filter, setFilter] = useState<'all' | 'issues'>('issues')

  const grouped = useMemo(() => {
    const list = filter === 'issues' ? withIssues : findings
    const map = new Map<string, BulletFinding[]>()
    for (const f of list) {
      const key = `${f.section}:${f.itemId}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(f)
    }
    return Array.from(map.values())
  }, [filter, findings, withIssues])

  if (findings.length === 0) {
    return (
      <p className="text-xs text-ink-500">
        Add some experience or project bullets and the coach will grade each one on verb strength, metric use, length and hedging.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Average score</p>
          <p className={`inline-block rounded-md px-2 py-0.5 text-lg font-bold ring-1 ${TONE(avg)}`}>{avg}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-ink-100 p-0.5 text-[11px]">
          {(['issues', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2 py-1 font-medium capitalize transition ${
                filter === f ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              {f === 'issues' ? `${withIssues.length} to fix` : `${findings.length} total`}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
          Nothing to fix. Every bullet passes the checks.
        </p>
      ) : (
        <div className="space-y-3">
          {grouped.map((group) => (
            <div key={`${group[0].section}:${group[0].itemId}`} className="rounded-lg border border-ink-200 bg-ink-50/40 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                {group[0].itemLabel}
              </p>
              <ul className="space-y-2">
                {group.map((f) => (
                  <li key={`${f.itemId}-${f.index}`} className="text-[12px]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-ink-800">{f.text}</p>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ring-1 ${TONE(f.score)}`}>
                        {f.score}
                      </span>
                    </div>
                    {f.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3 text-[11px] text-ink-500">
                        {f.issues.map((i) => (
                          <li key={i}>• {ISSUE_COPY[i]}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
