export const SUPPORTED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "text/plain": ".txt",
  "text/markdown": ".md",
  "application/rtf": ".rtf",
} as const

export type SupportedFileType = keyof typeof SUPPORTED_FILE_TYPES

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be less than 10MB" }
  }

  if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
    return { valid: false, error: "Unsupported file type. Please upload PDF, DOCX, DOC, TXT, MD, or RTF files." }
  }

  return { valid: true }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain" || file.type === "text/markdown") {
    return await file.text()
  }

  // For other file types, we'll need to implement server-side processing
  // For now, return a placeholder
  return `[File content from ${file.name} - Processing on server required]`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
