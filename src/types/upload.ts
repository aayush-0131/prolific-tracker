export interface Upload {
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  recordCount: number
  importedCount: number
  duplicateCount: number
  errorCount: number
  status: string
  errorMessage: string | null
  createdAt: Date
}

export interface UploadResult {
  uploadId: string
  fileName: string
  recordCount: number
  importedCount: number
  duplicateCount: number
  errorCount: number
  errors: string[]
}
