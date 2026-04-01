"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface UploadResult {
  uploadId: string
  fileName: string
  recordCount: number
  importedCount: number
  duplicateCount: number
  errorCount: number
  errors: string[]
  message?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile)
      setResult(null)
    } else {
      toast.error("Please upload a CSV file")
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile)
      setResult(null)
    } else {
      toast.error("Please upload a CSV file")
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Upload failed")
        return
      }

      setResult(data)

      if (data.importedCount > 0) {
        toast.success(`Successfully imported ${data.importedCount} earnings!`)
      } else if (data.duplicateCount > 0) {
        toast.info("All records were duplicates - nothing new to import")
      }
    } catch (error) {
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CSV</h1>
        <p className="text-muted-foreground">
          Import your Prolific earnings from a CSV export
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to export from Prolific</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to your Prolific dashboard</li>
            <li>Navigate to <strong>Submissions</strong> page</li>
            <li>Click <strong>Export</strong> or <strong>Download CSV</strong></li>
            <li>Upload the downloaded file here</li>
          </ol>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          {!result ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <FileText className="h-12 w-12 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import Earnings
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Drag and drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or</p>
                    </div>
                    <div>
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span>Browse Files</span>
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only CSV files are supported
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results */
<div className="space-y-6">
  <div className="flex items-center justify-center">
    {result.errorCount === 0 && result.importedCount > 0 ? (
      <CheckCircle className="h-16 w-16 text-green-500" />
    ) : result.importedCount > 0 ? (
      <AlertCircle className="h-16 w-16 text-yellow-500" />
    ) : result.duplicateCount > 0 ? (
      <AlertCircle className="h-16 w-16 text-blue-500" />
    ) : (
      <XCircle className="h-16 w-16 text-red-500" />
    )}
  </div>

  <div className="text-center">
    <h3 className="text-xl font-semibold mb-2">
      {result.importedCount > 0
        ? "Import Successful!"
        : result.duplicateCount > 0
        ? "Already Imported"
        : "Import Complete"}
    </h3>
    <p className="text-muted-foreground">{result.fileName}</p>
    {/* ✨ NEW: Show detailed message */}
    <p className="text-sm mt-2 text-gray-600 max-w-md mx-auto">
      {result.message}
    </p>
  </div>

  <div className="grid grid-cols-3 gap-4">
    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
      <p className="text-3xl font-bold text-green-600">{result.importedCount}</p>
      <p className="text-sm text-green-700 mt-1">New Studies</p>
    </div>
    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-3xl font-bold text-blue-600">{result.duplicateCount}</p>
      <p className="text-sm text-blue-700 mt-1">Duplicates Skipped</p>
    </div>
    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-3xl font-bold text-red-600">{result.errorCount}</p>
      <p className="text-sm text-red-700 mt-1">Errors</p>
    </div>
  </div>

              {/* Total row count - NEW */}
  <div className="text-center text-sm text-muted-foreground">
    Processed {result.recordCount} rows from CSV file
  </div>

  {result.errors.length > 0 && (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <p className="font-medium text-red-800 mb-2">Errors encountered:</p>
      <ul className="text-sm text-red-700 space-y-1">
        {result.errors.slice(0, 5).map((error, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>{error}</span>
          </li>
        ))}
        {result.errors.length > 5 && (
          <li className="text-red-600 font-medium">
            ... and {result.errors.length - 5} more errors
          </li>
        )}
      </ul>
    </div>
  )}

  <div className="flex items-center justify-center gap-2">
    <Button onClick={() => router.push("/dashboard")}>
      Go to Dashboard
    </Button>
    <Button variant="outline" onClick={resetUpload}>
      Upload Another File
    </Button>
  </div>
</div>

          )}
        </CardContent>
      </Card>
    </div>
  )
}
