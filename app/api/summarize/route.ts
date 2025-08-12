import { NextRequest } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

type Body = {
  mode: "url" | "text"
  url?: string
  text?: string
  provider?: "rapidapi" | "groq"
  length?: "short" | "medium" | "detailed"
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { mode, url, text, provider = "rapidapi", length = "medium" } = body
    const rapidKey = req.headers.get("x-rapidapi-key") || ""
    const groqKey = req.headers.get("x-groq-key") || ""

    if (mode === "url") {
      if (!url) return Response.json({ error: "Missing URL" }, { status: 400 })
      if (provider === "groq") {
        if (!groqKey) return Response.json({ error: "Missing Groq key" }, { status: 400 })
        const html = await fetch(url, { redirect: "follow" }).then(async (r) => {
          if (!r.ok) throw new Error(`Failed to fetch URL: ${r.status}`)
          return await r.text()
        })
        const textContent = htmlToText(html).slice(0, 28000) // keep request small-ish
        const { text: out } = await generateText({
          model: groq({ apiKey: groqKey })("llama-3.1-70b-versatile"),
          system:
            "You are FlashRead, an expert summarizer. Produce concise, well-structured Markdown with headings and bullet points. Avoid fluff.",
          prompt: buildPrompt({ mode, length, text: textContent, url }),
          maxTokens: 1200,
          temperature: 0.2,
        })
        return Response.json({ summary: out, provider: "groq" })
      } else {
        if (!rapidKey) return Response.json({ error: "Missing RapidAPI key" }, { status: 400 })
        const sentences = length === "short" ? 3 : length === "detailed" ? 8 : 5
        // RapidAPI: Article Extractor and Summarizer
        const endpoint =
          "https://article-extractor-and-summarizer.p.rapidapi.com/summarize?autoparse=true&url=" +
          encodeURIComponent(url) +
          `&length=${sentences}`
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": rapidKey,
            "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
          },
        })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) {
          // Optional fallback to Groq if available
          if (groqKey) {
            const html = await fetch(url, { redirect: "follow" }).then(async (r) => {
              if (!r.ok) throw new Error(`Failed to fetch URL: ${r.status}`)
              return await r.text()
            })
            const textContent = htmlToText(html).slice(0, 28000)
            const { text: out } = await generateText({
              model: groq({ apiKey: groqKey })("llama-3.1-70b-versatile"),
              system:
                "You are FlashRead, an expert summarizer. Produce concise, well-structured Markdown with headings and bullet points. Avoid fluff.",
              prompt: buildPrompt({ mode, length, text: textContent, url }),
              maxTokens: 1200,
              temperature: 0.2,
            })
            return Response.json({ summary: out, provider: "groq" })
          }
          return Response.json({ error: data?.message || "RapidAPI summarization failed" }, { status: res.status || 500 })
        }
        const summary = data?.summary || data?.summary_text || data?.result || ""
        if (!summary) {
          return Response.json({ error: "No summary returned" }, { status: 502 })
        }
        return Response.json({ summary, provider: "rapidapi" })
      }
    } else {
      // mode === "text"
      if (!text) return Response.json({ error: "Missing text" }, { status: 400 })
      if (provider === "rapidapi") {
        // Some RapidAPI endpoints don't support raw text well; prefer Groq for text.
        if (!groqKey) return Response.json({ error: "RapidAPI may not support raw text; provide Groq key or switch to Groq provider." }, { status: 400 })
      }
      if (!groqKey) return Response.json({ error: "Missing Groq key" }, { status: 400 })
      const { text: out } = await generateText({
        model: groq({ apiKey: groqKey })("llama-3.1-70b-versatile"),
        system:
          "You are FlashRead, an expert summarizer. Produce concise, well-structured Markdown with headings and bullet points. Avoid fluff.",
        prompt: buildPrompt({ mode, length, text }),
        maxTokens: 900,
        temperature: 0.2,
      })
      return Response.json({ summary: out, provider: "groq" })
    }
  } catch (e: any) {
    return Response.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}

// Utilities

function buildPrompt(input: {
  mode: "url" | "text"
  length: "short" | "medium" | "detailed"
  text: string
  url?: string
}) {
  const sentences = input.length === "short" ? "3-4" : input.length === "detailed" ? "10-12" : "6-8"
  const source = input.mode === "url" && input.url ? `Source URL: ${input.url}\n` : ""
  return [
    `Summarize the following content in ${sentences} sentences.`,
    "Output Markdown with:",
    "- A short title",
    "- Key bullets",
    "- A brief takeaway",
    "",
    source,
    "Content:",
    input.text,
  ].join("\n")
}

function htmlToText(html: string) {
  // very lightweight tag stripper + newline normalization
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|section|article|header|footer)>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}
