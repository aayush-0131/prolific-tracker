export interface DailyEarning {
  date: string
  amount: number
  count: number
}

export interface MonthlyEarning {
  month: string
  amount: number
  count: number
}

export interface StatusBreakdown {
  status: string
  count: number
  amount: number
  percentage: number
}

export interface HourlyRateData {
  date: string
  hourlyRate: number
}

export interface AnalyticsData {
  daily: DailyEarning[]
  monthly: MonthlyEarning[]
  statusBreakdown: StatusBreakdown[]
  hourlyRates: HourlyRateData[]
  averageHourlyRate: number
  totalStudies: number
  averageStudyDuration: number
}

// ✅ NEW: Types for dashboard analytics
export interface PeriodSummary {
  nativeGBP: number
  nativeUSD: number
  combinedGBP: number
  combinedUSD: number
  totalGBP: number  // Legacy
  totalUSD: number  // Legacy
  approvedGBP: number
  approvedUSD: number
  pendingGBP: number
  pendingUSD: number
  count: number
  approvedCount?: number
  pendingCount?: number
}

export interface DashboardAnalytics {
  summary: {
    today: PeriodSummary
    week: PeriodSummary
    month: PeriodSummary
    allTime: PeriodSummary
  }
  currency: string
  daily: Array<{
    date: string
    amountGBP: number
    amountUSD: number
    count: number
  }>
  statusBreakdown: Array<{
    status: string
    count: number
    amountGBP: number
    amountUSD: number
    percentage: number
  }>
  averageHourlyRate: number
  averageStudyDuration: number
  totalStudies: number
  weekly: {
    earningsGBP: number
    earningsUSD: number
    goal: number
    currency: string
    studyCount: number
  }
}
