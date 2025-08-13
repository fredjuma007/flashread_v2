"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight, Zap, FileText } from "lucide-react"
import MarkdownRenderer from "./markdown-renderer"

const demoSteps = [
  {
    step: 1,
    title: "Paste your content",
    description: "URL or text",
    input: "https://techcrunch.com/ai-breakthrough-2024",
    active: true,
  },
  {
    step: 2,
    title: "AI processes",
    description: "Smart extraction",
    active: false,
  },
  {
    step: 3,
    title: "Get summary",
    description: "Clean & focused",
    active: false,
  },
]

const sampleSummary = `# Revolutionary AI Breakthrough in 2024

## Key Highlights

* Scientists achieve 95% accuracy in natural language understanding
* New model processes information 10x faster than previous versions
* Breakthrough enables real-time translation across 100+ languages
* Applications span healthcare, education, and scientific research

## Impact

The advancement represents a significant leap forward in artificial intelligence capabilities, with potential to transform how we interact with technology and process information globally.`

export default function HeroDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true)
        setCurrentStep((prev) => {
          if (prev === 2) {
            setShowSummary(true)
            setTimeout(() => {
              setShowSummary(false)
              setIsAnimating(false)
            }, 4000)
            return 0
          }
          return prev + 1
        })
        setTimeout(() => {
          if (currentStep < 2) setIsAnimating(false)
        }, 1000)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [currentStep, isAnimating])

  return (
    <div className="relative mx-auto max-w-[520px]">
      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 z-10">
        <div className="flex items-center gap-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
          <Sparkles className="h-3 w-3" />
          Live Demo
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 z-10">
        <div className="flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
          <Zap className="h-3 w-3" />
          AI Powered
        </div>
      </div>

      {/* Main demo card */}
      <Card className="relative overflow-hidden border-orange-200/60 bg-white/90 shadow-2xl backdrop-blur dark:border-orange-900/30 dark:bg-zinc-900/90">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              FlashRead Demo
            </span>
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1}/3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={demoSteps[0].input}
                readOnly
                className="text-xs"
                style={{
                  background: currentStep === 0 ? "rgba(249, 115, 22, 0.1)" : "transparent",
                }}
              />
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white px-3"
                disabled={currentStep !== 0}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-between">
            {demoSteps.map((step, index) => (
              <div key={step.step} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ${
                    index <= currentStep
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {index < currentStep ? "✓" : step.step}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Processing animation */}
          {currentStep === 1 && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-600 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-600 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-600" />
              </div>
            </div>
          )}

          {/* Summary result */}
          {showSummary && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="rounded-lg border bg-gradient-to-br from-orange-50/50 to-orange-100/30 p-4 dark:from-orange-950/20 dark:to-orange-900/10">
                <div className="max-h-48 overflow-y-auto">
                  <MarkdownRenderer content={sampleSummary} />
                </div>
              </div>
            </div>
          )}

          {/* Call to action */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">✨ Try it yourself with any URL or text below</p>
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-100/20 to-orange-200/20 blur-3xl dark:from-orange-900/10 dark:to-orange-800/10" />
    </div>
  )
}
