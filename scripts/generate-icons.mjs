/*
 * Regenerates every raster icon the app needs from a single SVG source
 * (public/favicon.svg). Keeps the PWA icons and the Android legacy mipmaps
 * in lockstep so the identity never drifts between the browser tab and the
 * launcher.
 *
 *   npm run icons
 *
 * Adaptive-icon foreground/background live as vector XML in
 * android/app/src/main/res/{drawable,drawable-v24}/ — those are edited by
 * hand, not generated, because Android renders them from the vector at any
 * density. This script only fills in:
 *
 *   - public/icon-{192,512}.png        (PWA manifest icons)
 *   - android/.../mipmap-<density>/ic_launcher.png       (legacy square)
 *   - android/.../mipmap-<density>/ic_launcher_round.png (legacy circle)
 *   - android/.../mipmap-<density>/ic_launcher_foreground.png
 *       (raster fallback for the adaptive-icon foreground, used by older
 *       launchers that ignore the anydpi-v26 vector foreground)
 *
 * The legacy raster mipmaps still matter: pre-Oreo devices and some third-
 * party launchers use them directly.
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SVG_PATH = join(ROOT, 'public', 'favicon.svg')
const ANDROID_RES = join(ROOT, 'android', 'app', 'src', 'main', 'res')

// Density buckets used by Android. Values are px per 48dp (launcher-icon size)
// and 108dp (adaptive-icon canvas). We rasterize both.
const DENSITIES = [
  { name: 'mdpi', legacy: 48, foreground: 108 },
  { name: 'hdpi', legacy: 72, foreground: 162 },
  { name: 'xhdpi', legacy: 96, foreground: 216 },
  { name: 'xxhdpi', legacy: 144, foreground: 324 },
  { name: 'xxxhdpi', legacy: 192, foreground: 432 },
]

async function ensure(dir) {
  await mkdir(dir, { recursive: true })
}

/**
 * Sharp rasterises the whole SVG. For the round mipmap we composite a circular
 * mask so legacy launchers that don't apply their own mask still get a circle
 * instead of a rounded square. For the foreground raster we render only the
 * inner mark (no background plate), because Android layers the background
 * separately at the adaptive-icon layer.
 */
async function rasterizeFull(svg, size, outPath) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function rasterizeRound(svg, size, outPath) {
  // Circular alpha mask sized to `size`.
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>` +
      `</svg>`,
  )
  const base = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer()
  await sharp(base)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

/**
 * Foreground raster for pre-adaptive-icon launchers.
 * The vector foreground in drawable-v24/ic_launcher_foreground.xml is our
 * source of truth; here we rasterise the *same* mark (favicon minus the navy
 * plate) onto a transparent canvas at the density's full 108dp size.
 */
async function rasterizeForeground(svgWithoutPlate, size, outPath) {
  await sharp(svgWithoutPlate, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function main() {
  const svg = await readFile(SVG_PATH)

  // PWA icons — full favicon at 192 and 512, used by the web manifest.
  await ensure(join(ROOT, 'public'))
  await rasterizeFull(svg, 192, join(ROOT, 'public', 'icon-192.png'))
  await rasterizeFull(svg, 512, join(ROOT, 'public', 'icon-512.png'))
  console.log('  public/icon-192.png')
  console.log('  public/icon-512.png')

  // Strip the navy plate so the foreground raster is transparent-around-mark.
  // Cheapest way: swap the rect fill for none. The favicon has exactly one
  // full-canvas rounded rect (rx=112) at the top.
  const svgText = svg.toString('utf8')
  const svgForeground = Buffer.from(
    svgText.replace(
      /<rect width="512" height="512" rx="112" fill="#181b23"\/>/,
      '',
    ),
  )

  for (const d of DENSITIES) {
    const dir = join(ANDROID_RES, `mipmap-${d.name}`)
    await ensure(dir)
    await rasterizeFull(svg, d.legacy, join(dir, 'ic_launcher.png'))
    await rasterizeRound(svg, d.legacy, join(dir, 'ic_launcher_round.png'))
    await rasterizeForeground(
      svgForeground,
      d.foreground,
      join(dir, 'ic_launcher_foreground.png'),
    )
    console.log(`  mipmap-${d.name}/ ic_launcher{,_round,_foreground}.png`)
  }

  // The web manifest declares a maskable icon variant. Sharing icon-512 is
  // fine — the favicon is already designed with a safe area comparable to
  // Android adaptive icons, so the launcher mask won't clip the mark.
  await writeFile(
    join(ROOT, 'public', '.icons.stamp'),
    `Generated ${new Date().toISOString()}\n`,
  )
  console.log('done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
