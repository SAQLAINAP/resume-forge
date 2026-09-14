import { nanoid } from 'nanoid'
import { useStore } from '../core/store'
import type { Link } from '../core/types'
import { Button } from './atoms'

interface Kind {
  kind: Link['kind']
  label: string
  prefix: string
}

const KINDS: Kind[] = [
  { kind: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
  { kind: 'github', label: 'GitHub', prefix: 'https://github.com/' },
  { kind: 'portfolio', label: 'Portfolio', prefix: 'https://' },
  { kind: 'scholar', label: 'Scholar', prefix: 'https://scholar.google.com/citations?user=' },
  { kind: 'twitter', label: 'X', prefix: 'https://x.com/' },
  { kind: 'other', label: 'Other', prefix: 'https://' },
]

const KIND_SET = new Set<Link['kind']>(KINDS.map((k) => k.kind))
const DEFAULT_KIND: Kind = KINDS[0]

/** Coerces free-form user input (or a corrupted imported profile) to a known kind. */
function normalize(kind: string): Kind {
  return KIND_SET.has(kind as Link['kind']) ? KINDS.find((k) => k.kind === kind)! : DEFAULT_KIND
}

const input =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20'

export function LinksEditor({ profileId, links }: { profileId: string; links: Link[] }) {
  const updateBasics = useStore((s) => s.updateBasics)

  function write(next: Link[]) {
    updateBasics(profileId, { links: next })
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-600">Profile links</label>
      <div className="space-y-2">
        {links.map((link) => (
          <div key={link.id} className="flex gap-2">
            <select
              value={normalize(link.kind).kind}
              onChange={(e) => {
                const preset = normalize(e.target.value)
                write(
                  links.map((l) =>
                    l.id === link.id
                      ? { ...l, kind: preset.kind, label: l.label || preset.label, url: l.url || preset.prefix }
                      : l,
                  ),
                )
              }}
              className={`${input} w-28 shrink-0`}
            >
              {KINDS.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
            <input
              className={input}
              placeholder="https://…"
              value={link.url}
              onChange={(e) => write(links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))}
            />
            <Button
              size="sm"
              variant="danger"
              title="Remove link"
              onClick={() => write(links.filter((l) => l.id !== link.id))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        className="mt-2"
        onClick={() => write([...links, { id: nanoid(), kind: 'linkedin', label: 'LinkedIn', url: '' }])}
      >
        + Add link
      </Button>
      <p className="mt-1 text-[11px] text-ink-400">
        Shown in the header. The printed version uses a shortened form but keeps the real link clickable.
      </p>
    </div>
  )
}
