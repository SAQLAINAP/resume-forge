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

function Shell({ children }: { children: React.ReactNode }) {
  const profileCount = useStore((s) => s.profiles.length)
  const letterCount = useStore((s) =>
    s.profiles.reduce((n, p) => n + (p.coverLetters?.length ?? 0), 0),
  )

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'
    }`

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="sticky top-0 z-20 border-b border-ink-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-900 text-xs font-bold text-white">
              RF
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink-900">Resume Forge</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Formats
            </NavLink>
            <NavLink to="/profiles" className={linkClass}>
              Profiles{profileCount > 0 && ` (${profileCount})`}
            </NavLink>
            <NavLink to="/cover-letters" className={linkClass}>
              Cover letters{letterCount > 0 && ` (${letterCount})`}
            </NavLink>
            <NavLink to="/source" className={linkClass}>
              Source
              <span className="ml-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 align-middle">
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
