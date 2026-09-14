import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { decodeProfileShare, type DecodedProfileShare } from '../core/share'
import { useStore } from '../core/store'
import { getTemplate } from '../templates/registry'
import { Button, Card, EmptyState } from '../ui/atoms'
import { Preview } from '../ui/Preview'

/**
 * `/#/share/:blob` — the recipient of a share link lands here. We decode
 * client-side (no server involved) and offer an explicit "Import" button
 * rather than silently writing to their store. The offline-first promise
 * means the whole flow — receive, decode, preview, import — is one round-trip
 * through the URL bar; no account, no network call.
 */
export function SharedProfile() {
  const { blob } = useParams()
  const navigate = useNavigate()
  const { createProfileFromData, lastTemplateId } = useStore()
  const [state, setState] = useState<
    { kind: 'loading' } | { kind: 'ready'; decoded: DecodedProfileShare } | { kind: 'error'; message: string }
  >({ kind: 'loading' })

  useEffect(() => {
    if (!blob) {
      setState({ kind: 'error', message: 'This link has no share payload.' })
      return
    }
    decodeProfileShare(blob)
      .then((decoded) => setState({ kind: 'ready', decoded }))
      .catch((e: Error) => setState({ kind: 'error', message: e.message || 'That link is not a valid Resume Forge share.' }))
  }, [blob])

  const template = getTemplate(lastTemplateId)

  if (state.kind === 'loading') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm text-ink-500">Decoding…</p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <EmptyState
          title="This link could not be decoded"
          body={state.message}
          action={<Button variant="primary" onClick={() => navigate('/')}>Back to formats</Button>}
        />
      </div>
    )
  }

  const { decoded } = state
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            Someone shared {decoded.label ? <em>{decoded.label}</em> : 'a résumé'} with you
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Decoded entirely on your device — the sender's data never touched our servers because we don't have any.
            Preview it below, and choose whether to import into your profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Discard
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const id = createProfileFromData(decoded.label, 'Other', decoded.data)
              navigate(`/edit/${template.id}`)
              void id
            }}
          >
            Import as new profile
          </Button>
        </div>
      </header>

      <Card>
        <p className="mb-3 text-xs text-ink-500">
          Rendering with your current template pick ({template.name}) so you can see what it will look like.
        </p>
        <div className="rounded-xl bg-ink-100 p-4">
          <Preview template={template} data={decoded.data} />
        </div>
      </Card>

      <p className="mt-4 text-[11px] text-ink-400">
        Importing creates a new profile — it does not overwrite anything you already have.
      </p>
    </div>
  )
}
