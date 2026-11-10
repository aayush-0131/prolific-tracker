import { createHash } from "crypto"

/**
 * Sessions are stateless JWTs, so on their own they survive a password change.
 * We store a fingerprint of the user's password hash in the (encrypted) token at
 * sign-in and re-check it on every request: when the password changes, every
 * session minted before the change stops working.
 */
export function passwordFingerprint(passwordHash: string | null | undefined): string | null {
  if (!passwordHash) return null
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 32)
}

export function isSessionStillValid(
  tokenFingerprint: string | null | undefined,
  currentUser: { password: string | null } | null
): boolean {
  if (!currentUser) return false // user deleted
  return passwordFingerprint(currentUser.password) === (tokenFingerprint ?? null)
}
