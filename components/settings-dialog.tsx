"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Info } from "lucide-react"

type Props = React.PropsWithChildren<{}>

const RAPID_KEY = "flashread_rapidapi_key"
const GROQ_KEY = "flashread_groq_key"

export default function SettingsDialog({ children }: Props) {
  const [open, setOpen] = React.useState(false)
  const [rapidKey, setRapidKey] = React.useState("")
  const [groqKey, setGroqKey] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setRapidKey(localStorage.getItem(RAPID_KEY) || "")
      setGroqKey(localStorage.getItem(GROQ_KEY) || "")
    }
  }, [open])

  const save = () => {
    localStorage.setItem(RAPID_KEY, rapidKey.trim())
    localStorage.setItem(GROQ_KEY, groqKey.trim())
    toast.success("API keys stored locally in your browser.")
    setOpen(false)
  }

  const clear = () => {
    localStorage.removeItem(RAPID_KEY)
    localStorage.removeItem(GROQ_KEY)
    setRapidKey("")
    setGroqKey("")
    toast.success("Keys removed from local storage.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Add your API keys to enable summarization. Keys are stored locally in your browser. For production,
            configure server environment variables instead.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="rapid">RapidAPI Key</Label>
            <Input
              id="rapid"
              placeholder="X-RapidAPI-Key"
              value={rapidKey}
              onChange={(e) => setRapidKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for URL extraction via Article Extractor and Summarizer on RapidAPI.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="groq">Groq API Key</Label>
            <Input id="groq" placeholder="GROQ_API_KEY" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} />
            <p className="text-xs text-muted-foreground">Used for AI summaries of pasted text or fallback.</p>
          </div>
          <div className="flex items-start gap-2 rounded-md border border-orange-200/70 bg-orange-50 p-3 text-sm dark:border-orange-900/40 dark:bg-orange-950/30">
            <Info className="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p>
              Warning: Client-stored keys are visible to your browser. Prefer secure server environment variables in
              production.
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={clear}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function getStoredRapidApiKey() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("flashread_rapidapi_key") || ""
}

export function getStoredGroqKey() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("flashread_groq_key") || ""
}
