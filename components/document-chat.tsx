"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Send, Bot, User, FileText, Sparkles, Copy, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "./markdown-renderer"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  documentContext?: string
}

interface DocumentChatProps {
  documentContent?: string
  documentName?: string
  summary?: string
  initialMessages?: ChatMessage[]
  onMessagesChange?: (messages: ChatMessage[]) => void
}

export default function DocumentChat({
  documentContent,
  documentName,
  summary,
  initialMessages = [],
  onMessagesChange,
}: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Only add welcome message if we don't have any messages and have content
    if ((documentContent || summary) && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `👋 Hi! I'm ready to help you explore ${documentName ? `"${documentName}"` : "your content"}. You can ask me questions about the document, request explanations, or get deeper insights. What would you like to know?`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [documentContent, summary, documentName]) // Removed messages.length dependency to prevent infinite loop

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages)
    }
  }, [messages, onMessagesChange])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": process.env.NEXT_PUBLIC_GROQ_KEY || "",
        },
        body: JSON.stringify({
          message: input.trim(),
          documentContent: documentContent || summary,
          documentName,
          chatHistory: messages.slice(-10),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        documentContext: documentName,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message")

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success("📋 Message copied to clipboard!")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedQuestions = [
    "What are the main points?",
    "Explain this in simple terms",
    "What are the key takeaways?",
    "Are there any important details I missed?",
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            <h2 className="font-semibold text-lg">Chat with Document</h2>
          </div>
          {documentName && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
            >
              <FileText className="h-3 w-3 mr-1" />
              {documentName}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/20 to-transparent dark:from-orange-950/10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <Bot className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask me anything about your document. I can explain concepts, summarize sections, or answer specific
                questions.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <Bot className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={cn("flex flex-col", message.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 relative group",
                  message.role === "user"
                    ? "bg-orange-600 text-white rounded-br-md"
                    : "bg-white dark:bg-zinc-900 border border-border rounded-bl-md shadow-sm",
                )}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-orange-700 dark:prose-headings:text-orange-400 prose-strong:text-orange-700 dark:prose-strong:text-orange-400">
                    <MarkdownRenderer content={message.content} />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-background/90 hover:bg-background shadow-sm border"
                  onClick={() => copyMessage(message.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>

            {message.role === "user" && (
              <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
              <AvatarFallback className="bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <Bot className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-muted-foreground">FlashRead is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-2 border-t bg-white/50 dark:bg-zinc-950/50">
          <p className="text-xs text-muted-foreground mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="text-xs h-8 bg-white/80 hover:bg-orange-50 border-orange-200/50 dark:bg-zinc-900/80 dark:hover:bg-orange-950/20 dark:border-orange-800/50"
                onClick={() => setInput(question)}
              >
                <Sparkles className="h-3 w-3 mr-1 text-orange-500" />
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the document..."
              disabled={isLoading}
              className="pr-12 py-3 rounded-xl border-orange-200/50 focus:border-orange-400 focus:ring-orange-200 dark:border-orange-800/50 dark:focus:border-orange-600 bg-white/90 dark:bg-zinc-900/90"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {input.length > 0 && `${input.length}/500`}
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          FlashRead AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}
