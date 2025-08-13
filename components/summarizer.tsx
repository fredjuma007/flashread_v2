"use client"
import { useState, useEffect, useMemo } from "react"
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
import { Copy, Download, Loader2, Trash2, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import MarkdownRenderer from "./markdown-renderer"

type Provider = "rapidapi" | "groq"
type Length = "short" | "medium" | "detailed"

interface HistoryItem {
  id: string
  mode: "url" | "text"
  url?: string
  text?: string
  provider: Provider
  length: Length
  summary: string
  createdAt: number
}

const LS_HISTORY = "flashread_history"

export default function Summarizer({ defaultProvider = "rapidapi" as Provider }) {
  const [mode, setMode] = useState<"url" | "text">("url")
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [provider, setProvider] = useState<Provider>(defaultProvider)
  const [length, setLength] = useState<Length>("medium")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_HISTORY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

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

  const copySummary = async () => {
    if (!summary) return
    await navigator.clipboard.writeText(summary)
    toast.success("📋 Copied to clipboard!")
  }

  const downloadMd = () => {
    if (!summary) return
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "flashread-summary.md"
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success("📄 Downloaded as Markdown!")
  }

  const clearHistory = () => {
    localStorage.removeItem(LS_HISTORY)
    setHistory([])
    toast.success("🗑️ History cleared!")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-orange-200/70 dark:border-orange-900/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Summarize Content</span>
            <Badge className="bg-orange-600 text-white hover:bg-orange-700">Free</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="focus:border-orange-300 focus:ring-orange-200 dark:focus:border-orange-700"
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
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="rapidapi"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-all hover:bg-muted/50 [&:has(:checked)]:bg-muted",
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
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-all hover:bg-muted/50 [&:has(:checked)]:bg-muted",
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

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canSubmit || loading}
              onClick={submit}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none"
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
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Summary</CardTitle>
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
              <div className="rounded-lg border bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 p-6">
                <MarkdownRenderer content={summary} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copySummary} className="flex-1 sm:flex-none bg-transparent">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={downloadMd} className="flex-1 sm:flex-none bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
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
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
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
                    {h.mode === "url" ? "🔗" : "📝"} {h.mode}
                  </Badge>
                  <Badge className="bg-orange-600 text-white hover:bg-orange-700 text-xs">{h.provider}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {h.mode === "url" ? h.url : h.text?.slice(0, 100) + (h.text && h.text.length > 100 ? "..." : "")}
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
  )
}
