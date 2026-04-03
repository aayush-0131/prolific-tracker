import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/earnings - Get all earnings for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")
    const debug = searchParams.get("debug") // ✅ NEW: Debug mode

    // ✅ NEW: Debug endpoint
    if (debug === "native") {
      const allEarnings = await prisma.earning.findMany({
        where: { userId: session.user.id },
        orderBy: { startedAt: "desc" },
      })

      const countable = allEarnings.filter(e =>
        e.status === "APPROVED" || e.status === "SCREENED OUT"
      )

      let nativeGBP = 0
      let nativeUSD = 0

      countable.forEach(e => {
        const earningCurrency = e.status === "SCREENED OUT"
          ? (e.bonusCurrency || e.rewardCurrency)
          : e.rewardCurrency

        if (earningCurrency === "GBP") {
          nativeGBP += e.totalEarning || 0
        } else if (earningCurrency === "USD") {
          nativeUSD += e.totalEarning || 0
        }
      })

      const gbpEarnings = countable.filter(e => {
        const currency = e.status === "SCREENED OUT"
          ? (e.bonusCurrency || e.rewardCurrency)
          : e.rewardCurrency
        return currency === "GBP"
      })

      const usdEarnings = countable.filter(e => {
        const currency = e.status === "SCREENED OUT"
          ? (e.bonusCurrency || e.rewardCurrency)
          : e.rewardCurrency
        return currency === "USD"
      })

      return NextResponse.json({
        summary: {
          totalEarnings: allEarnings.length,
          approvedCount: allEarnings.filter(e => e.status === "APPROVED").length,
          screenedOutCount: allEarnings.filter(e => e.status === "SCREENED OUT").length,
          countableCount: countable.length,
          nativeGBP,
          nativeUSD,
        },
        breakdown: {
          gbpCount: gbpEarnings.length,
          gbpTotal: gbpEarnings.reduce((sum, e) => sum + (e.totalEarning || 0), 0),
          gbpSample: gbpEarnings.slice(0, 5).map(e => ({
            title: e.studyTitle,
            totalEarning: e.totalEarning,
            reward: e.reward,
            bonus: e.bonus,
            status: e.status,
            rewardCurrency: e.rewardCurrency,
            bonusCurrency: e.bonusCurrency,
          })),
          usdCount: usdEarnings.length,
          usdTotal: usdEarnings.reduce((sum, e) => sum + (e.totalEarning || 0), 0),
          usdSample: usdEarnings.slice(0, 5).map(e => ({
            title: e.studyTitle,
            totalEarning: e.totalEarning,
            reward: e.reward,
            bonus: e.bonus,
            status: e.status,
            rewardCurrency: e.rewardCurrency,
            bonusCurrency: e.bonusCurrency,
          })),
        },
        zeroEarnings: countable.filter(e => (e.totalEarning || 0) === 0).map(e => ({
          title: e.studyTitle,
          status: e.status,
          reward: e.reward,
          bonus: e.bonus,
          totalEarning: e.totalEarning,
          rewardCurrency: e.rewardCurrency,
          bonusCurrency: e.bonusCurrency,
        })),
      })
    }

    // Build query
    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.startedAt = {}
      if (startDate) {
        where.startedAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate)
      }
    }

    const earnings = await prisma.earning.findMany({
      where,
      orderBy: {
        startedAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ earnings })

  } catch (error) {
    console.error("Get earnings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
}

// POST /api/earnings - Create manual earning entry
const createEarningSchema = z.object({
  studyTitle: z.string().min(1, "Study title is required"),
  reward: z.number().min(0),
  rewardCurrency: z.enum(["GBP", "USD"]),
  bonus: z.number().min(0).default(0),
  bonusCurrency: z.enum(["GBP", "USD"]).optional(),
  status: z.string().default("APPROVED"),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  completionCode: z.string().optional(),
  notes: z.string().optional(),
})

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
    const validatedData = createEarningSchema.parse(body)

    // Calculate total and normalized values
    const totalEarning = validatedData.reward + validatedData.bonus

    // Simple conversion (you can enhance this)
    const normalizedGBP = validatedData.rewardCurrency === "GBP"
      ? totalEarning
      : totalEarning * 0.79
    const normalizedUSD = validatedData.rewardCurrency === "USD"
      ? totalEarning
      : totalEarning * 1.27

    // Calculate duration if both dates provided
    let durationMinutes = null
    let hourlyRate = null

    if (validatedData.startedAt && validatedData.completedAt) {
      const start = new Date(validatedData.startedAt)
      const end = new Date(validatedData.completedAt)
      durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

      if (durationMinutes > 0) {
        hourlyRate = (totalEarning / durationMinutes) * 60
      }
    }

    const earning = await prisma.earning.create({
      data: {
        userId: session.user.id,
        studyTitle: validatedData.studyTitle,
        reward: validatedData.reward,
        rewardCurrency: validatedData.rewardCurrency,
        bonus: validatedData.bonus,
        bonusCurrency: validatedData.bonusCurrency || validatedData.rewardCurrency,
        totalEarning,
        normalizedGBP,
        normalizedUSD,
        status: validatedData.status,
        startedAt: validatedData.startedAt ? new Date(validatedData.startedAt) : null,
        completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
        completionCode: validatedData.completionCode,
        durationMinutes,
        hourlyRate,
        notes: validatedData.notes,
        source: "manual",
      },
    })

    return NextResponse.json(earning, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Create earning error:", error)
    return NextResponse.json(
      { error: "Failed to create earning" },
      { status: 500 }
    )
  }
}
