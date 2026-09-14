import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../core/store'
import { LETTER_TEMPLATES, getLetterTemplate } from '../templates/coverLetters'
import { Button, Card, EmptyState } from '../ui/atoms'

/**
 * List page for cover letters — grouped by profile so the mental model stays
 * "one person, many artefacts". A letter is created against a profile and a
 * template; changing the profile propagates the new contact block, changing
 * the template restyles without touching the content.
 */
export function CoverLetters() {
  const navigate = useNavigate()
  const { profiles, activeProfileId, createCoverLetter, duplicateCoverLetter, deleteCoverLetter } = useStore()
  const [busyProfileId, setBusyProfileId] = useState<string | null>(null)
  const [pickerTemplate, setPickerTemplate] = useState<string>(LETTER_TEMPLATES[0].id)
  const [confirming, setConfirming] = useState<string | null>(null)

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0]

  if (profiles.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <EmptyState
          title="Create a profile first"
          body="Cover letters live inside a profile so they share your contact block and letterhead. Pick a résumé format to bootstrap a profile."
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse formats
            </Button>
          }
        />
      </div>
    )
  }

  function newLetter(profileId: string) {
    setBusyProfileId(profileId)
    const label = `Cover letter · ${new Date().toLocaleDateString()}`
    const id = createCoverLetter(profileId, label, pickerTemplate)
    setBusyProfileId(null)
    if (id) navigate(`/cover-letter/${id}/edit`)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Cover letters</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-500">
            Written under a profile, so your contact block and letterhead match your résumé automatically. Same
            print / DOCX / PNG pipeline; same offline-first promise.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pickerTemplate}
            onChange={(e) => setPickerTemplate(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-xs font-medium outline-none focus:border-accent-500"
          >
            {LETTER_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {activeProfile && (
            <Button variant="primary" onClick={() => newLetter(activeProfile.id)} disabled={busyProfileId !== null}>
              New letter
            </Button>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {profiles.map((p) => {
          const letters = p.coverLetters ?? []
          return (
            <div key={p.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-800">{p.label}</h2>
                <Button size="sm" onClick={() => newLetter(p.id)} disabled={busyProfileId !== null}>
                  + Letter for this profile
                </Button>
              </div>
              {letters.length === 0 ? (
                <Card className="border-dashed bg-ink-50/50 text-center text-xs text-ink-400">
                  No letters yet for {p.label}.
                </Card>
              ) : (
                <div className="space-y-2">
                  {letters
                    .slice()
                    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
                    .map((l) => {
                      const t = getLetterTemplate(l.templateId)
                      return (
                        <Card key={l.id}>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => navigate(`/cover-letter/${l.id}/edit`)}
                                className="text-left text-sm font-semibold text-ink-900 hover:underline"
                              >
                                {l.label}
                              </button>
                              <p className="mt-0.5 text-[11px] text-ink-400">
                                {t.name} · {l.company || '—'} · {l.jobTitle || 'no role yet'} · updated{' '}
                                {new Date(l.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" onClick={() => duplicateCoverLetter(p.id, l.id)}>
                                Duplicate
                              </Button>
                              {confirming === l.id ? (
                                <>
                                  <Button size="sm" variant="danger" onClick={() => { deleteCoverLetter(p.id, l.id); setConfirming(null) }}>
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="danger" onClick={() => setConfirming(l.id)}>
                                  Delete
                                </Button>
                              )}
                              <Button size="sm" variant="primary" onClick={() => navigate(`/cover-letter/${l.id}/edit`)}>
                                Open
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
