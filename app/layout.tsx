import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Roboto_Mono } from "next/font/google"

const GeistSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const GeistMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" })
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { ThemeProvider } from "next-themes"

export const metadata: Metadata = {
  title: "flahread",
  description: "Use AI to summarize your favorite websites and texts.",
  //generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        style={{ fontFamily: GeistSans.style.fontFamily }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
