import { format, parseISO, isValid, differenceInMinutes, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

export function formatDate(date: Date | string | null | undefined, formatStr: string = "MMM dd, yyyy"): string {
  if (!date) return "N/A"
  const parsedDate = typeof date === "string" ? parseISO(date) : date
  if (!isValid(parsedDate)) return "Invalid Date"
  return format(parsedDate, formatStr)
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "MMM dd, yyyy h:mm a")
}

export function formatDateInput(date: Date | string | null | undefined): string {
  return formatDate(date, "yyyy-MM-dd")
}

export function parseProlificTimestamp(timestamp: string): Date | null {
  if (!timestamp || timestamp.trim() === "") return null

  try {
    // ✅ FIX: Handle Prolific's microsecond format (6 decimal places)
    // Remove microseconds beyond milliseconds (keep only 3 decimal places)
    let cleanTimestamp = timestamp.trim()

    // Match pattern: "YYYY-MM-DD HH:MM:SS.microseconds"
    const microsecondMatch = cleanTimestamp.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\.(\d+)/)

    if (microsecondMatch) {
      const [, dateTime, decimals] = microsecondMatch
      // Trim to 3 decimal places (milliseconds)
      const milliseconds = decimals.slice(0, 3)
      cleanTimestamp = `${dateTime}.${milliseconds}`
    }

    // Convert space to T for ISO format
    const isoString = cleanTimestamp.replace(" ", "T")
    const date = parseISO(isoString)

    return isValid(date) ? date : null
  } catch (error) {
    console.error("Error parsing timestamp:", timestamp, error)
    return null
  }
}

export function calculateDuration(start: Date | string | null, end: Date | string | null): number | null {
  if (!start || !end) return null
  const startDate = typeof start === "string" ? parseProlificTimestamp(start) : start
  const endDate = typeof end === "string" ? parseProlificTimestamp(end) : end
  if (!startDate || !endDate) return null
  const minutes = differenceInMinutes(endDate, startDate)
  return minutes > 0 ? minutes : null
}

export function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "N/A"
  if (minutes < 60) return `${Math.round(minutes)} min${minutes !== 1 ? 's' : ''}`
  const hours = minutes / 60
  return `${hours.toFixed(1)} hr${hours !== 1 ? 's' : ''}`
}

export function getDateRange(range: "today" | "week" | "month" | "all"): { start: Date; end: Date } | null {
  const now = new Date()
  switch (range) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) }
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "all":
      return null
    default:
      return null
  }
}

export function getRelativeTime(date: Date | string | null): string {
  if (!date) return "N/A"
  const parsedDate = typeof date === "string" ? parseProlificTimestamp(date) : date
  if (!parsedDate) return "N/A"
  const now = new Date()
  const diffMinutes = differenceInMinutes(now, parsedDate)
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
}
