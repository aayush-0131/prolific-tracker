import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID required"),
})

// DELETE /api/earnings/bulk - Delete multiple earnings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { ids } = bulkDeleteSchema.parse(body)

    // Verify ownership of all earnings before deletion
    const earnings = await prisma.earning.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (earnings.length !== ids.length) {
      return NextResponse.json(
        { error: "Some earnings not found or unauthorized" },
        { status: 403 }
      )
    }

    // Delete all at once
    const result = await prisma.earning.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'earning' : 'earnings'}`,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Bulk delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete earnings" },
      { status: 500 }
    )
  }
}
