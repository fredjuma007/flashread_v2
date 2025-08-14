import type { NextRequest } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

type Body = {
  message: string
  documentContent?: string
  documentName?: string
  chatHistory?: ChatMessage[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { message, documentContent, documentName, chatHistory = [] } = body
    const groqKey = req.headers.get("x-groq-key") || ""

    if (!groqKey) {
      return Response.json({ error: "Missing Groq API key" }, { status: 400 })
    }

    if (!message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    const groq = createGroq({ apiKey: groqKey })

    // Build context from chat history
    const conversationContext = chatHistory
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `You are FlashRead AI, an intelligent assistant that helps users understand and explore documents and summaries. 

You have access to the following document content:
${documentContent ? `Document: "${documentName || "Untitled"}"\nContent: ${documentContent.slice(0, 4000)}...` : "No document content available."}

Previous conversation:
${conversationContext}

Guidelines:
- Be helpful, concise, and accurate
- Reference specific parts of the document when relevant
- If asked about something not in the document, clearly state that
- Use markdown formatting for better readability
- Keep responses focused and actionable
- If the user asks for explanations, break down complex concepts simply`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      prompt: message,
      temperature: 0.3,
    })

    return Response.json({ response: text })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return Response.json({ error: error?.message || "Failed to process chat message" }, { status: 500 })
  }
}
