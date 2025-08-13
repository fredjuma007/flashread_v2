"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, HelpCircle } from "lucide-react"
import ThemeToggle from "./theme-toggle"
import HelpDialog from "./help-dialog"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/FlashRead.png" alt="FlashRead logo" width={24} height={24} />
          <span className="font-semibold">
            <span className="text-orange-600 dark:text-orange-500">Flash</span>Read
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="#summarizer">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Summarize
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            aria-label="GitHub"
            rel="noreferrer"
          >
            <Github className="h-4 w-4" />
          </a>
          <HelpDialog>
            <Button variant="outline" className="border-orange-200/70 dark:border-orange-900/40 bg-transparent">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
          </HelpDialog>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
