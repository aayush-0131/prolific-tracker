import { test } from "node:test"
import assert from "node:assert/strict"
import { checkProlificCsvHeader, MAX_UPLOAD_BYTES } from "../csv-file"

// Regression: on phones the upload was rejected by file NAME (".CSV", no extension,
// ".csv.txt") although the content was a valid Prolific export. Decide by content.

const HEADER = "Study,Reward,Bonus,Started At,Completed At,Completion Code,Status,Published By"

test("a real Prolific export header is accepted (with CRLF, BOM and extra columns)", () => {
  assert.deepEqual(checkProlificCsvHeader(HEADER + "\r\nA,£1.00,,2026-11-10 10:00:00,,,APPROVED,X\r\n"), { ok: true, missing: [] })
  assert.equal(checkProlificCsvHeader("﻿" + HEADER + "\n").ok, true)
  assert.equal(checkProlificCsvHeader('"Study","Reward","Status"\n').ok, true)
})

test("files that are not a Prolific export are rejected with the missing columns", () => {
  assert.deepEqual(checkProlificCsvHeader("name,amount\nx,1\n"), { ok: false, missing: ["Study", "Reward", "Status"] })
  assert.deepEqual(checkProlificCsvHeader("Study,Bonus\n").missing, ["Reward", "Status"])
  assert.equal(checkProlificCsvHeader("").ok, false)
  assert.equal(checkProlificCsvHeader("\u0000\u0001PK\u0003\u0004binary").ok, false)
})

test("upload size cap leaves plenty of room for real exports", () => {
  // A real 640-row export is ~100 KB; the cap allows ~30k+ rows.
  assert.equal(MAX_UPLOAD_BYTES, 5 * 1024 * 1024)
})
