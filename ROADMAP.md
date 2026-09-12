# Roadmap

v1 is shipped: 11 formats, profiles, the gap-diffing wizard, and three ATS-safe
export paths, all offline. What follows is ordered by how much each thing
improves the résumé the user actually walks away with — not by how interesting
it is to build.

---

## v2 — make the résumé *good*, not just correct

v1 guarantees a machine can read your résumé. It does nothing to make a human
want to. That's the gap.

**1. Tailoring to a job description.** Paste a JD; the app extracts its terms and
shows which ones your résumé already covers and which it misses, per section.
This is the highest-leverage feature in the entire product — keyword overlap is
literally how most ATS ranking works — and it can be done fully offline with a
tokeniser and a stopword list. No model required.

**2. Bullet quality feedback.** Flag the patterns that make bullets weak: no
leading action verb, no number anywhere, "responsible for", passive voice, over
two lines long. Offline, rule-based, immediate. Pair each flag with a rewritten
example so it teaches rather than scolds.

**3. One-page fit assistant.** The app already knows the rendered page height. It
can therefore say "you are 3 lines over" and offer concrete levers — tighten
leading, drop the oldest role, shorten these two bullets — instead of leaving
the user to fiddle blindly.

**4. Section-level variants.** Keep three versions of your summary and two
experience orderings inside one profile, then pick per résumé. This is what
people actually do when they apply to both backend and ML roles, and today it
forces a duplicated profile.

**5. Undo/redo and autosave history.** Non-negotiable once people are editing
seriously. Snapshot on each committed change; keep the last N in IndexedDB.

**6. Fix the PDF filename.** Via the Capacitor shell on mobile, and by
documenting the desktop print-dialog path clearly in-app.

---

## v3 — the résumé stops being the only artefact

**1. Cover letters from the same profile.** Same data spine, same export
pipeline, a different set of layouts. Marginal cost is low and it doubles what
the app is for.

**2. Shareable, offline-decodable links.** Compress a profile into the URL hash
so a résumé can be sent to a friend and opened without any server. Fits the
no-backend constraint exactly, and makes the "I build résumés for family" use
case collaborative rather than a lonely export-and-email loop.

**3. LinkedIn / JSON Resume import.** The single biggest onboarding cost today is
typing everything in once. Accept the JSON Resume schema and a LinkedIn data
export and the first résumé gets as fast as the second already is.

**4. Application tracker.** Which résumé went to which company, on what date,
what happened. The app already has the résumé; adding the outcome is what turns
it from a document tool into something worth reopening every week — and it makes
the tailoring data in v2 measurable.

**5. Optional, opt-in local LLM.** WebGPU, model downloaded on demand, entirely
on-device. Rewrite a bullet, draft a summary from a role description. This is
deliberately *last*: it is the flashiest item and the least load-bearing, and
shipping it earlier would compromise the "lightweight and offline" promise that
everything else depends on.

---

## Explicitly not planned

- **A backend, accounts or sync.** Offline-first is the differentiator, not a
  limitation to grow out of. Cross-device sync should arrive as file
  export/import or a user-owned folder, never as our server.
- **Telemetry.** A résumé is among the most sensitive documents a person owns.
- **A visual drag-and-drop template designer.** It produces layouts that look
  designed and parse badly. The curated registry is the point.
