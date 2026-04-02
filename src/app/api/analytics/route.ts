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

    // 🔥 FIX: Statuses that should be counted in totals
    const COUNTABLE_STATUSES = ["APPROVED", "SCREENED OUT"]

    // ✅ DUAL CURRENCY: Calculate summaries for BOTH GBP and USD
    const calculateSummary = (earnings: any[]) => {
      const approved = earnings.filter(e => e.status === "APPROVED")
      const pending = earnings.filter(e => e.status === "AWAITING REVIEW")
      const screenedOut = earnings.filter(e => e.status === "SCREENED OUT")

      // 🔥 FIX: Also count returned/rejected/timed-out that have earnings
      const returnedWithBonus = earnings.filter(e =>
        ["RETURNED", "REJECTED", "TIMED-OUT"].includes(e.status) &&
        ((e.normalizedGBP || 0) > 0 || (e.normalizedUSD || 0) > 0)
      )

      // Calculate totals in BOTH currencies
      const totalGBP = [
        ...approved.map(e => e.normalizedGBP || 0),
        ...screenedOut.map(e => e.normalizedGBP || 0),
        ...returnedWithBonus.map(e => e.normalizedGBP || 0),
      ].reduce((sum, val) => sum + val, 0)

      const totalUSD = [
        ...approved.map(e => e.normalizedUSD || 0),
        ...screenedOut.map(e => e.normalizedUSD || 0),
        ...returnedWithBonus.map(e => e.normalizedUSD || 0),
      ].reduce((sum, val) => sum + val, 0)

      const approvedGBP = approved
        .map(e => e.normalizedGBP || 0)
        .reduce((sum, val) => sum + val, 0)

      const approvedUSD = approved
        .map(e => e.normalizedUSD || 0)
        .reduce((sum, val) => sum + val, 0)

      const pendingGBP = pending
        .map(e => e.normalizedGBP || 0)
        .reduce((sum, val) => sum + val, 0)

      const pendingUSD = pending
        .map(e => e.normalizedUSD || 0)
        .reduce((sum, val) => sum + val, 0)

      return {
        totalGBP,
        totalUSD,
        approvedGBP,
        approvedUSD,
        pendingGBP,
        pendingUSD,
        count: earnings.length,
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

    // Daily earnings for chart (last 30 days) - DUAL CURRENCY
    const dailyMap = new Map<string, { amountGBP: number; amountUSD: number; count: number }>()

    allEarnings.forEach(earning => {
      if (!earning.startedAt) return

      const dateKey = format(earning.startedAt, "yyyy-MM-dd")
      const current = dailyMap.get(dateKey) || { amountGBP: 0, amountUSD: 0, count: 0 }

      // 🔥 FIX: Count any earning with value (not just approved/screened out)
      let amountGBP = 0
      let amountUSD = 0

      if (earning.status === "APPROVED" || earning.status === "SCREENED OUT") {
        amountGBP = earning.normalizedGBP || 0
        amountUSD = earning.normalizedUSD || 0
      } else if ((earning.normalizedGBP || 0) > 0 || (earning.normalizedUSD || 0) > 0) {
        // Returned/rejected with bonus
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

    // Status breakdown - DUAL CURRENCY
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

    // Weekly goal data - DUAL CURRENCY
    const weeklyData = {
      earningsGBP: week.totalGBP,
      earningsUSD: week.totalUSD,
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
