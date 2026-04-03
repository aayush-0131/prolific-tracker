import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, startOfWeek, startOfMonth, format } from "date-fns"

// GET /api/analytics - Get dashboard analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data (for currency and weekly goal)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currency: true,
        weeklyGoal: true,
        fiscalYearStart: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)

    // Get all earnings for user
    const allEarnings = await prisma.earning.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startedAt: "desc",
      },
    })

    // ✅ Statuses that count as "earned" (matches Prolific)
    const COUNTABLE_STATUSES = ["APPROVED", "SCREENED OUT"]

    // ✅ OPTION C: Calculate BOTH native currency totals AND combined totals
    const calculateSummary = (earnings: any[]) => {
      const approved = earnings.filter(e => e.status === "APPROVED")
      const pending = earnings.filter(e => e.status === "AWAITING REVIEW")
      const screenedOut = earnings.filter(e => e.status === "SCREENED OUT")

      // 🔥 FIX: Native currency totals (matches Prolific exactly)
      let nativeGBP = 0
      let nativeUSD = 0

      earnings.forEach(e => {
        if (COUNTABLE_STATUSES.includes(e.status)) {
          // 🔥 FIX: For SCREENED OUT, use bonusCurrency instead of rewardCurrency
          const earningCurrency = e.status === "SCREENED OUT"
            ? (e.bonusCurrency || e.rewardCurrency)
            : e.rewardCurrency

          if (earningCurrency === "GBP") {
            nativeGBP += e.totalEarning || 0
          } else if (earningCurrency === "USD") {
            nativeUSD += e.totalEarning || 0
          }
        }
      })

      // 🔥 Combined totals (all earnings converted to single currency)
      const combinedGBP = earnings
        .filter(e => COUNTABLE_STATUSES.includes(e.status))
        .map(e => e.normalizedGBP || 0)
        .reduce((sum, val) => sum + val, 0)

      const combinedUSD = earnings
        .filter(e => COUNTABLE_STATUSES.includes(e.status))
        .map(e => e.normalizedUSD || 0)
        .reduce((sum, val) => sum + val, 0)

      // Approved only (for reference)
      const approvedGBP = approved
        .map(e => e.normalizedGBP || 0)
        .reduce((sum, val) => sum + val, 0)

      const approvedUSD = approved
        .map(e => e.normalizedUSD || 0)
        .reduce((sum, val) => sum + val, 0)

      // Pending only (for reference)
      const pendingGBP = pending
        .map(e => e.normalizedGBP || 0)
        .reduce((sum, val) => sum + val, 0)

      const pendingUSD = pending
        .map(e => e.normalizedUSD || 0)
        .reduce((sum, val) => sum + val, 0)

      return {
        // Native currency totals (matches Prolific)
        nativeGBP,
        nativeUSD,
        // Combined totals (converted)
        combinedGBP,
        combinedUSD,
        // Legacy fields (for backwards compatibility)
        totalGBP: combinedGBP,
        totalUSD: combinedUSD,
        approvedGBP,
        approvedUSD,
        pendingGBP,
        pendingUSD,
        count: earnings.length,
        approvedCount: approved.length,
        pendingCount: pending.length,
      }
    }

    const today = calculateSummary(
      allEarnings.filter(e => e.startedAt && e.startedAt >= todayStart)
    )

    const week = calculateSummary(
      allEarnings.filter(e => e.startedAt && e.startedAt >= weekStart)
    )

    const month = calculateSummary(
      allEarnings.filter(e => e.startedAt && e.startedAt >= monthStart)
    )

    const allTime = calculateSummary(allEarnings)

    // Daily earnings for chart (last 30 days)
    const dailyMap = new Map<string, { amountGBP: number; amountUSD: number; count: number }>()

    allEarnings.forEach(earning => {
      if (!earning.startedAt) return

      const dateKey = format(earning.startedAt, "yyyy-MM-dd")
      const current = dailyMap.get(dateKey) || { amountGBP: 0, amountUSD: 0, count: 0 }

      let amountGBP = 0
      let amountUSD = 0

      if (COUNTABLE_STATUSES.includes(earning.status)) {
        amountGBP = earning.normalizedGBP || 0
        amountUSD = earning.normalizedUSD || 0
      }

      dailyMap.set(dateKey, {
        amountGBP: current.amountGBP + amountGBP,
        amountUSD: current.amountUSD + amountUSD,
        count: current.count + 1,
      })
    })

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    // Status breakdown
    const statusMap = new Map<string, { count: number; amountGBP: number; amountUSD: number }>()

    allEarnings.forEach(earning => {
      const current = statusMap.get(earning.status) || { count: 0, amountGBP: 0, amountUSD: 0 }

      statusMap.set(earning.status, {
        count: current.count + 1,
        amountGBP: current.amountGBP + (earning.normalizedGBP || 0),
        amountUSD: current.amountUSD + (earning.normalizedUSD || 0),
      })
    })

    const totalEarnings = allEarnings.length
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      amountGBP: data.amountGBP,
      amountUSD: data.amountUSD,
      percentage: totalEarnings > 0 ? (data.count / totalEarnings) * 100 : 0,
    }))

    // Average hourly rate
    const earningsWithRate = allEarnings.filter(e => e.hourlyRate !== null && e.hourlyRate > 0)
    const averageHourlyRate = earningsWithRate.length > 0
      ? earningsWithRate.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / earningsWithRate.length
      : 0

    // Average study duration
    const earningsWithDuration = allEarnings.filter(e => e.durationMinutes !== null && e.durationMinutes > 0)
    const averageStudyDuration = earningsWithDuration.length > 0
      ? earningsWithDuration.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / earningsWithDuration.length
      : 0

    // Weekly goal data
    const weeklyData = {
      earningsGBP: week.combinedGBP,
      earningsUSD: week.combinedUSD,
      goal: parseFloat((user.weeklyGoal || 0).toString()),
      currency: user.currency,
      studyCount: week.count,
    }

    return NextResponse.json({
      summary: {
        today,
        week,
        month,
        allTime,
      },
      currency: user.currency,
      daily,
      statusBreakdown,
      averageHourlyRate,
      averageStudyDuration,
      totalStudies: allEarnings.length,
      weekly: weeklyData,
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
