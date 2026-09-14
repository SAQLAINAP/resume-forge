# Decision log

Split across v1 (§1–§10) and v2 (§11–§14).

Every entry is a fork in the road: what was chosen, what was rejected, and what
it costs. If any of these turns out to be wrong, this file says exactly what to
reverse.

---

## 1. PDF via the browser's print pipeline, not canvas rasterisation

**Chosen:** `window.print()` against a hidden, unscaled A4 surface, plus a
`@media print` block that hides everything else on the page.

**Rejected:** `html2canvas` / `html-to-image` → `jsPDF`, which is the near-universal
approach in JS resume builders.

**Why:** a canvas-based PDF is a picture of a résumé. An ATS extracts zero text
from it. Since "ATS-friendly" is the entire product claim, the popular approach
is disqualified outright, not merely inferior. Printing keeps real glyphs, real
font metrics, selectable and searchable text, and correct page breaks.

**Cost:** we don't control the filename — the browser's print dialog does — and
the user has to pick "Save as PDF" themselves. That's a real UX tax. It is worth
paying, and no amount of polish elsewhere would compensate for a résumé that
parses as a blank page.

**Reverse it if:** we move to a native shell with a real PDF engine available. At
that point `Capacitor` + a platform print-to-file API gets us both text fidelity
*and* filename control.

---

## 2. Word export built from the data model, not from the DOM

**Chosen:** `docx` library, constructing native Word headings, bullet lists and
right tab stops from `ResumeData`.

**Rejected:** serialising the rendered HTML into a `.doc` with an MS Office MIME
type — a two-line change that produces a file Word will happily open.

**Why:** HTML-to-Word carries CSS layout across as nested tables and positioned
frames. Those are precisely the structures ATS parsers mangle — columns get read
row-wise, so "React" ends up glued to a date from the other column. Rebuilding
in native Word primitives yields a file a parser reads correctly *and* a human
can keep editing.

**Cost:** the Word output is a sibling of the on-screen design, not a clone.
Two-column layouts flatten to one column in `.docx`. That is a deliberate
downgrade — the two-column look is a screen/PDF affordance, and flattening is
what makes it parseable.

**Verified:** the generated `.docx` was unzipped in-browser, `word/document.xml`
inflated, and the `<w:t>` runs extracted — real text, no images, no tables.

---

## 3. IndexedDB, not localStorage

**Chosen:** `zustand/persist` with a `StateStorage` adapter over `idb-keyval`.

**Rejected:** the default `localStorage` persist backend.

**Why:** localStorage caps at ~5MB and every write is synchronous on the main
thread. Multiple profiles, each with long bullet lists, will approach that
ceiling, and hitting it throws mid-keystroke with no graceful degradation.
IndexedDB has no practical cap here and writes off the main thread.

**Cost:** hydration is async, so the app needs a boot gate (`hydrated` flag)
before first paint. One extra state flag; small and contained.

---

## 4. Templates as a registry of pure functions, not bespoke components

**Chosen:** each layout is a pure function of `ResumeData`; a registry entry
declares its `sections`, `requiredSections`, flairs and ATS grade.

**Rejected:** one self-contained component per template, each with its own form.

