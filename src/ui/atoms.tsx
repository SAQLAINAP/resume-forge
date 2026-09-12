import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'text-red-600 hover:bg-red-50',
}

export function Button({
  variant = 'secondary',
  className = '',
  size = 'md',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${pad} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Chip({
  children,
  active = false,
  onClick,
  title,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  title?: string
}) {
  const base = 'rounded-full px-2.5 py-1 text-[11px] font-medium transition whitespace-nowrap'
  if (!onClick) {
    return (
      <span title={title} className={`${base} bg-ink-100 text-ink-600`}>
        {children}
      </span>
    )
  }
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${base} ${
        active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
      }`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ProgressRing({ value, size = 40 }: { value: number; size?: number }) {
  const r = (size - 5) / 2
  const c = 2 * Math.PI * r
  const tone = value >= 80 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626'
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef2" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        className="transition-all duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="rotate-90 fill-ink-700 text-[10px] font-semibold"
        style={{ transformOrigin: 'center' }}
      >
        {value}
      </text>
    </svg>
  )
}
