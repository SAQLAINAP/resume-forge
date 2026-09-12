import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTemplate, TEMPLATES } from '../templates/registry'
import { useActiveProfile, useStore } from '../core/store'
import { BASICS_FIELDS, SECTION_MAP, itemsOf } from '../core/schema'
import { completenessScore, droppedSections, gapsFor } from '../core/completeness'
import { exportDocx, exportPdf, exportPng, safeFileName } from '../core/exporters'
import { Button, Card, ProgressRing } from '../ui/atoms'
import { Field, FieldGrid } from '../ui/Field'
import { Preview, PrintSurface } from '../ui/Preview'
import { LinksEditor } from '../ui/LinksEditor'
import type { SectionKey } from '../core/types'

export function Editor() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const template = getTemplate(templateId)
  const profile = useActiveProfile()
  const setLastTemplate = useStore((s) => s.setLastTemplate)
  const { updateBasics, addItem, updateItem, removeItem, moveItem } = useStore()

  const previewRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<string>('basics')
  const [busy, setBusy] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  if (!profile) {
    navigate('/', { replace: true })
    return null
  }

  const data = profile.data
  const score = completenessScore(data, template)
  const gaps = gapsFor(data, template)
  const dropped = droppedSections(data, template)

  async function run(kind: 'pdf' | 'docx' | 'png') {
    setBusy(kind)
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
    } finally {
      setBusy(null)
    }
  }

  function Accordion({ id, title, count, children }: { id: string; title: string; count?: number; children: React.ReactNode }) {
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

  function SectionEditor({ sectionKey }: { sectionKey: SectionKey }) {
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
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={i === 0}
                  title="Move up"
                  onClick={() => moveItem(profile!.id, sectionKey, String(item.id), -1)}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={i === items.length - 1}
                  title="Move down"
                  onClick={() => moveItem(profile!.id, sectionKey, String(item.id), 1)}
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  title="Remove"
                  onClick={() => removeItem(profile!.id, sectionKey, String(item.id))}
                >
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
                  onChange={(v) => updateItem(profile!.id, sectionKey, String(item.id), { [f.key]: v })}
                />
              ))}
            </FieldGrid>
          </div>
        ))}
        <Button onClick={() => addItem(profile!.id, sectionKey, def.factory())}>+ Add {def.singular.toLowerCase()}</Button>
      </div>
    )
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

          <Accordion id="basics" title="Contact & header">
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

          {template.sections.map((key) => {
            const def = SECTION_MAP.get(key)!
            return (
              <Accordion key={key} id={key} title={def.label} count={(data[key] as unknown[]).length}>
                <SectionEditor sectionKey={key} />
              </Accordion>
            )
          })}
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