**Why:** the declared `sections` list is what makes the wizard possible. Because
a template *states* what it renders, `gapsFor()` can diff that against a profile
and ask only for the difference — which is the product promise ("the second
résumé is nearly instant"). With bespoke components that metadata lives only
inside JSX and can't be diffed.

**Cost:** adding a template means touching the registry as well as the layout,
and layouts are constrained to compose from the shared block set. Adding a
twelfth template is ~40 lines; adding a genuinely novel visual structure means
adding a block first.

---

## 5. The wizard plan is frozen, not derived

**Chosen:** compute the step list once per `profileId:templateId` and hold it in
state.

**Rejected:** `useMemo(() => planSteps(profile, template), [profile, template])`
— which is what it originally was.

**Why:** this was a real bug caught in browser testing, not a hypothetical. With
the derived version, the moment you typed the last character into the final
required field, `gapsFor` stopped reporting that gap, the step list shrank, and
React unmounted the input under your cursor. Deriving from live data is correct
for read-only views and wrong for a form whose *existence* depends on that data.

**Cost:** if a user opens a second tab and fills in data there, this tab's wizard
won't notice. Acceptable — the editor, which is derived live, is the screen that
matters for that case.

---

## 6. Preview scales, it does not reflow

**Chosen:** render the page at true physical size (210mm × 297mm) and CSS
`transform: scale()` it down to fit the viewport, driven by a `ResizeObserver`.

**Rejected:** a responsive preview that reflows at smaller widths.

**Why:** a reflowing preview lies. Line breaks and page boundaries shift, so the
PDF the user gets is not the document they approved — and "does it fit on one
page" is the single most common résumé question. Scaling guarantees pixel-exact
correspondence.

**Cost:** text is small on a phone. Mitigated with an edit/preview tab toggle on
mobile rather than by compromising fidelity.

**Related:** print output renders through a React portal into a body-level
`#rf-print-root`, so it never inherits the preview's transform. Without that,
printing would emit a scaled-down page.

---

## 7. HashRouter, not BrowserRouter

**Chosen:** `HashRouter`, with `base: './'` in the Vite config.

**Why:** the same build has to run from a static host, from `file://`, and
inside a Capacitor WebView. Path-based routing needs server rewrites, which two
of those three environments cannot provide.

**Cost:** `#/` in the URL. Cosmetic, and irrelevant for an app nobody deep-links
into.

---

## 8. Capacitor over React Native / a PWA-only story

**Chosen:** ship a PWA and keep a Capacitor config so the identical `dist/` can
be wrapped natively when needed.

**Rejected:** React Native (a full rewrite of the renderer, and the résumé
document is fundamentally a CSS layout engine problem); PWA-only (no app-store
presence).

**Why:** zero incremental code. The web build *is* the native build.

**Cost:** the native shell has no privileged capability today — it doesn't fix
the print-dialog UX described in §1. It is optionality, not a feature.

---

## 9. Tailwind for the app, plain CSS for the document

**Chosen:** two separate styling systems, deliberately.

**Why:** the résumé must be expressed in millimetres and points, because it is a
physical artefact that gets printed and rasterised. Tailwind's scale is
viewport-relative and its utilities are purged by content scanning — both are
wrong for a document that has to survive being serialised into a print context
and an image. `resume.css` is plain and self-contained for exactly that reason.

**Cost:** contributors have to know which side of the line they're on. The
directory split (`styles/resume.css` vs everything else) makes it obvious.

---

## 10. `docx` behind a dynamic import

**Chosen:** `src/core/docx-export.ts` is reached only via `await import()`.

**Why:** "lightweight" is a stated requirement. The library is ~350KB — larger
than the entire rest of the app — and is needed only if the user clicks *Word*.

**Measured:** main bundle 107.26 kB gzip; docx 99.31 kB in a chunk that is never
fetched otherwise.

---

---

## 11. Undo/redo as snapshot ring, not diff/CRDT

**Chosen:** every mutation captures the previous `{ profiles, activeProfileId,
lastTemplateId }` slice into a bounded (50-entry) past stack; undo pops back
onto a future stack, redo reverses. Entries within 350 ms of the last push
coalesce into the same undo step.

**Rejected:** patch-based history (`immer` inverse patches or JSON-Patch) and a
CRDT log.

**Why:** the persisted state is a few hundred KB at worst. 50 shallow snapshots
is well under one MB. Patches would save bytes at the cost of being fragile
against schema changes — a v3 field addition breaks history replay in
mysterious ways. Snapshots survive schema drift for free because they are just
older shapes of the same object graph.

**Cost:** the ring lives in memory, not IndexedDB. Refreshing the page loses
history — deliberate, because undoing back across a page reload would surprise
more than it helps.

**Coalescing threshold:** 350 ms is long enough to fold a burst of keystrokes
into one step and short enough that clicking Add / Remove is always its own
step. Anything smaller made ⌘Z near-useless; anything larger meant intentional
edits were bundled together.

---

## 12. Bullet-quality feedback is rule-based, not LLM

**Chosen:** a static vocabulary of strong action verbs and hedges, plus regex
checks for numeric density, first-person, and length. Runs on every keystroke
in microseconds.

**Rejected:** shipping an on-device WebGPU LLM (Phi, Qwen-3B) for bullet
rewriting.

**Why:** the LLM download is ~1.5 GB minimum for anything usable — twenty times
the current app payload. That violates the "lightweight, offline, installable
on a phone" promise more than the LLM could ever improve any individual bullet.
And rules cover 80% of the actual advice ("start with a verb", "add a metric",
"drop 'responsible for'") without weighing anything.

**Cost:** the coach can flag but not rewrite. That is a feature: the app never
puts words in the user's mouth, so a bullet the app approves of is one the user
still wrote.

**Reverse it if:** WebGPU model download becomes a first-class OS capability
(cached across sites, resumed across sessions). Then the model is a one-time
cost the user opts into, not a per-app tax.

---

## 13. JD keyword matcher runs in-page, not through an API

**Chosen:** tokenise the pasted JD, strip stopwords, hash-set-intersect against
tokens drawn from the resume. Store the JD scratch in `localStorage`.

**Rejected:** using a hosted keyword-extraction endpoint (e.g. an NLP API),
which would be a two-line change.

**Why:** JDs are frequently confidential — internal referrals, unposted roles,
NDAs. The offline promise is the whole product; sending JDs to a server would
break it in the single most sensitive place. And crude bag-of-words intersection
matches what most modern ATSes actually do, so extra sophistication would look
smarter without ranking any better.

**Cost:** synonyms and morphology are naïve. "PostgreSQL" and "Postgres" are
different tokens; "led" and "leadership" don't collapse. Mitigated by keeping
the coverage percentage advisory rather than authoritative, and showing the
missing tokens verbatim so the user judges.

**`localStorage` rather than IndexedDB for the scratch:** the JD should be
transient. Private windows clear it. It never gets bundled into a profile
export by accident.

---

## 14. Page fit is measured from the live preview, not a shadow render

**Chosen:** attach a `ResizeObserver` to the visible preview node, read its
scaled height, back out the CSS `transform: scale()` to recover the
pre-scale pixel height, convert 96 CSS px → 25.4 mm.

**Rejected:** rendering the resume into a hidden offscreen div at 1:1 scale for
measurement.

**Why:** the preview already renders at the true page size and is already being
observed for the scale calculation. A second offscreen render doubles the DOM
work on every keystroke for the same number. The scale factor is easy to read
from `getComputedStyle`.

**Cost:** subtly wrong if browser DPI differs from the assumed 96 (Chrome and
Firefox sometimes disagree by ~2 mm). The meter is advisory — it fingers "one
page vs. two", "comfortable vs. cramped" — not authoritative to the millimetre.
Called out in the tooltip.

---

## Known gaps in v2

- PDF filename is still chosen in the browser's print dialog, not by us (§1).
- Two-column layouts still flatten to one column in Word (§2), by design.
- Undo history is not persisted across page reloads (§11).
- Bullet coach flags but does not rewrite (§12).
- Signed release APK is still not set up — sideloaded debug APK only.
- No automated test suite. Manual verification: rendering all 32 templates
  against sample data, generating .docx and unzipping it to confirm text, and
  clicking through undo/redo across every editor action.
