import { LicenseManager } from 'apex-commons';

/**
 * Minting licence keys for the licensing tests.
 *
 * apex-commons 0.4.0 kept the `APEX-<base64(JSON)>` envelope but added an ECDSA
 * P-256 `sig` field inside it, and dropped the `generateLicenseKey` helper this
 * suite used to call: a key now only counts as valid if its signature verifies
 * against a public key compiled into the build, so nothing outside the licence
 * generator can mint one. Tests therefore sign with their own throwaway keypair
 * and install its public half over the build's, which is exactly what
 * `publicKeysSpki` is documented as being overridable for.
 *
 * The signed bytes must match the library's `canonicalPayload` exactly (see
 * {@link canonicalPayload}); a mismatch shows up as a key that reads valid
 * provisionally and flips to invalid once verification settles, which is what
 * {@link settleSignature} exists to surface.
 */

/** The private half of the throwaway keypair installed by {@link installSigningKey}. */
let signingKey: CryptoKey | null = null;

/** `publicKeysSpki` is private to the class, and deliberately overridable in tests. */
interface SigningKeyList {
  publicKeysSpki: string[];
}

function toBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * The exact bytes a licence signature covers. Must stay byte-for-byte identical
 * to `LicenseManager.canonicalPayload`: a fixed delimited string rather than
 * re-serialised JSON, because JSON key order is not guaranteed.
 */
function canonicalPayload(data: {
  domains?: readonly string[];
  expiryDate: string;
  issueDate: string;
  plan: string;
}): string {
  const domains = data.domains && data.domains.length > 0 ? data.domains.join(',') : '';
  return `v1|${data.issueDate}|${data.expiryDate}|${data.plan}|${domains}`;
}

/**
 * Generate a throwaway ECDSA P-256 keypair and install its public half as the
 * only key the build accepts. Call once per suite, before minting any key.
 */
export async function installSigningKey(): Promise<void> {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ]);
  const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
  (LicenseManager as unknown as SigningKeyList).publicKeysSpki = [toBase64(spki)];
  signingKey = pair.privateKey;
}

/** Options for {@link signedKey}; defaults to a far-future, domain-unrestricted key. */
export interface SignedKeyOptions {
  domains?: readonly string[];
  expiryDate?: string;
  issueDate?: string;
  plan?: string;
}

/** Mint a signed key in the canonical `APEX-` format, valid for this build. */
export async function signedKey(options: SignedKeyOptions = {}): Promise<string> {
  if (!signingKey) throw new Error('call installSigningKey() before signedKey()');
  const data = {
    domains: options.domains,
    expiryDate: options.expiryDate ?? '2999-01-01',
    issueDate: options.issueDate ?? '2020-01-01',
    plan: options.plan ?? 'enterprise',
  };
  const signature = await crypto.subtle.sign(
    { hash: 'SHA-256', name: 'ECDSA' },
    signingKey,
    new TextEncoder().encode(canonicalPayload(data))
  );
  // `domains` stays out of the payload when unset so the parsed data (and hence
  // the canonical bytes the library rebuilds) matches what was signed.
  const payload: Record<string, unknown> = {
    expiryDate: data.expiryDate,
    issueDate: data.issueDate,
    plan: data.plan,
    sig: toBase64(signature),
  };
  if (data.domains) payload.domains = data.domains;
  return `APEX-${btoa(JSON.stringify(payload))}`;
}

/**
 * Wait for asynchronous signature verification to settle on the current key.
 *
 * `isLicenseValid()` is synchronous and accepts a structurally sound key
 * provisionally, so asserting straight after `setLicense` would pass even for a
 * key whose signature never verifies. `signatureVerified` turns true for both
 * outcomes, which makes it the settle signal.
 *
 * Only meaningful for a key that passes structural validation: an expired or
 * malformed key never reaches verification, so this would spin out.
 */
export async function settleSignature(): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (LicenseManager.getLicenseStatus().signatureVerified) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('license signature verification did not settle');
}

/**
 * Clear the page-wide licence and every cached signature verdict.
 *
 * Both the key and the verdict cache live in a slot shared by every copy of the
 * module on the page, and `setLicense` deliberately ignores an invalid key while
 * a valid one is active, so a test that left a valid licence behind would make
 * the next one's invalid key a no-op.
 */
export function resetLicense(): void {
  LicenseManager.setLicense('');
  LicenseManager._resetSignatureState();
}
