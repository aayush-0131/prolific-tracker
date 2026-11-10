import Papa from "papaparse"

/** Largest accepted upload. A real 640-row Prolific export is ~100 KB. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const REQUIRED_COLUMNS = ["Study", "Reward", "Status"]

/**
 * Decide whether text is a Prolific submissions export by its header row, not by
 * file name or MIME type: phones often save CSVs as ".CSV", without an
 * extension, or as ".csv.txt", and label them with varying MIME types.
 */
export function checkProlificCsvHeader(text: string): { ok: boolean; missing: string[] } {
  const firstLine = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? ""
  const parsed = Papa.parse<string[]>(firstLine, { header: false })
  const fields = new Set((parsed.data[0] ?? []).map((f) => String(f).trim()))
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.has(c))
  return { ok: missing.length === 0, missing }
}

/**
 * File-picker filter. Android maps `accept` to MIME types and greys out files
 * whose provider reports something other than text/csv, so list the common
 * CSV labels too. The real check is checkProlificCsvHeader().
 */
export const CSV_ACCEPT =
  ".csv,text/csv,text/comma-separated-values,application/csv,application/vnd.ms-excel,text/plain"
