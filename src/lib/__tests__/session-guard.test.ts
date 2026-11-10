import { test } from "node:test"
import assert from "node:assert/strict"
import { passwordFingerprint, isSessionStillValid } from "../session-guard"

// Regression for the audit finding "password change does not invalidate existing
// NextAuth JWT sessions": a token minted before a password change must stop working.

const OLD = "$2b$10$oldoldoldoldoldoldoldoldoldoldoldoldoldoldoldoldold"
const NEW = "$2b$10$newnewnewnewnewnewnewnewnewnewnewnewnewnewnewnewnew"

test("fingerprint is stable, differs per hash, and never echoes the hash", () => {
  assert.equal(passwordFingerprint(OLD), passwordFingerprint(OLD))
  assert.notEqual(passwordFingerprint(OLD), passwordFingerprint(NEW))
  assert.ok(!passwordFingerprint(OLD)!.includes("old"))
  assert.equal(passwordFingerprint(null), null)
})

test("a session minted before a password change is no longer valid", () => {
  const tokenFp = passwordFingerprint(OLD)
  assert.equal(isSessionStillValid(tokenFp, { password: OLD }), true)
  assert.equal(isSessionStillValid(tokenFp, { password: NEW }), false)
})

test("a session for a deleted user is no longer valid", () => {
  assert.equal(isSessionStillValid(passwordFingerprint(OLD), null), false)
})

test("tokens issued before this fix (no fingerprint) are rejected for password users", () => {
  assert.equal(isSessionStillValid(undefined, { password: OLD }), false)
})

test("OAuth-only users (no password) keep working, including older tokens", () => {
  assert.equal(isSessionStillValid(null, { password: null }), true)
  assert.equal(isSessionStillValid(undefined, { password: null }), true)
})
