import { backfillResumeData } from './schema'
import type { CoverLetter, Profile, ResumeData } from './types'

/**
 * Offline-decodable share links. A whole profile is compressed with DEFLATE-RAW
 * (native `CompressionStream`, no dependency) and base64url-encoded into the
 * URL hash — so the recipient can open it with no server, no account, no
 * network call, even from a file:// origin.
 *
 * Trade-offs vs. the alternatives:
 *   - A server upload: violates the whole no-backend promise.
 *   - Plain JSON in the hash: works but is 3–4× larger; the average résumé
 *     hits URL-length limits in a few browsers past ~30 kB uncompressed.
 *   - Structured Web Share API: only shares text/URLs, not our payload.
 *
 * The encoded blob carries a tiny header (`{ v, kind, payload }`) so the
 * decoder can refuse to import something from a future version rather than
 * silently mangle it. `kind` distinguishes profile-only shares from letter
 * shares — v3 ships both; the decoder rejects anything else.
 */

export const SHARE_VERSION = 1
export type ShareKind = 'profile' | 'letter'

interface ShareEnvelope<T> {
  v: number
  kind: ShareKind
  payload: T
}

/** Base64url: URL-safe base64 without padding. */
function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const bin = atob(s.replaceAll('-', '+').replaceAll('_', '/') + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  // Blob's constructor lib types tightened in TS 5.7 (no more SharedArrayBuffer
  // via Uint8Array); cast keeps this readable without arguing with the lib.
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/* -- Profile shares -------------------------------------------------------- */

/**
 * The share payload is a *sanitised* subset of Profile — we drop createdAt /
 * updatedAt / the recipient-irrelevant fields to keep the URL short. The
 * recipient's app fills fresh timestamps and a new id at import time.
 */
interface ProfileSharePayload {
  label: string
  relationship: Profile['relationship']
  data: ResumeData
  coverLetters?: CoverLetter[]
}

export async function encodeProfileShare(profile: Profile): Promise<string> {
  const payload: ProfileSharePayload = {
    label: profile.label,
    relationship: profile.relationship,
    data: profile.data,
    coverLetters: profile.coverLetters,
  }
  const envelope: ShareEnvelope<ProfileSharePayload> = { v: SHARE_VERSION, kind: 'profile', payload }
  const bytes = new TextEncoder().encode(JSON.stringify(envelope))
  return toBase64Url(await deflate(bytes))
}

export interface DecodedProfileShare {
  kind: 'profile'
  label: string
  relationship: Profile['relationship']
  data: ResumeData
  coverLetters: CoverLetter[]
}

export async function decodeProfileShare(blob: string): Promise<DecodedProfileShare> {
  const bytes = await inflate(fromBase64Url(blob))
  const text = new TextDecoder().decode(bytes)
  const parsed = JSON.parse(text) as ShareEnvelope<ProfileSharePayload>
  if (!parsed || typeof parsed !== 'object') throw new Error('not a share link')
  if (parsed.v !== SHARE_VERSION) throw new Error(`share format v${parsed.v} is newer than this build (v${SHARE_VERSION}) — update the app`)
  if (parsed.kind !== 'profile') throw new Error(`share kind '${parsed.kind}' cannot be imported here`)
  return {
    kind: 'profile',
    label: parsed.payload.label ?? 'Shared profile',
    relationship: parsed.payload.relationship ?? 'Other',
    data: backfillResumeData(parsed.payload.data),
    coverLetters: parsed.payload.coverLetters ?? [],
  }
}

/** Build the fully-qualified share URL from the current window.location. */
export function shareUrl(origin: string, blob: string): string {
  // The origin URL may include a query string or path segment for the SPA;
  // preserve those and just replace the hash.
  const clean = origin.replace(/#.*$/, '')
  return `${clean}#/share/${blob}`
}
