import { FAQ, FEATURES, NOT_AFFILIATED, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

// /llms.txt (https://llmstxt.org): a plain-text summary for AI assistants and
// answer engines, generated from the same copy as the landing page.
export const dynamic = "force-static"

export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    NOT_AFFILIATED,
    "",
    "## Features",
    ...FEATURES.map((f) => `- ${f}`),
    "",
    "## Frequently asked questions",
    ...FAQ.flatMap(({ question, answer }) => [`### ${question}`, answer, ""]),
    "## Links",
    `- [Home](${SITE_URL}/): what the tracker does, features and FAQ`,
    `- [Live demo with sample data](${SITE_URL}/demo): no account needed`,
    `- [Create a free account](${SITE_URL}/register)`,
    `- [Sign in](${SITE_URL}/login)`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
