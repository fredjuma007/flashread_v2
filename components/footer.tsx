"use client"

import Image from "next/image"

export default function Footer() {
  return (
    <footer className="border-t py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/images/FlashRead.png"
            alt="FlashRead"
            width={20}
            height={20}
            className="sm:w-[22px] sm:h-[22px]"
          />
          <span className="font-semibold text-sm">FlashRead</span>
        </div>
        <p className="text-xs text-muted-foreground">Developed by Fred Juma</p>
      </div>
    </footer>
  )
}
