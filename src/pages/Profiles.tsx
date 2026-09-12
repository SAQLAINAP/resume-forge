import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../core/store'
import { getTemplate } from '../templates/registry'
import { completenessScore } from '../core/completeness'
import { exportJson } from '../core/exporters'
import { Button, Card, EmptyState, ProgressRing } from '../ui/atoms'
import type { Profile } from '../core/types'

export function Profiles() {
  const navigate = useNavigate()
  const {
    profiles,
    activeProfileId,
    lastTemplateId,
    setActiveProfile,
    deleteProfile,
    duplicateProfile,
    renameProfile,
    createProfile,
    replaceData,
  } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const template = getTemplate(lastTemplateId)

  function open(p: Profile) {
    setActiveProfile(p.id)
    navigate(`/edit/${template.id}`)
  }

  async function handleImport(file: File) {
    setImportError(null)
    try {
      const parsed = JSON.parse(await file.text())
      const entries: Array<{ label?: string; data?: unknown }> = Array.isArray(parsed) ? parsed : [parsed]
      let imported = 0
      for (const entry of entries) {
        if (!entry?.data || typeof entry.data !== 'object') continue
        const id = createProfile(entry.label ?? 'Imported profile', 'Other')
        replaceData(id, entry.data as never)
        imported += 1
      }
      if (imported === 0) setImportError('That file did not contain any profiles we could read.')
    } catch {
      setImportError('That file is not valid JSON.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Profiles</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-500">
            One profile per person. Everything is stored on this device only — build a resume for a cousin
            without ever creating an account.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>Import</Button>
          <Button
            onClick={() =>
              exportJson(
                profiles.map((p) => ({ label: p.label, relationship: p.relationship, data: p.data })),
                'resume-forge-backup.json',
              )
            }
            disabled={profiles.length === 0}
          >
            Back up all
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            New resume
          </Button>
        </div>
      </header>

      {importError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">{importError}</p>
      )}

      {profiles.length === 0 ? (
        <EmptyState
          title="No profiles yet"
          body="Pick a format and we will create your first profile as you fill it in."
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse formats
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => {
            const score = completenessScore(p.data, template)
            const isActive = p.id === activeProfileId
            return (
              <Card key={p.id} className={isActive ? 'ring-2 ring-accent-500/30' : ''}>
                <div className="flex flex-wrap items-center gap-4">
                  <ProgressRing value={score} />
                  <div className="min-w-0 flex-1">
                    {editing === p.id ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => {
                          renameProfile(p.id, draft.trim() || p.label)
                          setEditing(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="w-full rounded-lg border border-ink-200 px-2 py-1 text-sm outline-none focus:border-accent-500"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(p.id)
                          setDraft(p.label)
                        }}
                        className="text-left text-sm font-semibold text-ink-900 hover:underline"
                      >
                        {p.label}
                      </button>
                    )}
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {p.relationship} · {p.data.basics.fullName || 'no name yet'} · updated{' '}
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button size="sm" onClick={() => duplicateProfile(p.id)}>
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        exportJson({ label: p.label, relationship: p.relationship, data: p.data }, `${p.label}.json`)
                      }
                    >
                      Export
                    </Button>
                    {confirming === p.id ? (
                      <>
                        <Button size="sm" variant="danger" onClick={() => deleteProfile(p.id)}>
                          Confirm delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => setConfirming(p.id)}>
                        Delete
                      </Button>
                    )}
                    <Button size="sm" variant="primary" onClick={() => open(p)}>
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
}
