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

interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  lastTemplateId: string | null
  hydrated: boolean

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
}

function touch(profile: Profile): Profile {
  return { ...profile, updatedAt: new Date().toISOString() }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [] as Profile[],
      activeProfileId: null as string | null,
      lastTemplateId: null as string | null,
      hydrated: false as boolean,

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
        set((s) => ({ profiles: [...s.profiles, profile], activeProfileId: profile.id }))
        return profile.id
      },

      deleteProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id)
          return {
            profiles,
            activeProfileId: s.activeProfileId === id ? (profiles[0]?.id ?? null) : s.activeProfileId,
          }
        }),

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
        set((s) => ({ profiles: [...s.profiles, copy], activeProfileId: copy.id }))
        return copy.id
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      renameProfile: (id, label) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? touch({ ...p, label }) : p)),
        })),

      setLastTemplate: (templateId) => set({ lastTemplateId: templateId }),

      updateBasics: (id, patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id ? touch({ ...p, data: { ...p.data, basics: { ...p.data.basics, ...patch } } }) : p,
          ),
        })),

      addItem: (id, section, item) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id
              ? touch({ ...p, data: { ...p.data, [section]: [...(p.data[section] as unknown[]), item] } })
              : p,
          ),
        })),

      updateItem: (id, section, itemId, patch) =>
        set((s) => ({
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
          profiles: s.profiles.map((p) => (p.id === id ? touch({ ...p, data }) : p)),
        })),
    }),
    {
      name: 'resume-forge-v1',
      storage: createJSONStorage(() => idbStorage),
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
