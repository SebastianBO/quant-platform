import { Metadata } from "next"
import AutonomousChat from "@/components/AutonomousChat"

export const metadata: Metadata = {
  title: "AI Research Agent | Lician",
  description: "Autonomous financial research agent that plans, executes, and synthesizes comprehensive stock analysis",
}

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Autonomous Research Agent
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask complex financial questions. Our AI agent will autonomously plan research tasks,
            gather data from multiple sources, and synthesize a comprehensive answer.
          </p>
        </div>
        <AutonomousChat />
      </div>
    </main>
  )
}
