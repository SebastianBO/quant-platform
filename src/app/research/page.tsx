import { Metadata } from "next"
import AutonomousChat from "@/components/AutonomousChat"

export const metadata: Metadata = {
  title: "AI Research Agent | Lician",
  description: "Autonomous financial research agent that plans, executes, and synthesizes comprehensive stock analysis",
}

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <AutonomousChat />
    </main>
  )
}
