"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim()) // Remove empty lines
    const elements: React.ReactNode[] = []
    let currentList: string[] = []

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <div key={`list-${elements.length}`} className="space-y-2 my-4">
            {currentList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>,
        )
        currentList = []
      }
    }

    const isLikelyTitle = (line: string, index: number) => {
      const trimmed = line.trim()
      // Check if it's the first meaningful line and looks like a title
      if (index === 0) {
        return (
          !trimmed.startsWith("*") &&
          !trimmed.startsWith("-") &&
          !trimmed.startsWith("##") &&
          trimmed.length > 5 &&
          trimmed.length < 100 &&
          !trimmed.endsWith(".") &&
          !trimmed.includes(":")
        )
      }
      return false
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      if (!trimmed) {
        flushList()
        return
      }

      // Main heading (# or likely title)
      if (trimmed.startsWith("# ") || isLikelyTitle(trimmed, index)) {
        flushList()
        const title = trimmed.replace(/^# /, "")
        elements.push(
          <div key={`h1-${index}`} className="mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {title}
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mt-2" />
          </div>,
        )
      }
      // Subheadings
      else if (trimmed.startsWith("## ")) {
        flushList()
        const subtitle = trimmed.replace(/^## /, "")
        elements.push(
          <div key={`h2-${index}`} className="mt-6 mb-3">
            <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              {subtitle}
            </h2>
          </div>,
        )
      }
      // Bold text that might be a section header
      else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        flushList()
        const boldText = trimmed.replace(/^\*\*/, "").replace(/\*\*$/, "")
        elements.push(
          <div key={`bold-${index}`} className="mt-4 mb-2">
            <h3 className="text-base font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <div className="w-1 h-3 bg-orange-400 rounded-full" />
              {boldText}
            </h3>
          </div>,
        )
      }
      // List items
      else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const item = trimmed.replace(/^[*-] /, "")
        currentList.push(item)
      }
      // Lines that end with colon (might be section headers)
      else if (trimmed.endsWith(":") && trimmed.length < 50) {
        flushList()
        const headerText = trimmed.replace(/:$/, "")
        elements.push(
          <div key={`colon-header-${index}`} className="mt-4 mb-2">
            <h3 className="text-base font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <div className="w-1 h-3 bg-orange-400 rounded-full" />
              {headerText}
            </h3>
          </div>,
        )
      }
      // Regular paragraph
      else if (trimmed && !trimmed.startsWith("=")) {
        flushList()
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed mb-3 text-muted-foreground">
            {trimmed}
          </p>,
        )
      }
    })

    flushList()
    return elements
  }

  return <div className="space-y-2">{parseMarkdown(content)}</div>
}
