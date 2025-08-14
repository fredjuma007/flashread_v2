"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, File, X, FileText, Archive } from "lucide-react"
import { validateFile, formatFileSize, extractTextFromFile, SUPPORTED_FILE_TYPES } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  file: File
  content?: string
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
}

interface DocumentUploadProps {
  onFileProcessed: (file: UploadedFile) => void
  maxFiles?: number
}

export default function DocumentUpload({ onFileProcessed, maxFiles = 5 }: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const processFile = async (file: File) => {
    const fileId = crypto.randomUUID()
    const uploadedFile: UploadedFile = {
      id: fileId,
      file,
      progress: 0,
      status: "uploading",
    }

    setUploadedFiles((prev) => [...prev, uploadedFile])

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      // Update status to processing
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)))

      // Extract text content
      const content = await extractTextFromFile(file)

      const completedFile: UploadedFile = {
        ...uploadedFile,
        content,
        progress: 100,
        status: "completed",
      }

      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? completedFile : f)))

      onFileProcessed(completedFile)
      toast.success(`📄 ${file.name} processed successfully!`)
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f,
        ),
      )
      toast.error(`Failed to process ${file.name}`)
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

        if (uploadedFiles.length >= maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`)
          break
        }

        await processFile(file)
      }
    },
    [uploadedFiles.length, maxFiles],
  )

  // Create accept object with proper format for react-dropzone
  const acceptedFileTypes = {
    "application/pdf": [".pdf"],
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

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText className="h-4 w-4 text-blue-500" />
    if (fileType.includes("text")) return <File className="h-4 w-4 text-gray-500" />
    return <Archive className="h-4 w-4 text-orange-500" />
  }

  return (
    <div className="space-y-4">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(uploadedFile.file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.file.size)}</p>
                  </div>
                  <Badge
                    variant={
                      uploadedFile.status === "completed"
                        ? "default"
                        : uploadedFile.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {uploadedFile.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploadedFile.status !== "completed" && uploadedFile.status !== "error" && (
                <div className="mt-3">
                  <Progress value={uploadedFile.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadedFile.status === "uploading" ? "Uploading..." : "Processing..."}
                  </p>
                </div>
              )}

              {uploadedFile.status === "error" && uploadedFile.error && (
                <p className="text-xs text-red-500 mt-2">{uploadedFile.error}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
