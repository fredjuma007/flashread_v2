import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpenText, Zap, ShieldCheck, History, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Summarizer from "@/components/summarizer"
import Navbar from "@/components/navbar"
import HeroDemo from "@/components/hero-demo"

export default function Page() {
  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_50%_at_50%_0%,rgba(249,115,22,0.20)_0%,rgba(249,115,22,0.06)_40%,transparent_70%)] dark:bg-[radial-gradient(75%_50%_at_50%_0%,rgba(249,115,22,0.25)_0%,rgba(249,115,22,0.08)_40%,transparent_70%)]"
        />
        <div className="container relative mx-auto px-4 pt-12 md:pt-16 lg:pt-20">
          <div className="flex flex-col-reverse items-center gap-10 lg:grid lg:grid-cols-2">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-sm text-orange-700 dark:border-orange-900/40 dark:bg-orange-950/40 dark:text-orange-300">
                <Sparkles className="h-4 w-4" />
                Built for speed — summarize in seconds
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-orange-600 dark:text-orange-500">FlashRead</span> — Read faster. Understand more.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Paste a URL or drop in your text. Get clean, focused summaries that highlight the key points, making it
                easier to grasp the essence of any content quickly.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#summarizer">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Start summarizing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link
                  href="https://flashread.netlify.app/"
                  target="_blank"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Inspiration
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card className="border-orange-100/70 dark:border-orange-900/40">
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <Zap className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <div className="text-sm font-medium">Rapid</div>
                  </CardContent>
                </Card>
                <Card className="border-orange-100/70 dark:border-orange-900/40">
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <BookOpenText className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <div className="text-sm font-medium">Clean summaries</div>
                  </CardContent>
                </Card>
                <Card className="border-orange-100/70 dark:border-orange-900/40">
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <History className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <div className="text-sm font-medium">Local history</div>
                  </CardContent>
                </Card>
                <Card className="border-orange-100/70 dark:border-orange-900/40">
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <div className="text-sm font-medium">Privacy-first</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="relative w-full">
              <HeroDemo />
            </div>
          </div>
          <Separator className="mt-12 bg-orange-200/60 dark:bg-orange-900/40" />
        </div>
      </section>

      <section id="summarizer" className="container mx-auto px-4 py-10 md:py-14">
        <Summarizer defaultProvider="rapidapi" />
      </section>

      <footer className="mt-auto border-t py-3 fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/FlashRead.png" alt="FlashRead" width={22} height={22} />
            <span className="font-semibold text-sm">FlashRead</span>
          </div>
          <p className="text-xs text-muted-foreground">Developed by Fred Juma</p>
        </div>
      </footer>
    </main>
  )
}
