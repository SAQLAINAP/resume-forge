# Roadmap

v2 is shipped: 32 formats, undo/redo, offline JD keyword matcher, bullet-quality
coach, one-page fit meter. What follows is ordered by how much each thing
improves the résumé the user actually walks away with — not by how interesting
it is to build.

---

## Shipped in v2 (2026-09)

- 21 new templates: Google, Meta, Amazon, Microsoft, Netflix, McKinsey, BCG,
  Bain, Goldman, Wharton, BITS, DTU, IIIT, IIM Ahmedabad, ISB, Oxford, Cambridge,
  INSEAD, Europass, plus Reverse-Chronological / Functional / Federal / Creative
  format variants. Total: 32.
- **Undo / redo** with ⌘Z / ⇧⌘Z, snapshot ring of 50 entries, coalesced within
  350 ms so a burst of typing collapses into one step.
- **Bullet coach** — rule-based scoring against verb strength, metric presence,
  hedging, length and first-person; per-role grouping and an average score.
- **Offline JD keyword matcher** — paste a posting; we tokenise, strip stopwords,
  intersect against the resume's bag of tokens, and highlight what is missing vs
  covered. The JD text is kept in `localStorage` so it clears across sessions.
- **Page fit meter** — reads the rendered preview via `ResizeObserver`, converts
  CSS pixels to millimetres, and reports pages and fill percentage plus concrete
  trim advice.
- **Editor refactor** — accordion and section editor extracted out of the render
  body so parent re-renders no longer remount inputs mid-typing. Export errors
  now surface via an inline banner rather than a silent finally-block.

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

**5. Section-level variants.** Keep three versions of your summary and two
experience orderings inside one profile, then pick per résumé. Deferred from v2:
worth doing once the JD matcher has proven which fields people actually swap.

**6. Signed release APK.** Play-Store-signed build behind a keystore GitHub
secret, replacing the debug-signed sideload artefact.

**7. Optional, opt-in local LLM.** WebGPU, model downloaded on demand, entirely
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
- **AI-assisted "generate my resume from a LinkedIn URL".** Would require a
  scraper (illegal), a server-side LLM (violates the offline promise) or both.
  Import from an exported JSON Resume is a bounded, honest substitute.
