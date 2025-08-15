import type { NextRequest } from "next/server"
import { Buffer } from "buffer"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name
    let extractedText = ""

    console.log(`Processing file: ${fileName} (${fileType})`)

    // Process supported file types (PDF removed)
    if (fileType === "text/plain" || fileType === "text/markdown") {
      extractedText = await file.text()
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      extractedText = await extractTextFromDocx(file)
    } else if (fileType === "application/msword") {
      extractedText = await extractTextFromDoc(file)
    } else if (fileType === "application/rtf") {
      const text = await file.text()
      extractedText = stripRTF(text)
    } else {
      return Response.json(
        {
          error: "Unsupported file type. Please upload Word (.docx/.doc), TXT, MD, or RTF files.",
        },
        { status: 400 },
      )
    }

    if (!extractedText.trim()) {
      return Response.json({ error: "No text content found in document" }, { status: 400 })
    }

    // Clean up the extracted text
    extractedText = cleanExtractedText(extractedText)

    console.log(`Successfully extracted ${extractedText.length} characters from ${fileName}`)

    return Response.json({
      success: true,
      fileName,
      fileType,
      extractedText: extractedText.slice(0, 100000), // Limit to 100k characters
      wordCount: extractedText.split(/\s+/).filter((word) => word.length > 0).length,
      charCount: extractedText.length,
    })
  } catch (error: any) {
    console.error("Document processing error:", error)
    return Response.json(
      {
        error: error?.message || "Failed to process document",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// DOCX extraction (working perfectly)
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth")
    const mammothLib = mammoth.default || mammoth

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await mammothLib.extractRawText({ buffer: buffer })

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text content found in Word document")
    }

    return result.value
  } catch (error) {
    throw new Error(
      `Failed to extract text from Word document: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// DOC extraction (working)
async function extractTextFromDoc(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()

    try {
      const mammoth = await import("mammoth")
      const mammothLib = mammoth.default || mammoth
      const buffer = Buffer.from(arrayBuffer)

      const result = await mammothLib.extractRawText({ buffer: buffer })

      if (result.value && result.value.trim().length > 0) {
        return result.value
      }
    } catch (mammothError) {
      console.log("Mammoth failed for .doc file")
    }

    throw new Error("Unable to extract text from legacy Word document")
  } catch (error) {
    throw new Error(
      `Failed to extract text from legacy Word document: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// RTF text stripper (working)
function stripRTF(rtfText: string): string {
  return rtfText
    .replace(/\\[a-z]+\d*\s?/g, "")
    .replace(/[{}]/g, "")
    .replace(/\\\\/g, "\\")
    .replace(/\\'/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

// Clean up extracted text
function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/gm, "")
    .trim()
}
