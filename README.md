# resume-forge

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Android APK](https://github.com/SAQLAINAP/resume-forge/actions/workflows/android.yml/badge.svg)](https://github.com/SAQLAINAP/resume-forge/actions/workflows/android.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

> Offline-first, ATS-safe résumé builder. Pick a format, answer only the questions that format needs, export as PDF, Word or PNG. No backend, no account, no network call anywhere.

Most web-based résumé builders emit PDFs that are secretly images and Word files that are secretly HTML tables — both of which shred when an applicant tracking system tries to parse them. Resume Forge treats parseability as the primary constraint: PDFs go through the browser's print pipeline so glyphs stay real, and Word files are constructed from the data model with native headings and bullets rather than converted from the DOM.

Because the whole app is a single web bundle with no external calls, it runs offline as a PWA, installs on Android via [Capacitor](https://capacitorjs.com/), and stores multiple profiles (yours, your family's, your friends') locally in IndexedDB. Switching between the 11 built-in formats reuses your existing profile data — a second résumé takes about a minute.

## Table of Contents

- [Background](#background)
- [Install](#install)
  - [Web](#web)
  - [Android APK](#android-apk)
- [Usage](#usage)
- [Features](#features)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

Every résumé built by a mainstream web tool has to pass through two funnels: a human recruiter and an ATS parser. The two want opposite things — humans reward visual density, parsers reward flat semantic structure. Rasterising to PDF or converting HTML to DOCX makes the human view a tiny bit shinier and makes the parser view unreadable.

The design decisions that follow from that observation — print-CSS PDF over canvas rasterisation, data-model DOCX over HTML conversion, scale-not-reflow preview, template-as-pure-function registry, frozen wizard plans — are catalogued with their runners-up in [DECISIONS.md](./DECISIONS.md).

## Install

### Web

Requires Node ≥ 22.

```bash
git clone https://github.com/SAQLAINAP/resume-forge.git
cd resume-forge
npm install
npm run dev            # http://localhost:5173
npm run build          # type-check + production bundle into dist/
npm run preview        # serve the production build locally
```

### Android APK

**Grab a prebuilt debug APK.** Every push to `main` triggers [.github/workflows/android.yml](.github/workflows/android.yml), which builds an APK on a hosted runner and uploads it as an artifact named `resume-forge-debug-apk`. Download it from the workflow run's Summary page and sideload it (enable "Install unknown apps" for whichever app opens the file).

**Or build it yourself.** Requires Node ≥ 22 and JDK 21 with the Android SDK.

```bash
npm run android:sync   # build web + copy into android/
npm run android:apk    # → android/app/build/outputs/apk/debug/app-debug.apk
npx cap open android   # open in Android Studio
```

The `android/` directory is committed; `capacitor.config.ts` already points at `dist/` as the web root, so there is no origin/CORS story to configure.

A **release** (Play-Store-signed) APK needs a keystore uploaded as a GitHub secret and a signing block wired into `android/app/build.gradle`. Not set up in v1 — debug is enough for sideloading and sharing with beta users, which is the intended distribution model.

## Usage

1. **Pick a format.** The gallery lists 11 layouts (Jake's, Deedy, Harvard, MIT, Stanford, IIT Bombay, IIT Kharagpur, NIT, plain, executive, research), each tagged with flairs (Technical, Research, One Page, India, etc.) and an ATS-safety grade.
2. **Answer only the delta.** First time through, the wizard collects the basics plus whatever sections the chosen format renders. Second time — for a different format or a different person — it asks only for the fields the new format needs that the profile does not already have.
3. **Edit and preview.** The editor has a live, physically-sized preview that scales rather than reflows, so what you see is exactly what prints.
4. **Export.**
   - **PDF** — opens the browser print dialog. Choose "Save as PDF". Text stays selectable and ATS-parseable.
   - **Word** — downloads a `.docx` built from the data model with native styles.
   - **Image** — downloads a 3× PNG suitable for pasting into a deck.
   - **Back up** — from the Profiles page, export any profile as JSON and re-import it on another device.

Profiles are stored in IndexedDB under the origin. They never leave the device unless you export them.

## Features

- 11 résumé formats modelled on well-known real-world and university templates
- Flair-based filtering (Technical / Research / One Page / India / etc.)
- Multi-profile support with duplicate, import, export and two-step delete
- Gap-diffing wizard that asks only for what the chosen format needs and the profile lacks
- ATS-safe exports: PDF (print pipeline), DOCX (data model → native Word), PNG (3× rasterisation for slides)
- Fully offline: precached service worker, IndexedDB persistence, zero network calls
- Installable as a PWA on any device; wrappable as an Android APK via Capacitor
- 107 kB gzip main bundle; the ~350 kB `docx` library is lazy-loaded only when the user clicks *Word*

## Architecture

```
src/
  core/
    types.ts          data spine — ResumeData, Profile, TemplateMeta
    schema.ts         field registry; every form is driven from here
    store.ts          zustand + persist over IndexedDB (via idb-keyval)
    completeness.ts   the gap diff that powers the wizard and progress ring
    exporters.ts      PDF (print), PNG, JSON, lazy DOCX
    docx-export.ts    Word document built from the data model (lazy chunk)
  templates/
    blocks.tsx        reusable section renderers
    layouts.tsx       the 11 layouts — pure functions of ResumeData
    registry.tsx      template metadata: flairs, sections, ATS grade
  pages/              Gallery, Wizard, Editor, Profiles
  styles/resume.css   print-first document CSS in mm/pt
```

App chrome is Tailwind. The résumé document deliberately is not — it is plain CSS in physical units so it survives printing and rasterisation unchanged. Full rationale for each fork is in [DECISIONS.md](./DECISIONS.md).

## Roadmap

Ordered by how much each item improves the résumé the user walks away with, not by how interesting it is to build.

- **v2** — Job-description tailoring (offline keyword overlap), rule-based bullet-quality feedback, one-page fit assistant, per-profile section variants, undo/redo, signed release APK.
- **v3** — Cover letters off the same data spine, offline-decodable share links, LinkedIn/JSON Resume import, application tracker, optional opt-in on-device WebGPU LLM.

Explicitly not planned: a backend, telemetry, or a drag-and-drop template designer. Full detail in [ROADMAP.md](./ROADMAP.md).

## Maintainers

[@SAQLAINAP](https://github.com/SAQLAINAP)

## Contributing

Issues and PRs are welcome. Before opening a PR, please:

- Run `npm run build` — the CI runs `tsc -b && vite build` and blocks on errors.
- Skim [DECISIONS.md](./DECISIONS.md); several of the load-bearing choices look strange in isolation and the file exists so you don't have to re-derive them.
- Keep the offline / no-backend / no-telemetry constraint. Anything that reaches out to a server is out of scope for this project by design.

This project follows the [standard-readme](https://github.com/RichardLitt/standard-readme) specification. Small documentation fixes are welcome and don't need a prior issue.

## License

[MIT](./LICENSE) © 2026 Saqlain
