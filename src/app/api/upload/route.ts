import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"
export const maxDuration = 60

// Supported file types
const SUPPORTED_TYPES = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

interface ParsedDocument {
  type: string
  filename: string
  content: string
  metadata: {
    pages?: number
    wordCount: number
    charCount: number
  }
}

async function parsePDF(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    // Dynamic import of pdf-parse v2.x (uses PDFParse class)
    const { PDFParse } = await import("pdf-parse")
    const parser = new PDFParse(buffer)
    await (parser as any).load()
    const result = await (parser as any).getText()

    return {
      text: result.text || `[PDF document - ${Math.round(buffer.length / 1024)}KB, unable to extract text]`,
      pages: result.numpages || 1
    }
  } catch (error) {
    logger.error("PDF parsing error", { error: error instanceof Error ? error.message : "Unknown" })
    // Fallback if pdf-parse fails
    return {
      text: `[PDF document uploaded - ${Math.round(buffer.length / 1024)}KB]\n\nNote: Could not extract text from this PDF. The document may be scanned or image-based. Please describe what you'd like to know about this document.`,
      pages: 1
    }
  }
}

async function parseText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8")
}

async function parseCSV(buffer: Buffer): Promise<string> {
  const text = buffer.toString("utf-8")
  // Convert CSV to readable format with row numbers
  const lines = text.split("\n")
  const formatted = lines.map((line, i) => `Row ${i + 1}: ${line}`).join("\n")
  return formatted
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const filename = file.name

    if (!SUPPORTED_TYPES[fileType as keyof typeof SUPPORTED_TYPES]) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Supported: PDF, TXT, CSV` },
        { status: 400 }
      )
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let content: string
    let pages: number | undefined

    const type = SUPPORTED_TYPES[fileType as keyof typeof SUPPORTED_TYPES]

    switch (type) {
      case "pdf":
        const pdfResult = await parsePDF(buffer)
        content = pdfResult.text
        pages = pdfResult.pages
        break
      case "txt":
        content = await parseText(buffer)
        break
      case "csv":
        content = await parseCSV(buffer)
        break
      default:
        content = await parseText(buffer)
    }

    // Clean up content
    content = content
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n") // Max 2 newlines
      .trim()

    // Limit content length for AI processing (roughly 50k chars = ~12k tokens)
    const maxChars = 50000
    const truncated = content.length > maxChars
    if (truncated) {
      content = content.substring(0, maxChars) + "\n\n[Content truncated due to length...]"
    }

    const result: ParsedDocument = {
      type,
      filename,
      content,
      metadata: {
        pages,
        wordCount: content.split(/\s+/).length,
        charCount: content.length,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Upload error", { error: error instanceof Error ? error.message : "Unknown" })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process file" },
      { status: 500 }
    )
  }
}
