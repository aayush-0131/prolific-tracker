import { test } from "node:test"
import assert from "node:assert/strict"
import { getOAuthProviders, isGoogleAuthConfigured } from "../auth-providers"

// Regression: production had GOOGLE_CLIENT_ID unset, but the Google provider was
// still registered with clientId "" — every "Continue with Google" click failed
// server-side with OAuthSignin ("client_id is required") and bounced to /login.

test("Google is not configured when the env vars are missing or blank", () => {
  assert.equal(isGoogleAuthConfigured({}), false)
  assert.equal(isGoogleAuthConfigured({ GOOGLE_CLIENT_ID: "id" }), false)
  assert.equal(isGoogleAuthConfigured({ GOOGLE_CLIENT_SECRET: "secret" }), false)
  assert.equal(isGoogleAuthConfigured({ GOOGLE_CLIENT_ID: "  ", GOOGLE_CLIENT_SECRET: "secret" }), false)
})

test("no Google provider is registered without credentials", () => {
  assert.deepEqual(getOAuthProviders({}).map((p) => p.id), [])
})

test("Google provider is registered with the real client id when configured", () => {
  const providers = getOAuthProviders({ GOOGLE_CLIENT_ID: "my-id", GOOGLE_CLIENT_SECRET: "my-secret" })
  assert.deepEqual(providers.map((p) => p.id), ["google"])
  const google = providers[0] as unknown as { options: { clientId: string; clientSecret: string } }
  assert.equal(google.options.clientId, "my-id")
  assert.equal(google.options.clientSecret, "my-secret")
})
