"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Upload,
  File,
  X,
  FileText,
  Archive,
  MessageCircle,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { validateFile, formatFileSize, SUPPORTED_FILE_TYPES } from "@/lib/file-utils"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "./markdown-renderer"

interface ProcessedDocument {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  extractedText: string
  wordCount: number
  charCount: number
  summary?: string
  status: "processing" | "completed" | "error"
  error?: string
}

interface DocumentUploadProps {
  onDocumentProcessed: (document: ProcessedDocument) => void
  onChatWithDocument: (document: ProcessedDocument) => void
  onSummarizeDocument: (document: ProcessedDocument) => void
  onDocumentRemoved: (documentId: string) => void
  persistedDocuments: ProcessedDocument[]
  maxFiles?: number
}

export default function DocumentUpload({
  onDocumentProcessed,
  onChatWithDocument,
  onSummarizeDocument,
  onDocumentRemoved,
  persistedDocuments,
  maxFiles = 10,
}: DocumentUploadProps) {
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([])
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize from persisted documents only once
  useEffect(() => {
    setProcessedDocs(persistedDocuments)
  }, []) // Empty dependency array - only run once on mount

  // Sync with persisted documents changes (but don't override local state completely)
  useEffect(() => {
    // Only update if there are actual changes
    if (JSON.stringify(persistedDocuments) !== JSON.stringify(processedDocs)) {
      setProcessedDocs(persistedDocuments)
    }
  }, [persistedDocuments])

  const processFile = async (file: File) => {
    const docId = crypto.randomUUID()
    const newDoc: ProcessedDocument = {
      id: docId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedText: "",
      wordCount: 0,
      charCount: 0,
      status: "processing",
    }

    setProcessedDocs((prev) => [...prev, newDoc])
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log(`Starting processing for ${file.name} (${file.type})`)

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      })

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        // Try to parse as JSON, fallback to text
        let errorMessage = "Failed to process document"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If it's HTML (like <!DOCTYPE), extract a meaningful message
          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = "Server error - API endpoint not found or returned HTML instead of JSON"
          } else {
            errorMessage = errorText.slice(0, 100) // First 100 chars of error
          }
        }
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON response:", responseText.slice(0, 200))
        throw new Error("Server returned non-JSON response. Check API endpoint.")
      }

      const data = await response.json()

      console.log(`Successfully processed ${file.name}:`, {
        extractedLength: data.extractedText?.length || 0,
        wordCount: data.wordCount || 0,
        charCount: data.charCount || 0,
      })

      const completedDoc: ProcessedDocument = {
        ...newDoc,
        extractedText: data.extractedText || "",
        wordCount: data.wordCount || 0,
        charCount: data.charCount || 0,
        status: "completed",
      }

      setProcessedDocs((prev) => prev.map((doc) => (doc.id === docId ? completedDoc : doc)))
      onDocumentProcessed(completedDoc)

      // Show success message with extracted content info
      toast.success(`✅ ${file.name} processed successfully! Extracted ${data.wordCount || 0} words.`)
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error)
      const errorMessage = error instanceof Error ? error.message : "Processing failed"

      const errorDoc: ProcessedDocument = {
        ...newDoc,
        status: "error",
        error: errorMessage,
      }
      setProcessedDocs((prev) => prev.map((doc) => (doc.id === docId ? errorDoc : doc)))
      toast.error(`❌ Failed to process ${file.name}: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const validation = validateFile(file)
        if (!validation.valid) {
          toast.error(validation.error)
          continue
        }

        if (processedDocs.length >= maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`)
          break
        }

        await processFile(file)
      }
    },
    [processedDocs.length, maxFiles],
  )

  const acceptedFileTypes = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/msword": [".doc"],
    "text/plain": [".txt"],
    "text/markdown": [".md"],
    "application/rtf": [".rtf"],
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeDocument = (docId: string) => {
    console.log("Removing document:", docId)
    setProcessedDocs((prev) => prev.filter((doc) => doc.id !== docId))
    onDocumentRemoved(docId)
    if (expandedDoc === docId) {
      setExpandedDoc(null)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText className="h-4 w-4 text-blue-500" />
    if (fileType.includes("text")) return <File className="h-4 w-4 text-gray-500" />
    return <Archive className="h-4 w-4 text-orange-500" />
  }

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("📋 Text copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      {/* Updated Success Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <strong>Reliable Document Support!</strong>
           Word (.docx/.doc), TXT and MD files are fully supported 
          <br />
          <span className="text-sm mt-1 block">
            📄 <strong>For PDFs:</strong> Save as .docx or use copy/paste in Text mode for instant results!
          </span>
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer text-center transition-colors",
              isDragActive && "bg-orange-50 dark:bg-orange-950/20",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-orange-100 dark:bg-orange-950 p-4">
                <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isDragActive ? "Drop your files here..." : "Drag & drop files here, or click to browse"}
                </p>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {Object.values(SUPPORTED_FILE_TYPES).map((ext) => (
                    <Badge key={ext} variant="secondary" className="text-xs">
                      {ext.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Max file size: 10MB • Max files: {maxFiles}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ✅ Perfect text extraction for Word documents
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  📄 For PDFs: Save as .docx or use copy/paste in Text mode
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processed Documents */}
      {processedDocs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">📚 Processed Documents</h4>
            <Badge variant="secondary">
              {processedDocs.length} document{processedDocs.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {processedDocs.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate flex items-center gap-2">
                        {doc.fileName}
                        {doc.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                        {doc.status === "completed" && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{doc.wordCount} words</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{doc.charCount} chars</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === "completed" ? "default" : doc.status === "error" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {doc.status === "processing" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {doc.status === "processing" ? "Processing..." : doc.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)} className="ml-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {doc.status === "processing" && (
                <CardContent className="pt-0">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Extracting text content using {doc.fileType.includes("pdf") ? "pdf-parse" : "mammoth"}...
                  </p>
                </CardContent>
              )}

              {doc.status === "error" && doc.error && (
                <CardContent className="pt-0">
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{doc.error}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Try refreshing the page or check the browser console for more details.
                    </p>
                  </div>
                </CardContent>
              )}

              {doc.status === "completed" && (
                <CardContent className="pt-0 space-y-4">
                  {/* Success indicator */}
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300 text-xs">
                      ✅ Text successfully extracted using{" "}
                      {doc.fileType.includes("pdf")
                        ? "pdf-parse"
                        : doc.fileType.includes("word")
                          ? "mammoth"
                          : "native processing"}
                      . Ready for AI analysis!
                    </AlertDescription>
                  </Alert>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => onSummarizeDocument(doc)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Summarize
                    </Button>
                    <Button
                      onClick={() => onChatWithDocument(doc)}
                      variant="outline"
                      size="sm"
                      className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button
                      onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      variant="outline"
                      size="sm"
                    >
                      {expandedDoc === doc.id ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Content
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Content
                        </>
                      )}
                    </Button>
                    <Button onClick={() => copyText(doc.extractedText)} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {expandedDoc === doc.id && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Extracted Content</h5>
                        <Badge variant="secondary" className="text-xs">
                          {doc.charCount.toLocaleString()} characters
                        </Badge>
                      </div>
                      <div className="max-h-96 overflow-y-auto rounded-lg border bg-muted/30 p-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <MarkdownRenderer content={doc.extractedText} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {processedDocs.length === 0 && !isProcessing && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Ready for Document Upload</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upload Word, TXT, MD, or RTF documents for full text extraction and AI analysis. All file types are now
            fully supported!
          </p>
        </div>
      )}
    </div>
  )
}
