import Papa from "papaparse"
import { parseCurrency, type Currency } from "./currency"
import { parseProlificTimestamp, calculateDuration } from "./date-utils"
import { calculateEarning } from "./earnings-calculator"

export interface ProlificCSVRow {
  Study: string
  Reward: string
  Bonus: string
  "Started At": string
  "Completed At": string
  "Completion Code": string
  Status: string
}

export interface ParsedEarning {
  studyTitle: string
  reward: number
  rewardCurrency: Currency
  bonus: number
  bonusCurrency: Currency
  totalEarning: number
  startedAt: Date | null
  completedAt: Date | null
  completionCode: string | null
  status: string
  durationMinutes: number | null
  hourlyRate: number | null
  normalizedGBP: number
  normalizedUSD: number
  source: string
}

export interface CSVParseResult {
  success: boolean
  data: ParsedEarning[]
  errors: string[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    totalEarnings: number
    currency: Currency
  }
}

export async function parseProlificCSV(file: File): Promise<CSVParseResult> {
  // Read file as text first
  const text = await file.text()

  return new Promise((resolve) => {
    const errors: string[] = []
    const parsedEarnings: ParsedEarning[] = []

    Papa.parse<ProlificCSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        let totalEarnings = 0
        let detectedCurrency: Currency = "GBP"

        results.data.forEach((row, index) => {
          try {
            if (!row.Study || !row.Reward || !row.Status) {
              errors.push(`Row ${index + 2}: Missing required fields`)
              return
            }

            const rewardParsed = parseCurrency(row.Reward)
            const bonusParsed = parseCurrency(row.Bonus || "0")

            if (index === 0) {
              detectedCurrency = rewardParsed.currency
            }

            const startedAt = parseProlificTimestamp(row["Started At"])
            const completedAt = parseProlificTimestamp(row["Completed At"])
            const durationMinutes = calculateDuration(startedAt, completedAt)

            const calculation = calculateEarning({
              reward: rewardParsed.amount,
              rewardCurrency: rewardParsed.currency,
              bonus: bonusParsed.amount,
              bonusCurrency: bonusParsed.currency,
              startedAt,
              completedAt,
              status: row.Status.toUpperCase(),
            })

            const earning: ParsedEarning = {
              studyTitle: row.Study.trim(),
              reward: rewardParsed.amount,
              rewardCurrency: rewardParsed.currency,
              bonus: bonusParsed.amount,
              bonusCurrency: bonusParsed.currency,
              totalEarning: calculation.totalEarning,
              startedAt,
              completedAt,
              completionCode: row["Completion Code"]?.trim() || null,
              status: row.Status.toUpperCase(),
              durationMinutes,
              hourlyRate: calculation.hourlyRate,
              normalizedGBP: calculation.normalizedGBP,
              normalizedUSD: calculation.normalizedUSD,
              source: "csv_import",
            }

            parsedEarnings.push(earning)

            if (calculation.shouldCount) {
              totalEarnings += calculation.totalEarning
            }

          } catch (error) {
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Parse error'}`)
          }
        })

        resolve({
          success: errors.length === 0,
          data: parsedEarnings,
          errors,
          summary: {
            totalRows: results.data.length,
            validRows: parsedEarnings.length,
            invalidRows: errors.length,
            totalEarnings,
            currency: detectedCurrency,
          },
        })
      },
      error: (error: Error) => {
        resolve({
          success: false,
          data: [],
          errors: [error.message],
          summary: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            totalEarnings: 0,
            currency: "GBP",
          },
        })
      },
    })
  })
}

export async function validateCSVHeaders(file: File): Promise<{ valid: boolean; missing: string[] }> {
  const text = await file.text()
  const requiredHeaders = ["Study", "Reward", "Bonus", "Started At", "Completed At", "Status"]

  return new Promise((resolve) => {
    Papa.parse(text, {
      preview: 1,
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        const missing = requiredHeaders.filter(h => !headers.includes(h))

        resolve({
          valid: missing.length === 0,
          missing,
        })
      },
      error: () => {
        resolve({
          valid: false,
          missing: requiredHeaders,
        })
      },
    })
  })
}

export async function previewCSV(file: File, rows: number = 5): Promise<ProlificCSVRow[]> {
  const text = await file.text()

  return new Promise((resolve) => {
    Papa.parse<ProlificCSVRow>(text, {
      header: true,
      preview: rows,
      complete: (results) => {
        resolve(results.data)
      },
      error: () => {
        resolve([])
      },
    })
  })
}
