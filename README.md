# Resume Forge

An offline-first resume builder. Pick a format, answer only the questions that
format needs, and export a résumé that an applicant tracking system can actually
read — as PDF, Word or PNG.

Nothing is uploaded. There is no backend, no account and no network call
anywhere in the app.

## What it does

- **11 formats** modelled on well-known real-world résumés and university
  standards — Jake's, Deedy, Harvard, MIT, Stanford, IIT Bombay, IIT Kharagpur,
  NIT, plus plain / executive / research variants.
- **Flairs** on each format (Technical, Research, New Grad, India, One Page …)
  so you can filter by the kind of role you're applying for.
- **Profiles.** Your data is stored once and reused across every format. The app
  is built for the case where you also make résumés for family and friends, so
  profiles are first-class and switchable.
- **A wizard that only asks for the delta.** Each format declares which sections
  it renders. The app diffs that against your profile and asks *only* for what's
  missing. Your second résumé takes about a minute.
- **ATS-safe exports.** PDF keeps a real text layer, Word is generated from the
  data model with native headings and bullets. Neither is an image.
- **Works offline.** Fully precached service worker; installable as a PWA on
  mobile; wrappable as a native app via Capacitor.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle into dist/
npm run preview    # serve the production build
```

## Native (Capacitor)

The web build *is* the app; `capacitor.config.ts` already points at `dist/`, and
the `android/` project is committed.

```bash
npm run android:sync     # build web + copy into android/
npm run android:apk      # produce android/app/build/outputs/apk/debug/app-debug.apk
npx cap open android     # open in Android Studio
```

### CI / APK downloads

Every push to `main` and every PR triggers
[.github/workflows/android.yml](.github/workflows/android.yml), which builds a
debug APK on a hosted Ubuntu runner (JDK 21, latest Android SDK) and uploads it
as an artifact named `resume-forge-debug-apk`. Download it from the workflow
run's Summary page; it installs on any device with "Install unknown apps"
enabled. Retention is 30 days.

A **release** (Play-Store-signed) APK needs a keystore uploaded as a GitHub
secret and a signing block wired into `android/app/build.gradle`. Not set up in
v1 — debug is enough for sideloading, sharing with beta users and family, which
is the stated distribution model.

## Layout

```
src/
  core/
    types.ts          data spine — ResumeData, Profile, TemplateMeta
    schema.ts         field registry; every form in the app is driven from here
    store.ts          zustand + persist over IndexedDB
    completeness.ts   the gap diff that powers the wizard and the progress ring
    exporters.ts      PDF (print), PNG, JSON, lazy DOCX
    docx-export.ts    Word document built from the data model (lazy chunk)
  templates/
    blocks.tsx        reusable section renderers
    layouts.tsx       the 11 layouts — pure functions of ResumeData
    registry.tsx      template metadata: flairs, sections, ATS grade
  pages/              Gallery, Wizard, Editor, Profiles
  styles/resume.css   print-first document CSS in mm/pt
```

App chrome is Tailwind. The résumé document deliberately is not — it's plain CSS
in physical units so it survives printing and rasterisation unchanged.

See [DECISIONS.md](./DECISIONS.md) for why each of those choices was made, and
[ROADMAP.md](./ROADMAP.md) for what v2 and v3 look like.
