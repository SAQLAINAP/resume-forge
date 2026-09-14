import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveProfile } from '../core/store'
import { SOURCE_FORMATS, toSource, type SourceFormat } from '../core/source-export'
import { safeFileName } from '../core/exporters'
import { Button, Card, EmptyState } from '../ui/atoms'

/**
 * Beta source editor. Lets the user see the résumé as LaTeX / Markdown / HTML
 * and copy or download it. Deliberately read-only — round-tripping arbitrary
 * hand-edits back into ResumeData is a whole parser project we don't own yet.
 * The primary purpose is "I need to hand this to Overleaf / a blog / a portal
 * that only takes plain text" without a middleman.
 */
export function SourceEditor() {
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const [format, setFormat] = useState<SourceFormat>('latex')
  const [copied, setCopied] = useState(false)

  const source = useMemo(() => (profile ? toSource(profile.data, format) : ''), [profile, format])
  const active = SOURCE_FORMATS.find((f) => f.id === format)!

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <EmptyState
          title="Pick a profile first"
          body="The source editor serialises the profile you're currently editing. Open a profile to render its source."
          action={
            <Button variant="primary" onClick={() => navigate('/profiles')}>
              Go to profiles
            </Button>
          }
        />
      </div>
    )
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Some browsers refuse clipboard writes from non-secure origins; the user
      // can still select-all in the textarea, so we just fail silently.
    }
  }

  function download() {
    const blob = new Blob([source], { type: active.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = safeFileName(profile!.data.basics.fullName, `source-${active.id}`, active.extension)
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink-900">
            Source editor
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
              Beta
            </span>
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-500">
            One-way serialisation of {profile.label} into LaTeX, Markdown or HTML. Copy or download
            for Overleaf / a blog / any portal that only takes plain text.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-ink-200 bg-white">
            {SOURCE_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`px-3 py-2 text-xs font-medium transition ${
                  format === f.id ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" variant="primary" onClick={download}>
            Download .{active.extension}
          </Button>
        </div>
      </header>

      <Card>
        <textarea
          value={source}
          readOnly
          spellCheck={false}
          className="w-full min-h-[520px] rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-800 outline-none focus:border-accent-500"
        />
        <p className="mt-3 text-[11px] text-ink-500">
          Read-only in this build. Editing here won't sync back into the profile — round-tripping
          plain text into ResumeData is the v4 project. For now, tweak the profile and re-render.
        </p>
      </Card>
    </div>
  )
}
