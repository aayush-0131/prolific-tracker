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

    // Calculate summaries
    const calculateSummary = (earnings: any[]) => {
      const approved = earnings.filter(e => e.status === "APPROVED")
      const pending = earnings.filter(e => e.status === "AWAITING REVIEW")
      const screenedOut = earnings.filter(e => e.status === "SCREENED OUT")

      const total = [
        ...approved.map(e => e.totalEarning),
        ...screenedOut.map(e => e.bonus),
      ].reduce((sum, val) => sum + val, 0)

      const approvedTotal = approved.reduce((sum, e) => sum + e.totalEarning, 0)
      const pendingTotal = pending.reduce((sum, e) => sum + e.totalEarning, 0)

      return {
        total,
        approved: approvedTotal,
        pending: pendingTotal,
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

    // Daily earnings for chart (last 30 days)
    const dailyMap = new Map<string, { amount: number; count: number }>()

    allEarnings.forEach(earning => {
      if (!earning.startedAt) return

      const dateKey = format(earning.startedAt, "yyyy-MM-dd")
      const current = dailyMap.get(dateKey) || { amount: 0, count: 0 }

      const amount = earning.status === "APPROVED"
        ? earning.totalEarning
        : earning.status === "SCREENED OUT"
        ? earning.bonus
        : 0

      dailyMap.set(dateKey, {
        amount: current.amount + amount,
        count: current.count + 1,
      })
    })

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    // Status breakdown
    const statusMap = new Map<string, { count: number; amount: number }>()

    allEarnings.forEach(earning => {
      const current = statusMap.get(earning.status) || { count: 0, amount: 0 }
      statusMap.set(earning.status, {
        count: current.count + 1,
        amount: current.amount + earning.totalEarning,
      })
    })

    const totalEarnings = allEarnings.length
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
      percentage: (data.count / totalEarnings) * 100,
    }))

    // Average hourly rate
    const earningsWithRate = allEarnings.filter(e => e.hourlyRate !== null)
    const averageHourlyRate = earningsWithRate.length > 0
      ? earningsWithRate.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / earningsWithRate.length
      : 0

    // Average study duration
    const earningsWithDuration = allEarnings.filter(e => e.durationMinutes !== null)
    const averageStudyDuration = earningsWithDuration.length > 0
      ? earningsWithDuration.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / earningsWithDuration.length
      : 0

    // ✨ NEW: Weekly goal data
    // ✨ NEW: Weekly goal data
    const weeklyData = {
      earnings: week.total,
      // weeklyGoal may not be present on the generated User type; use a safe cast and default to 0
      goal: parseFloat(((user as any)?.weeklyGoal ?? 0).toString()),
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
      daily,
      statusBreakdown,
      averageHourlyRate,
      averageStudyDuration,
      totalStudies: allEarnings.length,
      weekly: weeklyData, // ✨ NEW
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
