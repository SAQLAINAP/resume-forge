import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useActiveProfile, useStore } from '../core/store'
import { exportLetterDocx, exportPdf, exportPng, safeFileName } from '../core/exporters'
import { LETTER_TEMPLATES, getLetterTemplate } from '../templates/coverLetters'
import { Button, Card } from '../ui/atoms'
import { LetterPreview, LetterPrintSurface } from '../ui/LetterPreview'
import type { CoverLetter } from '../core/types'

/**
 * The cover-letter editor mirrors the résumé editor: form on the left, live
 * physically-sized preview on the right, export buttons that reuse the same
 * print/DOCX/PNG pipelines. Because the letter shares the profile's contact
 * block, editing the profile once cascades into every letter — the point of
 * keeping letters on the profile in the first place.
 */
export function CoverLetterEditor() {
  const { id: letterId } = useParams()
  const navigate = useNavigate()
  // The letter editor also has to look across profiles — the user might click a
  // cover-letter link from the index while the "active" profile is a different
  // person. Fall back to whichever profile actually owns this letter.
  const activeProfile = useActiveProfile()
  const profiles = useStore((s) => s.profiles)
  const profile = useMemo(() => {
    const own = profiles.find((p) => (p.coverLetters ?? []).some((l) => l.id === letterId))
    return own ?? activeProfile
  }, [profiles, activeProfile, letterId])
  const { updateCoverLetter, deleteCoverLetter } = useStore()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const letter = useMemo<CoverLetter | null>(
    () => profile?.coverLetters?.find((l) => l.id === letterId) ?? null,
    [profile, letterId],
  )
  const template = getLetterTemplate(letter?.templateId)

  useEffect(() => {
    if (!profile || !letter) navigate('/cover-letters', { replace: true })
  }, [profile, letter, navigate])

  if (!profile || !letter) return null

  function set(patch: Partial<CoverLetter>) {
    if (!profile || !letter) return
    updateCoverLetter(profile.id, letter.id, patch)
  }

  async function run(kind: 'pdf' | 'docx' | 'png') {
    if (!profile || !letter) return
    setBusy(kind)
    setError(null)
    try {
      if (kind === 'pdf') {
        exportPdf()
      } else if (kind === 'docx') {
        await exportLetterDocx(
          profile.data,
          letter,
          safeFileName(profile.data.basics.fullName, `letter-${letter.company || 'application'}`, 'docx'),
        )
      } else if (previewRef.current) {
        await exportPng(
          previewRef.current,
          safeFileName(profile.data.basics.fullName, `letter-${letter.company || 'application'}`, 'png'),
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : `Could not build ${kind.toUpperCase()}.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <LetterPrintSurface template={template} data={profile.data} letter={letter} />

      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-900">{letter.label}</h1>
          <p className="text-xs text-ink-500">
            Cover letter · {profile.label} · {template.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={template.id}
            onChange={(e) => set({ templateId: e.target.value })}
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-xs font-medium outline-none focus:border-accent-500"
          >
            {LETTER_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="danger" onClick={() => {
            if (!profile) return
            deleteCoverLetter(profile.id, letter.id)
            navigate('/cover-letters')
          }}>
            Delete
          </Button>
          <Button size="sm" onClick={() => run('docx')} disabled={busy !== null}>
            {busy === 'docx' ? 'Building…' : 'Word'}
          </Button>
          <Button size="sm" onClick={() => run('png')} disabled={busy !== null}>
            {busy === 'png' ? 'Rendering…' : 'Image'}
          </Button>
          <Button size="sm" variant="primary" onClick={() => run('pdf')} disabled={busy !== null}>
            Download PDF
          </Button>
        </div>
      </header>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
          <span>Export failed: {error}</span>
          <button onClick={() => setError(null)} className="shrink-0 font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Label</h3>
            <input
              value={letter.label}
              onChange={(e) => set({ label: e.target.value })}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-accent-500"
            />
          </Card>

          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">The role</h3>
            <div className="grid grid-cols-2 gap-3">
              <LabelledField label="Company">
                <input value={letter.company} onChange={(e) => set({ company: e.target.value })} className="input" />
              </LabelledField>
              <LabelledField label="Position">
                <input value={letter.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} className="input" />
              </LabelledField>
              <LabelledField label="Hiring manager">
                <input value={letter.hiringManager} onChange={(e) => set({ hiringManager: e.target.value })} className="input" />
              </LabelledField>
              <LabelledField label="Date">
                <input type="date" value={letter.date} onChange={(e) => set({ date: e.target.value })} className="input" />
              </LabelledField>
              <div className="col-span-2">
                <LabelledField label="Address (optional)">
                  <input value={letter.hiringAddress} onChange={(e) => set({ hiringAddress: e.target.value })} className="input" placeholder="1 Hacker Way, Menlo Park, CA" />
                </LabelledField>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Letter body</h3>
            <div className="space-y-3">
              <LabelledField label="Greeting">
                <input value={letter.greeting} onChange={(e) => set({ greeting: e.target.value })} className="input" />
              </LabelledField>
              <LabelledField label="Body — separate paragraphs with a blank line">
                <textarea
                  value={letter.body}
                  onChange={(e) => set({ body: e.target.value })}
                  rows={14}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-accent-500"
                  placeholder={
                    "I'm writing about the Senior Backend Engineer role at Example Corp.\n\nAt Razorpay I rebuilt the settlement ledger from scratch — cutting reconciliation lag from 45 minutes to under two, for 3M merchants.\n\nI would welcome the chance to bring that pattern of small, boring, load-bearing infra work to your team."
                  }
                />
              </LabelledField>
              <LabelledField label="Closing">
                <input value={letter.closing} onChange={(e) => set({ closing: e.target.value })} className="input" />
              </LabelledField>
              <p className="text-[11px] text-ink-500">
                Your name auto-fills as the signature — edit it on the profile if wrong.
              </p>
            </div>
          </Card>
        </div>

        <div>
          <div className="sticky top-4 rounded-xl bg-ink-100 p-4">
            <LetterPreview template={template} data={profile.data} letter={letter} nodeRef={previewRef} />
            <p className="mt-3 text-center text-[11px] text-ink-400">
              Live preview at true letter size (216 × 279 mm). Same page you print.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-ink-500">{label}</span>
      {children}
    </label>
  )
}
