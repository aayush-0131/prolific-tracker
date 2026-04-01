export interface Earning {
  id: string
  userId: string
  studyTitle: string
  completionCode: string | null
  status: string
  reward: number
  rewardCurrency: string
  bonus: number
  bonusCurrency: string | null
  totalEarning: number
  normalizedGBP: number | null
  normalizedUSD: number | null
  startedAt: Date | null
  completedAt: Date | null
  durationMinutes: number | null
  hourlyRate: number | null
  source: string
  uploadId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface EarningSummary {
  total: number
  approved: number
  pending: number
  count: number
}

export interface DateRangeSummary {
  today: EarningSummary
  week: EarningSummary
  month: EarningSummary
  allTime: EarningSummary
}
