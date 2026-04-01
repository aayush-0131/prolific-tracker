import { calculateDuration } from "./date-utils"
import { normalizeToGBP, normalizeToUSD, type Currency } from "./currency"

export type EarningStatus =
  | "APPROVED"
  | "AWAITING REVIEW"
  | "RETURNED"
  | "REJECTED"
  | "SCREENED OUT"
  | "TIMED-OUT"

export interface EarningCalculation {
  totalEarning: number
  hourlyRate: number | null
  normalizedGBP: number
  normalizedUSD: number
  shouldCount: boolean
  isPending: boolean
}

export function calculateEarning(data: {
  reward: number
  rewardCurrency: Currency
  bonus: number
  bonusCurrency?: Currency | null
  startedAt?: Date | string | null
  completedAt?: Date | string | null
  status: string
}): EarningCalculation {
  const status = data.status as EarningStatus
  let totalEarning = 0

  if (status === "APPROVED") {
    totalEarning = data.reward + data.bonus
  } else if (status === "SCREENED OUT") {
    totalEarning = data.bonus
  } else if (status === "AWAITING REVIEW") {
    totalEarning = data.reward + data.bonus
  } else {
    totalEarning = 0
  }

  const durationMinutes = calculateDuration(data.startedAt || null, data.completedAt || null)
  let hourlyRate: number | null = null

  if (durationMinutes && durationMinutes > 0 && totalEarning > 0) {
    hourlyRate = (totalEarning / durationMinutes) * 60
  }

  const normalizedGBP = normalizeToGBP(totalEarning, data.rewardCurrency)
  const normalizedUSD = normalizeToUSD(totalEarning, data.rewardCurrency)

  const shouldCount = ["APPROVED", "SCREENED OUT"].includes(status)
  const isPending = status === "AWAITING REVIEW"

  return {
    totalEarning,
    hourlyRate,
    normalizedGBP,
    normalizedUSD,
    shouldCount,
    isPending,
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200"
    case "AWAITING REVIEW":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "RETURNED":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200"
    case "SCREENED OUT":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "TIMED-OUT":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function getStatusDisplay(status: string): string {
  return status.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")
}
