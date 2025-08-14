import type { NextRequest } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

type Body = {
  content: string
  documentName?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { content, documentName } = body
    const groqKey = req.headers.get("x-groq-key") || ""

    if (!groqKey) {
      return Response.json({ error: "Missing Groq API key" }, { status: 400 })
    }

    if (!content.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 })
    }

    const groq = createGroq({ apiKey: groqKey })

    const systemPrompt = `You are FlashRead AI, an expert content enhancer. Your task is to improve summaries by:

1. Making them more readable and well-structured
2. Adding better markdown formatting (headers, bullets, emphasis)
3. Improving clarity and flow
4. Ensuring key points are highlighted
5. Adding logical organization and sections
6. Maintaining the original meaning and key information

Guidelines:
- Use proper markdown formatting (##, **, -, etc.)
- Create clear sections with descriptive headers
- Use bullet points for lists and key points
- Emphasize important terms with **bold** or *italic*
- Ensure smooth transitions between sections
- Keep the same level of detail but improve presentation
- Make it scannable and easy to read`

    const prompt = `Please enhance this summary${documentName ? ` for "${documentName}"` : ""}:

${content}

Make it more readable, well-structured, and visually appealing while preserving all the key information.`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      prompt,
      temperature: 0.2,
    })

    return Response.json({ enhanced: text })
  } catch (error: any) {
    console.error("Enhance summary API error:", error)
    return Response.json({ error: error?.message || "Failed to enhance summary" }, { status: 500 })
  }
}
