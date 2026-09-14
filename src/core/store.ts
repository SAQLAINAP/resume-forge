import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { nanoid } from 'nanoid'
import { emptyResumeData } from './schema'
import type { Profile, ResumeData, SectionKey } from './types'

/**
 * IndexedDB rather than localStorage: resumes with long bullet lists and several
 * profiles blow past the 5MB localStorage ceiling, and IDB writes are async so
 * typing in the editor never blocks paint.
 */
const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => idbDel(name),
}

/**
 * Undo/redo is a snapshot ring around the writeable state, not a diff or CRDT.
 * The persisted state is small (JSON of every profile) so keeping ~50 shallow
 * clones is a few hundred KB at worst, which we can afford. Diffing would save
 * bytes but is fragile against schema changes; snapshots survive them for free.
 */
const HISTORY_LIMIT = 50
const HISTORY_DEBOUNCE_MS = 350

interface HistorySnapshot {
  profiles: Profile[]
  activeProfileId: string | null
  lastTemplateId: string | null
}

interface History {
  past: HistorySnapshot[]
  future: HistorySnapshot[]
}

interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  lastTemplateId: string | null
  hydrated: boolean
  history: History

  createProfile: (label: string, relationship: Profile['relationship']) => string
  deleteProfile: (id: string) => void
  duplicateProfile: (id: string) => string | null
  setActiveProfile: (id: string) => void
  renameProfile: (id: string, label: string) => void
  setLastTemplate: (templateId: string) => void

  updateBasics: (id: string, patch: Partial<ResumeData['basics']>) => void
  addItem: (id: string, section: SectionKey, item: unknown) => void
  updateItem: (id: string, section: SectionKey, itemId: string, patch: Record<string, unknown>) => void
  removeItem: (id: string, section: SectionKey, itemId: string) => void
  moveItem: (id: string, section: SectionKey, itemId: string, direction: -1 | 1) => void
  replaceData: (id: string, data: ResumeData) => void

  undo: () => void
  redo: () => void
}

function touch(profile: Profile): Profile {
  return { ...profile, updatedAt: new Date().toISOString() }
}

function snapshotOf(s: AppState): HistorySnapshot {
  return {
    profiles: s.profiles,
    activeProfileId: s.activeProfileId,
    lastTemplateId: s.lastTemplateId,
  }
}

/**
 * Coalesces bursts of edits into one undo step. Typing a bullet character by
 * character should undo as a phrase, not thirty keystrokes — otherwise a single
 * ⌘Z is nearly useless.
 */
let lastPushAt = 0
function pushHistory(prev: AppState): History {
  const now = Date.now()
  const past = prev.history.past.slice()
  if (now - lastPushAt > HISTORY_DEBOUNCE_MS || past.length === 0) {
    past.push(snapshotOf(prev))
    if (past.length > HISTORY_LIMIT) past.shift()
  }
  lastPushAt = now
  return { past, future: [] }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
        profiles: [] as Profile[],
        activeProfileId: null as string | null,
        lastTemplateId: null as string | null,
        hydrated: false as boolean,
        history: { past: [], future: [] } as History,

        createProfile: (label, relationship) => {
          const now = new Date().toISOString()
          const profile: Profile = {
            id: nanoid(),
            label: label.trim() || 'Untitled profile',
            relationship,
            createdAt: now,
            updatedAt: now,
            data: emptyResumeData(),
          }
          set((s) => ({
            history: pushHistory(s),
            profiles: [...s.profiles, profile],
            activeProfileId: profile.id,
          }))
          return profile.id
        },

        deleteProfile: (id) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.filter((p) => p.id !== id),
            activeProfileId:
              s.activeProfileId === id ? (s.profiles.filter((p) => p.id !== id)[0]?.id ?? null) : s.activeProfileId,
          })),

        duplicateProfile: (id) => {
          const source = get().profiles.find((p) => p.id === id)
          if (!source) return null
          const now = new Date().toISOString()
          const copy: Profile = {
            ...structuredClone(source),
            id: nanoid(),
            label: `${source.label} (copy)`,
            createdAt: now,
            updatedAt: now,
          }
          set((s) => ({
            history: pushHistory(s),
            profiles: [...s.profiles, copy],
            activeProfileId: copy.id,
          }))
          return copy.id
        },

        setActiveProfile: (id) => set({ activeProfileId: id }),

        renameProfile: (id, label) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) => (p.id === id ? touch({ ...p, label }) : p)),
          })),

        setLastTemplate: (templateId) => set({ lastTemplateId: templateId }),

        updateBasics: (id, patch) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) =>
              p.id === id ? touch({ ...p, data: { ...p.data, basics: { ...p.data.basics, ...patch } } }) : p,
            ),
          })),

        addItem: (id, section, item) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) =>
              p.id === id
                ? touch({ ...p, data: { ...p.data, [section]: [...(p.data[section] as unknown[]), item] } })
                : p,
            ),
          })),

        updateItem: (id, section, itemId, patch) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) =>
              p.id === id
                ? touch({
                    ...p,
                    data: {
                      ...p.data,
                      [section]: (p.data[section] as Array<{ id: string }>).map((it) =>
                        it.id === itemId ? { ...it, ...patch } : it,
                      ),
                    },
                  })
                : p,
            ),
          })),

        removeItem: (id, section, itemId) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) =>
              p.id === id
                ? touch({
                    ...p,
                    data: {
                      ...p.data,
                      [section]: (p.data[section] as Array<{ id: string }>).filter((it) => it.id !== itemId),
                    },
                  })
                : p,
            ),
          })),

        moveItem: (id, section, itemId, direction) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) => {
              if (p.id !== id) return p
              const list = [...(p.data[section] as Array<{ id: string }>)]
              const from = list.findIndex((it) => it.id === itemId)
              const to = from + direction
              if (from < 0 || to < 0 || to >= list.length) return p
              ;[list[from], list[to]] = [list[to], list[from]]
              return touch({ ...p, data: { ...p.data, [section]: list } })
            }),
          })),

        replaceData: (id, data) =>
          set((s) => ({
            history: pushHistory(s),
            profiles: s.profiles.map((p) => (p.id === id ? touch({ ...p, data }) : p)),
          })),

        undo: () =>
          set((s) => {
            const past = s.history.past.slice()
            const prev = past.pop()
            if (!prev) return {}
            lastPushAt = 0
            return {
              ...prev,
              history: { past, future: [...s.history.future, snapshotOf(s)].slice(-HISTORY_LIMIT) },
            }
          }),

        redo: () =>
          set((s) => {
            const future = s.history.future.slice()
            const next = future.pop()
            if (!next) return {}
            lastPushAt = 0
            return {
              ...next,
              history: { past: [...s.history.past, snapshotOf(s)].slice(-HISTORY_LIMIT), future },
            }
          }),
      }),
    {
      name: 'resume-forge-v1',
      storage: createJSONStorage(() => idbStorage),
      // History is a session artefact — persisting it across reloads is confusing
      // (undo would time-travel past a page refresh) and inflates the payload.
      partialize: (s) => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        lastTemplateId: s.lastTemplateId,
      }),
      onRehydrateStorage: () => (state) => state && useStore.setState({ hydrated: true }),
    },
  ),
)

export function useActiveProfile(): Profile | null {
  return useStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null)
}
