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
import { Copy, Download, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

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
          "x-rapidapi-key": localStorage.getItem("flashread_rapidapi_key") || "",
          "x-groq-key": localStorage.getItem("flashread_groq_key") || "",
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
      toast.success(`Summarized with ${data.provider}`)
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const copySummary = async () => {
    if (!summary) return
    await navigator.clipboard.writeText(summary)
    toast.success("Summary copied to clipboard")
  }

  const downloadMd = () => {
    if (!summary) return
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "flashread-summary.md"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const clearHistory = () => {
    localStorage.removeItem(LS_HISTORY)
    setHistory([])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-orange-200/70 dark:border-orange-900/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Summarize</span>
            <Badge className="bg-orange-600 text-white hover:bg-orange-700">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "url" | "text")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-3">
              <Label htmlFor="url-input">Article URL</Label>
              <Input
                id="url-input"
                placeholder="https://example.com/blog-post"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We’ll use RapidAPI to extract content and produce a clean summary.
              </p>
            </TabsContent>
            <TabsContent value="text" className="space-y-3">
              <Label htmlFor="text-input">Paste your text</Label>
              <Textarea
                id="text-input"
                placeholder="Paste article or notes here..."
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We’ll use Groq for fast, high-quality summaries.</p>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Provider</Label>
              <RadioGroup value={provider} onValueChange={(v) => setProvider(v as Provider)} className="flex gap-3">
                <Label
                  htmlFor="rapidapi"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border p-2 [&:has(:checked)]:bg-muted",
                    provider === "rapidapi" && "border-orange-300 dark:border-orange-700",
                  )}
                >
                  <RadioGroupItem id="rapidapi" value="rapidapi" />
                  RapidAPI
                </Label>
                <Label
                  htmlFor="groq"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border p-2 [&:has(:checked)]:bg-muted",
                    provider === "groq" && "border-orange-300 dark:border-orange-700",
                  )}
                >
                  <RadioGroupItem id="groq" value="groq" />
                  Groq
                </Label>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canSubmit || loading}
              onClick={submit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Summarize"
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
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : summary ? (
            <>
              <article className="prose max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{summary}</pre>
              </article>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copySummary}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={downloadMd}>
                  <Download className="mr-2 h-4 w-4" />
                  Export .md
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Your summary will appear here.</p>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">History</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <ul className="space-y-3">
            {history.length === 0 && <li className="text-sm text-muted-foreground">No summaries yet.</li>}
            {history.map((h) => (
              <li key={h.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {h.mode}
                  </Badge>
                  <Badge className="bg-orange-600 text-white hover:bg-orange-700">{h.provider}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {h.mode === "url" ? h.url : h.text?.slice(0, 140) + (h.text && h.text.length > 140 ? "…" : "")}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm underline">View summary</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{h.summary}</pre>
                </details>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
