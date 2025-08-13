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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link2, FileText, Zap, History, Lightbulb, Sparkles } from "lucide-react"

type Props = React.PropsWithChildren<{}>

export default function HelpDialog({ children }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            How FlashRead Works
          </DialogTitle>
          <DialogDescription>Get the most out of FlashRead with these tips and tricks</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-orange-100/70 dark:border-orange-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                  URL Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Perfect for blog posts, news articles, and web content</p>
                <Badge variant="secondary" className="text-xs">
                  Automatically extracts content
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-orange-100/70 dark:border-orange-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                  Text Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Paste any text, documents, or notes for instant summaries
                </p>
                <Badge variant="secondary" className="text-xs">
                  Works with any text
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              Pro Tips
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Choose your summary length</p>
                  <p className="text-xs text-muted-foreground">
                    Short for quick overviews, detailed for comprehensive analysis
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Try different providers</p>
                  <p className="text-xs text-muted-foreground">
                    RapidAPI for web articles, Groq for custom text analysis
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Access your history</p>
                  <p className="text-xs text-muted-foreground">All summaries are saved locally for easy reference</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              Best Results
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 mt-2 flex-shrink-0" />
                <p>Use complete URLs starting with https:// for web articles</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 mt-2 flex-shrink-0" />
                <p>For text mode, paste at least a few sentences for better context</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 mt-2 flex-shrink-0" />
                <p>Copy summaries to clipboard or export as Markdown files</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-orange-200/70 bg-orange-50/50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium">Privacy First</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All your summaries are stored locally in your browser. Nothing is sent to external servers except for
              processing.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
