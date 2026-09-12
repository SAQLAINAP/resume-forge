/*
 * Regenerates docs/screenshots/*.png against a running dev server.
 * Requires an ambient install of puppeteer-core (kept out of package.json
 * so a 300MB dep does not land on every contributor):
 *
 *   npm install --no-save puppeteer-core
 *   npm run dev &            # or your equivalent
 *   node scripts/screenshots.mjs
 */
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { nanoid } from 'nanoid'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5173'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots')

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
      summary: 'Backend engineer with 3 years shipping payments infra at scale. Comfortable across Go, Python and the JVM; happiest at the seam between systems and models.',
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
        score: '8.7', scoreType: 'CGPA',
        startDate: '2018-07', endDate: '2022-05',
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
        startDate: '2023-06', endDate: '',
        bullets: [
          'Rebuilt the settlement ledger service, cutting reconciliation lag from 45 min to under 2 min for 3M merchants.',
          'Led migration of the payouts pipeline from RabbitMQ to Kafka; sustained 12k msg/s at p99 under 40ms.',
          'Mentored 3 interns, two converted to full-time offers.',
        ],
        tech: ['Go', 'Kafka', 'PostgreSQL', 'Kubernetes'],
      },
      {
        id: nanoid(),
        company: 'Razorpay',
        role: 'Software Engineer I',
        location: 'Bengaluru, India',
        startDate: '2022-06', endDate: '2023-06',
        bullets: [
          'Built the fraud-signal aggregation service in Go, serving 8B events/day with p99 latency < 20ms.',
          'Cut database costs by 32% by rewriting the hot-path query planner and adding materialised views.',
        ],
        tech: ['Go', 'ClickHouse', 'Redis'],
      },
    ],
    projects: [
      {
        id: nanoid(),
        name: 'llm-log-summariser',
        url: 'github.com/ananyar/llm-log-summariser',
        startDate: '2024-01', endDate: '2024-04',
        bullets: [
          'On-device summariser for production log tails using a 3B-param distilled model over WebGPU.',
          'Streams token deltas back into the terminal; measured 1.8× faster triage in a controlled study of 12 engineers.',
        ],
        tech: ['TypeScript', 'WebGPU', 'ONNX'],
      },
    ],
    skills: [
      { id: nanoid(), category: 'Languages', items: ['Go', 'Python', 'TypeScript', 'Rust'] },
      { id: nanoid(), category: 'Infra', items: ['Kubernetes', 'Kafka', 'PostgreSQL', 'ClickHouse', 'Redis'] },
      { id: nanoid(), category: 'ML', items: ['PyTorch', 'ONNX', 'WebGPU'] },
    ],
    achievements: [
      { id: nanoid(), title: 'Top 100, ACM ICPC Regionals', issuer: 'ACM', date: '2021-11', description: '' },
      { id: nanoid(), title: 'Best Undergrad Thesis', issuer: 'IIT Bombay CSE', date: '2022-05', description: 'Cache-coherent distributed key-value store.' },
    ],
    positions: [], certifications: [], publications: [], extracurriculars: [], languages: [],
  },
}

async function seed(page) {
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

async function shot(browser, path, file, height = 900) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height, deviceScaleFactor: 2 })
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
  await seed(page)
  await page.goto(`${BASE}/#${path}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: join(OUT, file), type: 'png' })
  await page.close()
  console.log(`✔ ${file}`)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] })

await shot(browser, '/', 'gallery.png', 900)
await shot(browser, '/edit/jake', 'editor-jake.png', 1000)
await shot(browser, '/edit/harvard', 'editor-harvard.png', 1000)
await shot(browser, '/build/nit', 'wizard.png', 720)
await shot(browser, '/profiles', 'profiles.png', 600)

await browser.close()
