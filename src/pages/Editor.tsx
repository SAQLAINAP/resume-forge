import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTemplate, TEMPLATES, type TemplateEntry } from '../templates/registry'
import { useActiveProfile, useStore } from '../core/store'
import { BASICS_FIELDS, SECTION_MAP, itemsOf } from '../core/schema'
import { completenessScore, droppedSections, gapsFor } from '../core/completeness'
import { exportDocx, exportPdf, exportPng, safeFileName } from '../core/exporters'
import { Button, Card, ProgressRing } from '../ui/atoms'
import { Field, FieldGrid } from '../ui/Field'
import { Preview, PrintSurface } from '../ui/Preview'
import { LinksEditor } from '../ui/LinksEditor'
import { SummaryVariants } from '../ui/SummaryVariants'
import { BulletCoach } from '../ui/BulletCoach'
import { KeywordMatcher } from '../ui/KeywordMatcher'
import { PageFitMeter } from '../ui/PageFitMeter'
import type { ResumeData, SectionKey } from '../core/types'

/**
 * The editor deliberately renders as a pure function of the persisted profile.
 * Every mutation goes through the store so undo/redo and the completeness ring
 * see the same history the DOM does.
 */
export function Editor() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const template = getTemplate(templateId)
  const profile = useActiveProfile()
  const setLastTemplate = useStore((s) => s.setLastTemplate)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const canUndo = useStore((s) => s.history.past.length > 0)
  const canRedo = useStore((s) => s.history.future.length > 0)
  const { updateBasics, addItem, updateItem, removeItem, moveItem } = useStore()

  const previewRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<string>('basics')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [assistTab, setAssistTab] = useState<'bullets' | 'keywords' | 'fit' | null>('bullets')

  // Redirects belong in an effect — never in the render body.
  useEffect(() => {
    if (!profile) navigate('/', { replace: true })
  }, [profile, navigate])

  // Ctrl/Cmd+Z + Shift+Z power-user path. The editor is the only place undo/redo
  // is safe (Gallery is stateless, Wizard has its own drafts).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const target = e.target as HTMLElement | null
      // Don't hijack the OS-native undo/redo while typing.
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  if (!profile) return null

  const data = profile.data
  const score = completenessScore(data, template)
  const gaps = gapsFor(data, template)
  const dropped = droppedSections(data, template)

  async function run(kind: 'pdf' | 'docx' | 'png') {
    setBusy(kind)
    setError(null)
    try {
      if (kind === 'pdf') {
        exportPdf()
      } else if (kind === 'docx') {
        await exportDocx(
          data,
          template.sections,
          safeFileName(data.basics.fullName, template.name, 'docx'),
        )
      } else if (previewRef.current) {
        await exportPng(previewRef.current, safeFileName(data.basics.fullName, template.name, 'png'))
      }
    } catch (e) {
      // Surface it — a silent failure looks like the app hung.
      setError(e instanceof Error ? e.message : `Could not build ${kind.toUpperCase()}.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <PrintSurface template={template} data={data} />

      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProgressRing value={score} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-900">{profile.label}</h1>
            <p className="text-xs text-ink-500">
              {template.name} · {template.origin}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-0.5 rounded-lg border border-ink-200 bg-white p-0.5 sm:flex">
            <Button size="sm" variant="ghost" disabled={!canUndo} title="Undo (⌘Z)" onClick={undo}>
              ↶
            </Button>
            <Button size="sm" variant="ghost" disabled={!canRedo} title="Redo (⇧⌘Z)" onClick={redo}>
              ↷
            </Button>
          </div>
          <select
            value={template.id}
            onChange={(e) => {
              setLastTemplate(e.target.value)
              navigate(`/edit/${e.target.value}`)
            }}
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-xs font-medium outline-none focus:border-accent-500"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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

      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 lg:hidden">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition ${
              mobileTab === tab ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className={`space-y-3 ${mobileTab === 'edit' ? '' : 'hidden lg:block'}`}>
          {gaps.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/60">
              <h3 className="text-xs font-semibold text-amber-900">
                {gaps.filter((g) => g.blocking).length > 0 ? 'This format still needs' : 'Optional additions'}
              </h3>
              <ul className="mt-1.5 space-y-1">
                {gaps.slice(0, 5).map((g) => (
                  <li key={`${g.kind}-${g.key}`} className="text-[11px] text-amber-800">
                    <strong>{g.label}</strong>
                    {!g.blocking && ' (optional)'} — {g.why}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {dropped.length > 0 && (
            <Card className="border-ink-200 bg-ink-50">
              <h3 className="text-xs font-semibold text-ink-700">Not shown in this format</h3>
              <p className="mt-1 text-[11px] text-ink-500">
                Your profile has {dropped.map((k) => SECTION_MAP.get(k)!.label.toLowerCase()).join(', ')}, which{' '}
                {template.name} does not render. The data is safe — switch format to use it.
              </p>
            </Card>
          )}

          <Accordion id="basics" title="Contact & header" open={open} setOpen={setOpen}>
            <div className="space-y-5">
              <FieldGrid>
                {BASICS_FIELDS.map((f) => (
                  <Field
                    key={f.key}
                    field={f}
                    value={(data.basics as unknown as Record<string, unknown>)[f.key]}
                    onChange={(v) => updateBasics(profile.id, { [f.key]: v } as never)}
                  />
                ))}
              </FieldGrid>
              <LinksEditor profileId={profile.id} links={data.basics.links} />
            </div>
          </Accordion>

          <Accordion
            id="summary-variants"
            title="Summary variants"
            count={(data.basics.summaryVariants ?? []).length}
            open={open}
            setOpen={setOpen}
          >
            <SummaryVariants profile={profile} />
          </Accordion>

          {template.sections.map((key) => {
            const def = SECTION_MAP.get(key)!
            return (
              <Accordion key={key} id={key} title={def.label} count={(data[key] as unknown[]).length} open={open} setOpen={setOpen}>
                <SectionEditor
                  sectionKey={key}
                  profileId={profile.id}
                  data={data}
                  onAdd={addItem}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onMove={moveItem}
                />
              </Accordion>
            )
          })}

          <AssistPanel
            template={template}
            data={data}
            tab={assistTab}
            setTab={setAssistTab}
            previewRef={previewRef}
          />
        </div>

        <div className={`${mobileTab === 'preview' ? '' : 'hidden lg:block'}`}>
          <div className="sticky top-4 rounded-xl bg-ink-100 p-4">
            <Preview template={template} data={data} nodeRef={previewRef} />
            <p className="mt-3 text-center text-[11px] text-ink-400">
              Live preview at true page size. What you see is what prints.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -- Extracted so parent renders do not remount every sub-form ------------- */

interface AccordionProps {
  id: string
  title: string
  count?: number
  open: string
  setOpen: (id: string) => void
  children: React.ReactNode
}

function Accordion({ id, title, count, open, setOpen, children }: AccordionProps) {
  const isOpen = open === id
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <button
        onClick={() => setOpen(isOpen ? '' : id)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-ink-50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
          {title}
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
              {count}
            </span>
          )}
        </span>
        <span className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {isOpen && <div className="border-t border-ink-100 px-4 py-4">{children}</div>}
    </div>
  )
}

interface SectionEditorProps {
  sectionKey: SectionKey
  profileId: string
  data: ResumeData
  onAdd: (id: string, section: SectionKey, item: unknown) => void
  onUpdate: (id: string, section: SectionKey, itemId: string, patch: Record<string, unknown>) => void
  onRemove: (id: string, section: SectionKey, itemId: string) => void
  onMove: (id: string, section: SectionKey, itemId: string, dir: -1 | 1) => void
}

function SectionEditor({ sectionKey, profileId, data, onAdd, onUpdate, onRemove, onMove }: SectionEditorProps) {
  const def = SECTION_MAP.get(sectionKey)!
  const items = itemsOf(data, sectionKey)
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500">{def.why}</p>
      {items.map((item, i) => (
        <div key={String(item.id)} className="rounded-lg border border-ink-200 bg-ink-50/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-800">{def.titleOf(item)}</p>
              {def.subtitleOf(item) && (
                <p className="truncate text-[11px] text-ink-400">{def.subtitleOf(item)}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button size="sm" variant="ghost" disabled={i === 0} title="Move up" onClick={() => onMove(profileId, sectionKey, String(item.id), -1)}>
                ↑
              </Button>
              <Button size="sm" variant="ghost" disabled={i === items.length - 1} title="Move down" onClick={() => onMove(profileId, sectionKey, String(item.id), 1)}>
                ↓
              </Button>
              <Button size="sm" variant="danger" title="Remove" onClick={() => onRemove(profileId, sectionKey, String(item.id))}>
                ✕
              </Button>
            </div>
          </div>
          <FieldGrid>
            {def.fields.map((f) => (
              <Field
                key={f.key}
                field={f}
                value={item[f.key]}
                onChange={(v) => onUpdate(profileId, sectionKey, String(item.id), { [f.key]: v })}
              />
            ))}
          </FieldGrid>
        </div>
      ))}
      <Button onClick={() => onAdd(profileId, sectionKey, def.factory())}>+ Add {def.singular.toLowerCase()}</Button>
    </div>
  )
}

/* -- Assist panel groups the three v2 helpers into one card --------------- */

function AssistPanel({
  template,
  data,
  tab,
  setTab,
  previewRef,
}: {
  template: TemplateEntry
  data: ResumeData
  tab: 'bullets' | 'keywords' | 'fit' | null
  setTab: (t: 'bullets' | 'keywords' | 'fit' | null) => void
  previewRef: React.RefObject<HTMLDivElement | null>
}) {
  const tabs = useMemo(
    () =>
      [
        { id: 'bullets' as const, label: 'Bullet coach' },
        { id: 'keywords' as const, label: 'Keyword match' },
        { id: 'fit' as const, label: 'Page fit' },
      ],
    [],
  )
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div className="flex border-b border-ink-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(tab === t.id ? null : t.id)}
            className={`flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition ${
              tab === t.id ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'bullets' && (
        <div className="px-4 py-4">
          <BulletCoach data={data} />
        </div>
      )}
      {tab === 'keywords' && (
        <div className="px-4 py-4">
          <KeywordMatcher data={data} />
        </div>
      )}
      {tab === 'fit' && (
        <div className="px-4 py-4">
          <PageFitMeter template={template} previewRef={previewRef} />
        </div>
      )}
    </div>
  )
}
