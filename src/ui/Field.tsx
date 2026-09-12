import type { FieldDef } from '../core/schema'

const inputClass =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20'

interface Props {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
  autoFocus?: boolean
}

export function Field({ field, value, onChange, autoFocus }: Props) {
  const id = `f-${field.key}`

  function control() {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            autoFocus={autoFocus}
            className={`${inputClass} min-h-[84px] resize-y`}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )

      case 'bullets':
        return (
          <textarea
            id={id}
            autoFocus={autoFocus}
            className={`${inputClass} min-h-[110px] resize-y font-mono text-[13px] leading-relaxed`}
            placeholder={'Built X that did Y, cutting Z by 40%\nOwned the migration of ...'}
            value={(Array.isArray(value) ? value : []).join('\n')}
            onChange={(e) => onChange(e.target.value.split('\n'))}
          />
        )

      case 'tags':
        return (
          <input
            id={id}
            autoFocus={autoFocus}
            className={inputClass}
            placeholder={field.placeholder ?? 'Comma separated'}
            value={(Array.isArray(value) ? value : []).join(', ')}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  // Keep the trailing empty entry while the user is mid-type.
                  .filter((s, i, arr) => s.length > 0 || i === arr.length - 1),
              )
            }
            onBlur={(e) =>
              onChange(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        )

      case 'select':
        return (
          <select
            id={id}
            autoFocus={autoFocus}
            className={inputClass}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            id={id}
            autoFocus={autoFocus}
            type={field.type === 'month' ? 'month' : field.type === 'date' ? 'date' : 'text'}
            className={inputClass}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )
    }
  }

  return (
    <div className={field.half ? 'sm:col-span-1' : 'sm:col-span-2'}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-600">
        {field.label}
        {field.required && <span className="ml-1 text-accent-600">*</span>}
      </label>
      {control()}
      {field.hint && <p className="mt-1 text-[11px] leading-snug text-ink-400">{field.hint}</p>}
    </div>
  )
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}
