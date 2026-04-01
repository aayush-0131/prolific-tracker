import { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

async function handler(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const params = await context.params
  return await NextAuth(req, context, authOptions)
}

export { handler as GET, handler as POST }
