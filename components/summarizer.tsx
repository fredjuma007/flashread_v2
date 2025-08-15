"use client"
import { useState, useEffect, useMemo } from "react"
import DocumentUpload from "./document-upload"
import DocumentChat from "./document-chat"
import SummaryEditor from "./summary-editor"
import ExportOptions from "./export-options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2, Trash2, Sparkles, Zap, MessageCircle, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import MarkdownRenderer from "./markdown-renderer"

type Provider = "rapidapi" | "groq"
type Length = "short" | "medium" | "detailed"

interface HistoryItem {
  id: string
  mode: "url" | "text" | "document"
  url?: string
  text?: string
  documentName?: string
  provider: Provider
  length: Length
  summary: string
  createdAt: number
}

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

const LS_HISTORY = "flashread_history"
const LS_DOCUMENTS = "flashread_documents"

export default function Summarizer({ defaultProvider = "rapidapi" as Provider }) {
  const [mode, setMode] = useState<"url" | "text">("url")
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [provider, setProvider] = useState<Provider>(defaultProvider)
  const [length, setLength] = useState<Length>("medium")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState("summarize")
  const [currentChatDocument, setCurrentChatDocument] = useState<{
    content: string
    name: string
  } | null>(null)
  const [persistedDocuments, setPersistedDocuments] = useState<ProcessedDocument[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_HISTORY)
      if (raw) setHistory(JSON.parse(raw))

      const docsRaw = localStorage.getItem(LS_DOCUMENTS)
      if (docsRaw) {
        const docs = JSON.parse(docsRaw)
        console.log("Loaded documents from localStorage:", docs.length)
        setPersistedDocuments(docs)
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    try {
      console.log("Saving documents to localStorage:", persistedDocuments.length)
      localStorage.setItem(LS_DOCUMENTS, JSON.stringify(persistedDocuments))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }, [persistedDocuments])

  const canSubmit = useMemo(() => {
    if (mode === "url") return url.trim().length > 6 && url.startsWith("http")
    return text.trim().length > 10
  }, [mode, url, text])

  const submit = async () => {
    setLoading(true)
    setSummary("")
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
          "x-groq-key": process.env.NEXT_PUBLIC_GROQ_KEY || "",
        },
        body: JSON.stringify({
          mode,
          url: mode === "url" ? url.trim() : undefined,
          text: mode === "text" ? text.trim() : undefined,
          provider,
          length,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to summarize")
      }
      setSummary(data.summary || "")
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        mode,
        url: mode === "url" ? url.trim() : undefined,
        text: mode === "text" ? text.trim() : undefined,
        provider,
        length,
        summary: data.summary || "",
        createdAt: Date.now(),
      }
      const newHistory = [item, ...history].slice(0, 50)
      setHistory(newHistory)
      localStorage.setItem(LS_HISTORY, JSON.stringify(newHistory))
      toast.success(`✨ Summary ready! Used ${data.provider}`)
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const summarizeDocument = async (document: ProcessedDocument) => {
    setLoading(true)
    setSummary("")

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
          "x-groq-key": process.env.NEXT_PUBLIC_GROQ_KEY || "",
        },
        body: JSON.stringify({
          mode: "text",
          text: document.extractedText,
          provider: "groq", // Use Groq for document processing
          length,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to summarize document")
      }

      setSummary(data.summary || "")

      // Add to history
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        mode: "document",
        documentName: document.fileName,
        provider: "groq",
        length,
        summary: data.summary || "",
        createdAt: Date.now(),
      }
      const newHistory = [item, ...history].slice(0, 50)
      setHistory(newHistory)
      localStorage.setItem(LS_HISTORY, JSON.stringify(newHistory))

      // Switch to summarize tab to show results
      setActiveTab("summarize")
      toast.success(`✨ Document summarized successfully!`)
    } catch (err: any) {
      toast.error(err.message ?? "Failed to summarize document")
    } finally {
      setLoading(false)
    }
  }

  const chatWithDocument = (document: ProcessedDocument) => {
    console.log("Setting up chat with document:", {
      fileName: document.fileName,
      contentLength: document.extractedText.length,
      contentPreview: document.extractedText.slice(0, 200),
    })

    setCurrentChatDocument({
      content: document.extractedText,
      name: document.fileName,
    })
    setActiveTab("chat")
    toast.success(`💬 Ready to chat with ${document.fileName}`)
  }

  const handleDocumentProcessed = (document: ProcessedDocument) => {
    console.log("Document processed, adding to state:", document.fileName)
    setPersistedDocuments((prev) => {
      const existing = prev.find((doc) => doc.id === document.id)
      if (existing) {
        return prev.map((doc) => (doc.id === document.id ? document : doc))
      }
      return [...prev, document]
    })
    toast.success(`📄 ${document.fileName} is ready for analysis!`)
  }

  const handleDocumentRemoved = (documentId: string) => {
    console.log("Removing document from state:", documentId)
    setPersistedDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.id !== documentId)
      console.log("Documents after removal:", filtered.length)
      return filtered
    })

    // Force update localStorage immediately
    setTimeout(() => {
      const currentDocs = JSON.parse(localStorage.getItem(LS_DOCUMENTS) || "[]")
      const updatedDocs = currentDocs.filter((doc: ProcessedDocument) => doc.id !== documentId)
      localStorage.setItem(LS_DOCUMENTS, JSON.stringify(updatedDocs))
      console.log("localStorage updated, remaining docs:", updatedDocs.length)
    }, 100)
  }

  const clearHistory = () => {
    localStorage.removeItem(LS_HISTORY)
    setHistory([])
    toast.success("🗑️ History cleared!")
  }

  const clearDocuments = () => {
    console.log("Clearing all documents")
    localStorage.removeItem(LS_DOCUMENTS)
    setPersistedDocuments([])
    toast.success("🗑️ Documents cleared!")
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summarize">Summarize</TabsTrigger>
          <TabsTrigger value="upload">
            Upload Docs
            {persistedDocuments.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {persistedDocuments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="edit">Edit & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="summarize" className="space-y-4">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Original summarizer content */}
            <Card className="border-orange-200/70 dark:border-orange-900/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Summarize Content</span>
                  <Badge className="bg-orange-600 text-white hover:bg-orange-700">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-5">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "url" | "text")}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger
                      value="url"
                      className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-950 dark:data-[state=active]:text-orange-100"
                    >
                      🔗 URL
                    </TabsTrigger>
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-950 dark:data-[state=active]:text-orange-100"
                    >
                      📝 Text
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-3">
                    <Label htmlFor="url-input">Article URL</Label>
                    <Input
                      id="url-input"
                      placeholder="https://example.com/blog-post"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="focus:border-orange-300 focus:ring-orange-200 dark:focus:border-orange-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      ✨ We'll extract and summarize the main content automatically
                    </p>
                  </TabsContent>
                  <TabsContent value="text" className="space-y-3">
                    <Label htmlFor="text-input">Your Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste your article, notes, or any text here..."
                      rows={6}
                      className="focus:border-orange-300 focus:ring-orange-200 dark:focus:border-orange-700 resize-none"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">🚀 Perfect for documents, emails, or research notes</p>
                  </TabsContent>
                </Tabs>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Summary Length</Label>
                    <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                      <SelectTrigger className="w-full focus:border-orange-300 focus:ring-orange-200 dark:focus:border-orange-700">
                        <SelectValue placeholder="Choose length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">⚡ Quick (3-4 sentences)</SelectItem>
                        <SelectItem value="medium">📖 Balanced (6-8 sentences)</SelectItem>
                        <SelectItem value="detailed">🔍 Detailed (10-12 sentences)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                      Processing Engine
                    </Label>
                    <RadioGroup
                      value={provider}
                      onValueChange={(v) => setProvider(v as Provider)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="rapidapi"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-3 sm:p-4 text-sm transition-all hover:bg-muted/50 [&:has(:checked)]:bg-muted",
                          provider === "rapidapi" &&
                            "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30",
                        )}
                      >
                        <RadioGroupItem id="rapidapi" value="rapidapi" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            RapidAPI
                          </div>
                          <div className="text-xs text-muted-foreground">Best for web articles</div>
                        </div>
                      </Label>
                      <Label
                        htmlFor="groq"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-3 sm:p-4 text-sm transition-all hover:bg-muted/50 [&:has(:checked)]:bg-muted",
                          provider === "groq" &&
                            "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30",
                        )}
                      >
                        <RadioGroupItem id="groq" value="groq" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            Groq AI
                          </div>
                          <div className="text-xs text-muted-foreground">Best for custom text</div>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    disabled={!canSubmit || loading}
                    onClick={submit}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>✨ Summarize</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUrl("")
                      setText("")
                      setSummary("")
                    }}
                    className="sm:w-auto"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : summary ? (
                  <>
                    <div className="rounded-lg border bg-gradient-to-br from-orange-50/50 to-orange-100/30 p-4 sm:p-6 dark:from-orange-950/20 dark:to-orange-900/10">
                      <MarkdownRenderer content={summary} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentChatDocument({
                            content: summary,
                            name: "Current Summary",
                          })
                          setActiveTab("chat")
                        }}
                        className="flex-1 bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat with Summary
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("edit")}
                        className="flex-1 bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit & Export
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-sm text-muted-foreground">Your summary will appear here</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">📚 Recent Summaries</h3>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Clear</span>
                      <span className="sm:hidden">Clear</span>
                    </Button>
                  )}
                </div>
                <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  {history.length === 0 && (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-1">🕐</div>
                      <p className="text-xs text-muted-foreground">No summaries yet</p>
                    </div>
                  )}
                  {history.map((h) => (
                    <div key={h.id} className="rounded-md border p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {h.mode === "url" ? "🔗" : h.mode === "text" ? "📝" : "📄"} {h.mode}
                        </Badge>
                        <Badge className="bg-orange-600 text-white hover:bg-orange-700 text-xs">{h.provider}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {h.mode === "url"
                          ? h.url
                          : h.mode === "document"
                            ? h.documentName
                            : h.text?.slice(0, 100) + (h.text && h.text.length > 100 ? "..." : "")}
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-orange-600 dark:text-orange-400 hover:underline">
                          View summary
                        </summary>
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                          <MarkdownRenderer content={h.summary} />
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">📂 Your Documents</h3>
            {persistedDocuments.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearDocuments}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Documents
              </Button>
            )}
          </div>
          <DocumentUpload
            onDocumentProcessed={handleDocumentProcessed}
            onChatWithDocument={chatWithDocument}
            onSummarizeDocument={summarizeDocument}
            onDocumentRemoved={handleDocumentRemoved}
            persistedDocuments={persistedDocuments}
          />
        </TabsContent>

        <TabsContent value="chat" className="h-[calc(100vh-200px)]">
          <DocumentChat
            documentContent={currentChatDocument?.content || summary}
            documentName={currentChatDocument?.name || "Current Summary"}
            summary={summary}
            key={`${currentChatDocument?.name}-${currentChatDocument?.content?.length || 0}`}
          />
        </TabsContent>

        <TabsContent value="edit" className="h-[calc(100vh-200px)]">
          <div className="grid gap-4 lg:grid-cols-2 h-full">
            <SummaryEditor
              initialContent={summary || "No summary to edit yet. Generate a summary first!"}
              onSave={(content) => setSummary(content)}
              documentName="FlashRead Summary"
            />
            <ExportOptions content={summary || ""} filename="flashread-summary" documentName="FlashRead Summary" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
