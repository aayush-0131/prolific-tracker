import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseProlificCSV } from "@/lib/csv-parser"
import { fetchLiveRates } from "@/lib/currency"

// POST /api/upload - Upload and parse CSV file
// POST /api/upload - Upload and parse CSV file
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

        // ✅ ADD THESE 2 LINES
    console.log("🔄 Fetching live exchange rates before CSV import...")
    await fetchLiveRates()

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are allowed" },
        { status: 400 }
      )
    }

    // Parse CSV
    const parseResult = await parseProlificCSV(file)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Failed to parse CSV",
          details: parseResult.errors
        },
        { status: 400 }
      )
    }

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType: "csv",
        fileSize: file.size,
        recordCount: parseResult.summary.totalRows,
        status: "processing",
      },
    })

    // Import earnings (with duplicate detection)
    let importedCount = 0
    let duplicateCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const earning of parseResult.data) {
      try {
        // Check for duplicate (by startedAt + studyTitle)
        const existing = await prisma.earning.findFirst({
          where: {
            userId: session.user.id,
            startedAt: earning.startedAt,
            studyTitle: earning.studyTitle,
          },
        })

        if (existing) {
          duplicateCount++
          continue
        }

        // Create earning
        await prisma.earning.create({
          data: {
            userId: session.user.id,
            uploadId: upload.id,
            ...earning,
          },
        })

        importedCount++

      } catch (error) {
        errorCount++
        errors.push(`Failed to import: ${earning.studyTitle}`)
        console.error("Import error:", error)
      }
    }

    // Update upload record
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        importedCount,
        duplicateCount,
        errorCount,
        status: errorCount > 0 ? "partial" : "processed",
        errorMessage: errors.length > 0 ? errors.join(", ") : null,
      },
    })

    // ✨ NEW: Build detailed success message
    let message = ""
    if (importedCount > 0) {
      message = `✅ ${importedCount} new ${importedCount === 1 ? 'study' : 'studies'} imported successfully!`
    } else {
      message = "ℹ️ No new studies to import."
    }

    if (duplicateCount > 0) {
      message += ` ${duplicateCount} ${duplicateCount === 1 ? 'duplicate was' : 'duplicates were'} skipped (already in database).`
    }

    if (errorCount > 0) {
      message += ` ⚠️ ${errorCount} ${errorCount === 1 ? 'row' : 'rows'} had errors.`
    }

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      fileName: file.name,
      recordCount: parseResult.summary.totalRows,
      importedCount,
      duplicateCount,
      errorCount,
      errors,
      message, // ✨ NEW
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    )
  }
}
