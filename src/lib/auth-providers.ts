import GoogleProvider from "next-auth/providers/google"
import type { Provider } from "next-auth/providers/index"

type Env = Record<string, string | undefined>

export function isGoogleAuthConfigured(env: Env = process.env): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim())
}

/**
 * OAuth providers that are actually configured in this environment.
 *
 * Registering Google with an empty client id makes every sign-in attempt fail
 * server-side with OAuthSignin ("client_id is required"), so it is only added
 * when both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 */
export function getOAuthProviders(env: Env = process.env): Provider[] {
  if (!isGoogleAuthConfigured(env)) {
    console.warn(
      "[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set: Google sign-in is disabled."
    )
    return []
  }

  return [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!.trim(),
      clientSecret: env.GOOGLE_CLIENT_SECRET!.trim(),
    }),
  ]
}
