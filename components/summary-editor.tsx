"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Edit3, Save, Undo, Redo, List, Hash, Bold, Italic, Eye, EyeOff, Wand2, RotateCcw } from "lucide-react"
import MarkdownRenderer from "./markdown-renderer"

interface SummaryEditorProps {
  initialContent: string
  onSave: (content: string) => void
  documentName?: string
}

export default function SummaryEditor({ initialContent, onSave, documentName }: SummaryEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isPreview, setIsPreview] = useState(false)
  const [history, setHistory] = useState<string[]>([initialContent])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setHasUnsavedChanges(content !== initialContent)
  }, [content, initialContent])

  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
    }
  }

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newContent)
    addToHistory(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const formatText = (type: string) => {
    switch (type) {
      case "bold":
        insertMarkdown("**", "**")
        break
      case "italic":
        insertMarkdown("*", "*")
        break
      case "heading":
        insertMarkdown("## ")
        break
      case "list":
        insertMarkdown("- ")
        break
      case "number":
        insertMarkdown("1. ")
        break
    }
  }

  const enhanceSummary = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": process.env.NEXT_PUBLIC_GROQ_KEY || "",
        },
        body: JSON.stringify({
          content,
          documentName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance summary")
      }

      const enhancedContent = data.enhanced
      setContent(enhancedContent)
      addToHistory(enhancedContent)
      toast.success("✨ Summary enhanced successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enhance summary")
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSave = () => {
    onSave(content)
    setHasUnsavedChanges(false)
    toast.success("💾 Summary saved successfully!")
  }

  const resetToOriginal = () => {
    setContent(initialContent)
    addToHistory(initialContent)
    setHasUnsavedChanges(false)
    toast.success("🔄 Reset to original summary")
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // Add to history on significant changes (every 10 characters or line breaks)
    if (Math.abs(newContent.length - content.length) >= 10 || newContent.includes("\n") !== content.includes("\n")) {
      addToHistory(newContent)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            <h2 className="font-semibold text-lg">Summary Editor</h2>
          </div>
          {documentName && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
            >
              {documentName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)} className="text-xs">
            {isPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 border-b">
        <div className="flex items-center gap-1 pr-2 border-r">
          <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0">
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r">
          <Button variant="ghost" size="sm" onClick={() => formatText("bold")} className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText("italic")} className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText("heading")} className="h-8 w-8 p-0">
            <Hash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText("list")} className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={enhanceSummary}
            disabled={isEnhancing}
            className="text-xs px-3 h-8 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            {isEnhancing ? "Enhancing..." : "AI Enhance"}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-4 border rounded-lg bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="h-full resize-none font-mono text-sm leading-relaxed border rounded-lg"
            placeholder="Edit your summary here... Use Markdown formatting for better structure."
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <div className="text-xs text-muted-foreground">
          {content.length} characters • {content.split("\n").length} lines
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToOriginal} disabled={content === initialContent}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
