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
