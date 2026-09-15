/*
 * Regenerates docs/screenshots/mobile-*.png at an iPhone-sized viewport so
 * the README's "on your phone" story doesn't rely on the reader mentally
 * shrinking the desktop shots.
 *
 * Same seeding pattern as screenshots.mjs — requires a running dev server
 * and puppeteer-core (installed with --no-save to keep it out of the app's
 * dependency graph):
 *
 *   npm install --no-save puppeteer-core
 *   npm run dev &
 *   node scripts/screenshots-mobile.mjs
 */
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { nanoid } from 'nanoid'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5173'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots')

// iPhone 13/14 viewport. deviceScaleFactor: 3 for retina crispness in the
// README on high-DPI displays.
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }

const PROFILE = {
  id: nanoid(),
  label: 'Ananya Rao — SDE',
  relationship: 'Self',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    basics: {
      fullName: 'Ananya Rao',
      headline: 'Software Engineer — backend + ML infra',
      email: 'ananya.rao@example.com',
      phone: '+91 98450 12345',
      location: 'Bengaluru, India',
      dob: '',
      summary:
        'Backend engineer with 3 years shipping payments infra at scale. Comfortable across Go, Python and the JVM; happiest at the seam between systems and models.',
      summaryVariants: [
        'Payments-infra engineer moving toward on-device ML. Shipped Go services at 12k msg/s and prototyped a WebGPU log summariser.',
      ],
      summaryVariantIndex: null,
      links: [
        { id: nanoid(), label: 'GitHub', url: 'github.com/ananyar' },
        { id: nanoid(), label: 'LinkedIn', url: 'linkedin.com/in/ananyar' },
      ],
    },
    education: [
      {
        id: nanoid(),
        institution: 'Indian Institute of Technology Bombay',
        degree: 'B.Tech',
        field: 'Computer Science & Engineering',
        score: '8.7',
        scoreType: 'CGPA',
        startDate: '2018-07',
        endDate: '2022-05',
        location: 'Mumbai, India',
        coursework: ['Distributed Systems', 'Machine Learning', 'Compilers', 'Databases'],
      },
    ],
    experience: [
      {
        id: nanoid(),
        company: 'Razorpay',
        role: 'Software Engineer II',
        location: 'Bengaluru, India',
        startDate: '2023-06',
        endDate: '',
        bullets: [
          'Rebuilt the settlement ledger service, cutting reconciliation lag from 45 min to under 2 min for 3M merchants.',
          'Led migration of the payouts pipeline from RabbitMQ to Kafka; sustained 12k msg/s at p99 under 40ms.',
          'Mentored 3 interns, two converted to full-time offers.',
        ],
        tech: ['Go', 'Kafka', 'PostgreSQL', 'Kubernetes'],
      },
    ],
    projects: [
      {
        id: nanoid(),
        name: 'llm-log-summariser',
        url: 'github.com/ananyar/llm-log-summariser',
        startDate: '2024-01',
        endDate: '2024-04',
        bullets: [
          'On-device summariser for production log tails using a 3B-param distilled model over WebGPU.',
        ],
        tech: ['TypeScript', 'WebGPU', 'ONNX'],
      },
    ],
    skills: [
      { id: nanoid(), category: 'Languages', items: ['Go', 'Python', 'TypeScript', 'Rust'] },
      { id: nanoid(), category: 'Infra', items: ['Kubernetes', 'Kafka', 'PostgreSQL', 'ClickHouse'] },
    ],
    achievements: [],
    positions: [],
    certifications: [],
    publications: [],
    extracurriculars: [],
    languages: [],
  },
  coverLetters: [
    {
      id: nanoid(),
      label: 'Stripe — Payments SDE',
      layoutId: 'formal-block',
      recipient: { name: 'Hiring Team', company: 'Stripe', address: '' },
      subject: 'Application for Payments SDE',
      opening: 'I am writing to apply for the Payments SDE role advertised on your careers page.',
      body: 'Three years of building payments infrastructure at Razorpay taught me what it takes to keep money moving reliably at scale — and where the interesting problems live at the seam between systems and product. Stripe has been on my shortlist for exactly that reason.',
      closing: 'I would welcome the chance to discuss how I can contribute. Thank you for considering my application.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
}

async function seed(page) {
  // version: 0 forces the store's migrate() to run, which backfills any
  // fields our seed profile doesn't set (summaryVariants defaults, missing
  // CV sections, etc.). Skipping migration by matching the current version
  // leaves gaps that some pages read as "malformed profile" and blank out.
  await page.evaluate(async (profile) => {
    const { set } = await import('/node_modules/.vite/deps/idb-keyval.js')
    const doc = {
      state: {
        profiles: [profile],
        activeProfileId: profile.id,
        lastTemplateId: 'jake',
      },
      version: 0,
    }
    await set('resume-forge-v1', JSON.stringify(doc))
  }, PROFILE)
}

async function shot(browser, path, file, opts = {}) {
  const page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  )
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
  await seed(page)
  // Reload so zustand rehydrates from the freshly-seeded IDB. Without this,
  // hash-only URL changes don't re-run the persist middleware and the target
  // page renders against an empty store (blank screen).
  await page.goto(`${BASE}/#${path}`, { waitUntil: 'networkidle0' })
  await page.reload({ waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  if (opts.click) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      if (el) el.click()
    }, opts.click)
    await new Promise((r) => setTimeout(r, 400))
  }
  await page.screenshot({ path: join(OUT, file), type: 'png', fullPage: opts.fullPage ?? false })
  await page.close()
  console.log(`✔ ${file}`)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars'],
})

// Gallery — the key win from this pass (filter wall collapsed).
await shot(browser, '/', 'mobile-gallery.png')
// Gallery with the filters drawer opened so the reader sees both states.
await shot(browser, '/', 'mobile-gallery-filters.png', { click: 'button[aria-expanded]' })
// Editor — the main "do work" surface on a phone.
await shot(browser, '/edit/jake', 'mobile-editor.png')
// Cover letters list — visible on mobile with the new letterCount pill.
await shot(browser, '/cover-letters', 'mobile-cover-letters.png')
// Profiles — completeness ring + share/export actions.
await shot(browser, '/profiles', 'mobile-profiles.png')
// Source editor (Beta) — showing LaTeX output.
await shot(browser, '/source', 'mobile-source.png')

await browser.close()
