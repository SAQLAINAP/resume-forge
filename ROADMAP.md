# Roadmap

v3 is shipped: cover letters, offline share links, JSON Resume import, summary
variants, an academic CV template family (beta), a source editor for LaTeX /
Markdown / HTML (beta), and a Vitest suite covering the pure-logic modules.
What follows is ordered by how much each thing improves the résumé the user
actually walks away with — not by how interesting it is to build.

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

## Shipped in v3 (2026-09)

- **Cover letters** off the same profile. Three layouts (Formal Block, Modern
  Header, Split Column) at 216×279 mm; PDF / DOCX / PNG through the same
  pipeline. Editing your phone number on the profile propagates into every
  letter automatically because a letter *is* a nested field on the profile.
- **Offline share links.** `CompressionStream('deflate-raw')` over UTF-8 JSON,
  base64url into the URL hash. A share URL decodes on the recipient's device;
  no server, no account, no network hop. Works from `file://` and inside the
  Capacitor WebView.
- **JSON Resume import.** Structural detection accepts either a Resume Forge
  backup or a JSON Resume schema object; the mapper fills what our data model
  renders and drops what it doesn't. First-time onboarding drops from ~15
  minutes to seconds if a candidate has a JSON Resume export.
- **Summary variants.** Keep N alternate summaries on a profile; the base or
  any variant renders per résumé. Everything is a one-liner in the templates
  (`activeSummary(basics)`), so adding more variant-eligible fields later is
  additive not architectural. Scoped narrowly to summary based on v2 usage.
- **CV templates (beta).** Three long-form academic layouts (Academic Long,
  Research Modern, European Extended), tagged both `CV` and `Beta` in the
  gallery. New CV-only sections: grants, teaching, service, invited talks.
- **Source editor (beta).** `/source` renders the current profile as LaTeX,
  Markdown or HTML; copy or download. One-way — hand-edits don't parse back.
- **Vitest suite.** `npm test` runs the pure-logic tests (lint scoring,
  keyword matching, share round-trip, JSON Resume mapping, variants fallback,
  source-export escaping) in under a second on `happy-dom`.

---

## v4 — deeper tailoring and outcome tracking

**1. Experience-ordering variants.** The second field, after summary, that
users rewrite per posting. Same pattern: `experienceVariants` on Basics,
`activeExperience(data)` helper, one-line template change.

**2. Application tracker.** Which résumé went to which company, on what date,
what happened. The app already has the résumé; adding the outcome turns it
from a document tool into something worth reopening every week — and it makes
the tailoring data in v2/v3 measurable.

**3. LinkedIn CSV importer.** LinkedIn's Data Export bundle → `importJsonResume`
via a translator. JSON Resume stays the internal target format.

**4. Source editor round-trip.** A tolerant parser that accepts our own
serialised LaTeX/Markdown/HTML back into ResumeData. Not "any LaTeX ever";
just "the shape we emit, with hand-edits preserved as free-text overrides".

**5. Signed release APK.** Play-Store-signed build behind a keystore GitHub
secret, replacing the debug-signed sideload artefact.

**6. Optional, opt-in local LLM.** WebGPU, model downloaded on demand, entirely
on-device. Rewrite a bullet, draft a summary from a role description. This is
deliberately *last*: it is the flashiest item and the least load-bearing, and
shipping it earlier would compromise the "lightweight and offline" promise
that everything else depends on.

---

## Explicitly not planned

- **A backend, accounts or sync.** Offline-first is the differentiator, not a
  limitation to grow out of. Cross-device sync should arrive as file
  export/import, share links, or a user-owned folder, never as our server.
- **Telemetry.** A résumé is among the most sensitive documents a person owns.
- **A visual drag-and-drop template designer.** It produces layouts that look
  designed and parse badly. The curated registry is the point.
- **AI-assisted "generate my resume from a LinkedIn URL".** Would require a
  scraper (illegal), a server-side LLM (violates the offline promise) or both.
  Import from an exported JSON Resume is a bounded, honest substitute.
