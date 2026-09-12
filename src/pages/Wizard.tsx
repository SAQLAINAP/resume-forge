import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTemplate, type TemplateEntry } from '../templates/registry'
import { useActiveProfile, useStore } from '../core/store'
import { BASICS_FIELDS, SECTION_MAP } from '../core/schema'
import { gapsFor } from '../core/completeness'
import { Button, Card } from '../ui/atoms'
import { Field, FieldGrid } from '../ui/Field'
import type { Profile, SectionKey } from '../core/types'

type Step =
  | { kind: 'profile' }
  | { kind: 'basics' }
  | { kind: 'section'; key: SectionKey; required: boolean }

function planSteps(profile: Profile | null, template: TemplateEntry): Step[] {
  if (!profile) return [{ kind: 'profile' }]
  const gaps = gapsFor(profile.data, template)
  const list: Step[] = []
  if (gaps.some((g) => g.kind === 'basics')) list.push({ kind: 'basics' })
  for (const gap of gaps) {
    if (gap.kind !== 'section') continue
    list.push({ kind: 'section', key: gap.key as SectionKey, required: gap.blocking })
  }
  return list
}

/**
 * The wizard is computed, not hardcoded. It diffs the active profile against
 * what the chosen template renders and asks only for the delta — so the second
 * resume a user builds is nearly instant, which is the whole product promise.
 */
export function Wizard() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const template = getTemplate(templateId)

  const profile = useActiveProfile()
  const { createProfile, updateBasics, addItem, updateItem } = useStore()

  const [label, setLabel] = useState('')
  const [relationship, setRelationship] = useState<'Self' | 'Family' | 'Friend' | 'Client' | 'Other'>('Self')
  const [index, setIndex] = useState(0)
  // Draft items are staged locally so abandoning the wizard leaves no debris.
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({})

  /*
   * The plan is captured once per profile+template rather than derived from
   * live data. Recomputing on every keystroke would delete the step you are
   * currently typing into the moment its last required field became non-empty.
   */
  const [steps, setSteps] = useState<Step[]>(() => planSteps(profile, template))
  const planKey = `${profile?.id ?? 'none'}:${template.id}`
  const planKeyRef = useRef(planKey)

  useEffect(() => {
    if (planKeyRef.current === planKey) return
    planKeyRef.current = planKey
    setSteps(planSteps(profile, template))
    setIndex(0)
    setDrafts({})
    // `profile` is intentionally read as a snapshot here, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey])

  const nothingMissing = profile !== null && steps.length === 0
  useEffect(() => {
    if (nothingMissing) navigate(`/edit/${template.id}`, { replace: true })
  }, [nothingMissing, navigate, template.id])

  if (nothingMissing) return null

  const step = steps[Math.min(index, steps.length - 1)]
  const total = steps.length
  const isLast = index >= total - 1

  function next() {
    if (isLast) navigate(`/edit/${template.id}`)
    else setIndex((i) => i + 1)
  }

  function handleCreateProfile() {
    createProfile(label || 'My resume', relationship)
    setIndex(0)
  }

  function draftFor(key: string): Record<string, unknown> {
    if (drafts[key]) return drafts[key]
    const def = SECTION_MAP.get(key as SectionKey)!
    const fresh = def.factory() as Record<string, unknown>
    setDrafts((d) => ({ ...d, [key]: fresh }))
    return fresh
  }

  function setDraftField(key: string, field: string, value: unknown) {
    setDrafts((d) => ({ ...d, [key]: { ...draftFor(key), [field]: value } }))
  }

  function commitSection(key: SectionKey) {
    if (!profile) return
    const draft = drafts[key]
    if (!draft) return
    const existing = (profile.data[key] as Array<{ id: string }>).find((i) => i.id === draft.id)
    if (existing) updateItem(profile.id, key, String(draft.id), draft)
    else addItem(profile.id, key, draft)
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <button onClick={() => navigate('/')} className="mb-4 text-xs font-medium text-ink-500 hover:text-ink-800">
        ← Back to formats
      </button>

      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-600">{template.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          {profile ? 'A few details to fill this in' : 'Who is this resume for?'}
        </h1>
        {profile && (
          <p className="mt-1 text-sm text-ink-500">
            We only ask for what this format needs and your profile does not already have.
          </p>
        )}
      </div>

      {profile && total > 1 && (
        <div className="mb-5">
          <div className="mb-1.5 flex justify-between text-[11px] text-ink-400">
            <span>
              Step {index + 1} of {total}
            </span>
            <span>{Math.round(((index + 1) / total) * 100)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-accent-600 transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Card>
        {step.kind === 'profile' && (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Profiles let you keep separate résumés for yourself, family and friends on this device. Nothing
              leaves your phone or laptop.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">Profile name</label>
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Ananya — SWE"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">This resume is for</label>
              <div className="flex flex-wrap gap-1.5">
                {(['Self', 'Family', 'Friend', 'Client', 'Other'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRelationship(r)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      relationship === r ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={handleCreateProfile}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step.kind === 'basics' && profile && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Contact details</h2>
              <p className="mt-0.5 text-xs text-ink-500">This header appears on every format you ever use.</p>
            </div>
            <FieldGrid>
              {BASICS_FIELDS.filter((f) => f.key !== 'dob' || template.id === 'iitkgp').map((f, i) => (
                <Field
                  key={f.key}
                  field={f}
                  autoFocus={i === 0}
                  value={(profile.data.basics as unknown as Record<string, unknown>)[f.key]}
                  onChange={(v) => updateBasics(profile.id, { [f.key]: v } as never)}
                />
              ))}
            </FieldGrid>
            <div className="flex justify-between pt-1">
              <Button onClick={() => navigate(`/edit/${template.id}`)}>Skip to editor</Button>
              <Button variant="primary" onClick={next}>
                {isLast ? 'Build my resume' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {step.kind === 'section' && profile && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink-900">
                  {SECTION_MAP.get(step.key)!.singular}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    step.required
                      ? 'bg-accent-500/10 text-accent-700'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  {step.required ? 'Needed by this format' : 'Optional'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-500">{SECTION_MAP.get(step.key)!.why}</p>
            </div>
            <FieldGrid>
              {SECTION_MAP.get(step.key)!.fields.map((f, i) => (
                <Field
                  key={f.key}
                  field={f}
                  autoFocus={i === 0}
                  value={draftFor(step.key)[f.key]}
                  onChange={(v) => setDraftField(step.key, f.key, v)}
                />
              ))}
            </FieldGrid>
            <div className="flex justify-between pt-1">
              <Button
                onClick={() => {
                  if (isLast) navigate(`/edit/${template.id}`)
                  else setIndex((i) => i + 1)
                }}
              >
                Skip for now
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  commitSection(step.key)
                  next()
                }}
              >
                {isLast ? 'Build my resume' : 'Save & next'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-4 text-center text-[11px] text-ink-400">
        You can add more entries, reorder and edit everything in the next screen.
      </p>
    </div>
  )
}
