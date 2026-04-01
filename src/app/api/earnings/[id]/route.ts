import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/earnings/[id] - Get single earning
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const earning = await prisma.earning.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!earning) {
      return NextResponse.json(
        { error: "Earning not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(earning)

  } catch (error) {
    console.error("Get earning error:", error)
    return NextResponse.json(
      { error: "Failed to fetch earning" },
      { status: 500 }
    )
  }
}

// PUT /api/earnings/[id] - Update earning
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Verify ownership
    const existing = await prisma.earning.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Earning not found" },
        { status: 404 }
      )
    }

    const earning = await prisma.earning.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(earning)

  } catch (error) {
    console.error("Update earning error:", error)
    return NextResponse.json(
      { error: "Failed to update earning" },
      { status: 500 }
    )
  }
}

// DELETE /api/earnings/[id] - Delete earning
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify ownership
    const existing = await prisma.earning.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Earning not found" },
        { status: 404 }
      )
    }

    await prisma.earning.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json(
      { message: "Earning deleted successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Delete earning error:", error)
    return NextResponse.json(
      { error: "Failed to delete earning" },
      { status: 500 }
    )
  }
}
