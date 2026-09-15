import { HashRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Gallery } from './pages/Gallery'
import { Wizard } from './pages/Wizard'
import { Editor } from './pages/Editor'
import { Profiles } from './pages/Profiles'
import { CoverLetters } from './pages/CoverLetters'
import { CoverLetterEditor } from './pages/CoverLetterEditor'
import { SharedProfile } from './pages/SharedProfile'
import { SourceEditor } from './pages/SourceEditor'
import { useStore } from './core/store'

/**
 * Header brand mark. Miniature of public/favicon.svg — the same silhouette
 * (navy plate, off-white doc, folded corner, blue name-bar) so the in-app
 * identity matches the launcher / favicon. Body lines and section marker
 * from the full icon are dropped at 28px because they turn into noise.
 */
function BrandMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Resume Forge"
    >
      <rect width="512" height="512" rx="112" fill="#181b23" />
      <rect x="128" y="96" width="256" height="320" rx="24" fill="#f4f5f8" />
      <path d="M336 96 L384 144 L336 144 Z" fill="#d5d9e2" />
      <rect x="168" y="200" width="176" height="32" rx="10" fill="#3d82f6" />
      <rect x="128" y="200" width="10" height="64" rx="4" fill="#3d82f6" />
    </svg>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const profileCount = useStore((s) => s.profiles.length)
  const letterCount = useStore((s) =>
    s.profiles.reduce((n, p) => n + (p.coverLetters?.length ?? 0), 0),
  )

  // Tab-bar-style active indicator: 2px accent underline + darker text.
  // Replaced the old bg-ink-900 pill because that stole focal weight from
  // the actual page content (which the whole nav exists to reveal).
  // whitespace-nowrap keeps every label on one line so the row can scroll
  // horizontally on narrow phones instead of wrapping into two lines.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-[2px] after:rounded-full after:transition ${
      isActive
        ? 'text-ink-900 after:bg-accent-600'
        : 'text-ink-500 hover:text-ink-800 after:bg-transparent'
    }`

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="sticky top-0 z-20 border-b border-ink-200 bg-white/85 backdrop-blur">
        {/* max-w-7xl matches every page container; px-4 md:px-6 keeps the top
            bar at 16-24px gutter so the Beta chip / long labels stop clipping
            past the screen edge on small displays. */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <BrandMark />
            <span className="hidden text-sm font-semibold tracking-tight text-ink-900 sm:inline">
              Resume Forge
            </span>
          </Link>
          {/* overflow-x-auto lets the nav scroll horizontally on very narrow
              devices instead of overflowing the viewport. */}
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <NavLink to="/" end className={linkClass}>
              Formats
            </NavLink>
            <NavLink to="/profiles" className={linkClass}>
              Profiles{profileCount > 0 && ` (${profileCount})`}
            </NavLink>
            <NavLink to="/cover-letters" className={linkClass}>
              Letters{letterCount > 0 && ` (${letterCount})`}
            </NavLink>
            <NavLink to="/source" className={linkClass}>
              <span>Source</span>
              <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                Beta
              </span>
            </NavLink>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

function Boot({ children }: { children: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated)
  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <p className="text-sm text-ink-400">Loading your data…</p>
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  return (
    // Hash routing so the built app works from file:// and inside a Capacitor
    // WebView without needing a server rewrite rule.
    <HashRouter>
      <Boot>
        <Shell>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/build/:templateId" element={<Wizard />} />
            <Route path="/edit/:templateId" element={<Editor />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/cover-letters" element={<CoverLetters />} />
            <Route path="/cover-letter/:id/edit" element={<CoverLetterEditor />} />
            <Route path="/share/:blob" element={<SharedProfile />} />
            <Route path="/source" element={<SourceEditor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </Boot>
    </HashRouter>
  )
}
