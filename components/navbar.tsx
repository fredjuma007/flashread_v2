"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, HelpCircle, Menu } from "lucide-react"
import ThemeToggle from "./theme-toggle"
import HelpDialog from "./help-dialog"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/FlashRead.png" alt="FlashRead logo" width={24} height={24} />
          <span className="font-semibold">
            <span className="text-orange-600 dark:text-orange-500">Flash</span>Read
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="#summarizer">
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 shadow-md border-none"
            >
              Summarize
            </Button>
          </Link>
          <a
            href="https://github.com/fredjuma007"
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access FlashRead navigation options</SheetDescription>
                </VisuallyHidden>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link href="#summarizer" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Summarize
                  </Button>
                </Link>
                <a
                  href="https://github.com/fredjuma007"
                  target="_blank"
                  className="inline-flex h-10 items-center justify-start rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                  rel="noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
                <HelpDialog>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-orange-200/70 dark:border-orange-900/40 bg-transparent"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </Button>
                </HelpDialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
