import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  currency: z.enum(["GBP", "USD"]).optional(),
  weeklyGoal: z.number().min(0).optional(),
  fiscalYearStart: z.number().min(1).max(12).optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if email is already taken by another user
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        )
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        ...(validatedData.currency && { currency: validatedData.currency }),
        ...(validatedData.weeklyGoal !== undefined && { weeklyGoal: validatedData.weeklyGoal }),
        ...(validatedData.fiscalYearStart && { fiscalYearStart: validatedData.fiscalYearStart }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        weeklyGoal: true,
        fiscalYearStart: true,
      },
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message ?? "Invalid input"
      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
