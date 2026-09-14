import { useState } from 'react'
import { useStore } from '../core/store'
import { Button } from './atoms'
import type { Profile } from '../core/types'
export { activeSummary } from '../core/variants'

/**
 * Section-level variants. v3 ships just one — the summary — because that's the
 * single field the JD-matcher data (v2) told us people rewrite per posting.
 * More variants (experience orderings, alternate skill groupings) will land in
 * v4 once we know from usage which ones matter.
 *
 * `summaryVariantIndex === null` means "use the base summary above". Otherwise
 * it's an index into `summaryVariants`. Blocks that render the summary read
 * `activeSummary(basics)` — never `basics.summary` directly — so the switch is
 * a one-liner everywhere.
 */
export function SummaryVariants({ profile }: { profile: Profile }) {
  const updateBasics = useStore((s) => s.updateBasics)
  const [pendingLabel, setPendingLabel] = useState('')
  const [drafting, setDrafting] = useState('')
  const basics = profile.data.basics
  const variants = basics.summaryVariants ?? []
  const active = basics.summaryVariantIndex ?? null

  function activate(idx: number | null) {
    updateBasics(profile.id, { summaryVariantIndex: idx })
  }

  function addVariant() {
    const list = [...variants, drafting.trim()]
    updateBasics(profile.id, { summaryVariants: list, summaryVariantIndex: list.length - 1 })
    setDrafting('')
    setPendingLabel('')
  }

  function updateVariant(idx: number, value: string) {
    const list = variants.map((v, i) => (i === idx ? value : v))
    updateBasics(profile.id, { summaryVariants: list })
  }

  function removeVariant(idx: number) {
    const list = variants.filter((_, i) => i !== idx)
    const nextActive = active === idx ? null : active !== null && active > idx ? active - 1 : active
    updateBasics(profile.id, { summaryVariants: list, summaryVariantIndex: nextActive })
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-500">
        Keep several tailored summaries and swap between them per résumé. The base summary above stays as your
        default; select a variant to override it in the preview and every export.
      </p>

      <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            checked={active === null}
            onChange={() => activate(null)}
            className="h-3 w-3 accent-accent-600"
          />
          <span className="font-semibold text-ink-700">Base summary</span>
        </label>
        <p className="mt-1 truncate pl-5 text-[11px] text-ink-500">{basics.summary || '(empty — edit under Contact & header)'}</p>
      </div>

      {variants.map((v, i) => (
        <div key={i} className="rounded-lg border border-ink-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="radio"
                checked={active === i}
                onChange={() => activate(i)}
                className="h-3 w-3 accent-accent-600"
              />
              <span className="font-semibold text-ink-700">Variant {i + 1}</span>
            </label>
            <Button size="sm" variant="danger" onClick={() => removeVariant(i)}>
              ✕
            </Button>
          </div>
          <textarea
            value={v}
            onChange={(e) => updateVariant(i, e.target.value)}
            rows={4}
            className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-accent-500"
            placeholder="Alternative summary for this application…"
          />
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-3">
        <textarea
          value={drafting}
          onChange={(e) => setDrafting(e.target.value)}
          rows={3}
          placeholder="Draft a new variant here"
          className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-accent-500"
        />
        <div className="mt-2 flex items-center justify-between">
          <input
            type="text"
            value={pendingLabel}
            onChange={(e) => setPendingLabel(e.target.value)}
            placeholder="Label (optional)"
            className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] outline-none focus:border-accent-500"
          />
          <Button size="sm" variant="primary" disabled={!drafting.trim()} onClick={addVariant}>
            + Add variant
          </Button>
        </div>
      </div>
    </div>
  )
}

