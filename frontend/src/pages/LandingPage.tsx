import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileText, Brain, Zap, Shield, Database, Cpu } from "lucide-react"

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: "smooth" })
  }
}

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DataNow</span>
          </div>
          <nav className="hidden items-center space-x-6 md:flex">
            <button
              onClick={() => scrollToSection("features")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("architecture")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection("tech")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Tech Stack
            </button>
          </nav>
          <Link to="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl dark:from-slate-100 dark:to-slate-400">
            Agentic Data Intelligence Platform
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
            Upload raw data and interact with it through natural language. Our
            multi-agent AI platform decomposes queries into sub-tasks and
            dispatches them to specialist agents for intelligent analysis.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Analyzing Data
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Powerful AI-Powered Features
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Built for scalability with cutting-edge AI agents that work together
            to provide intelligent data insights.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <FileText className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Multi-Format Upload</h3>
            <p className="text-muted-foreground">
              Upload CSV, PDF, and JSON files for AI-assisted analysis with
              automatic ingestion and chunking.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <Brain className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">
              Natural Language Queries
            </h3>
            <p className="text-muted-foreground">
              Ask questions in plain English. Our RAG system retrieves relevant
              information and provides accurate answers.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <Zap className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">
              Multi-Agent Orchestration
            </h3>
            <p className="text-muted-foreground">
              Planner agent decomposes queries into sub-tasks, dispatching to
              specialist agents in parallel for optimal performance.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <Shield className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">
              Tiered Access Control
            </h3>
            <p className="text-muted-foreground">
              Free tier with basic features, or upgrade to unlimited access with
              Solana-based payments via pay.sh.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <Database className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Vector Search</h3>
            <p className="text-muted-foreground">
              Semantic search over document chunks using Qdrant vector store for
              lightning-fast, accurate retrieval.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-lg">
            <Cpu className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Local LLM Inference</h3>
            <p className="text-muted-foreground">
              Powered by Ollama with Gemma 4 model for privacy-preserving, local
              AI inference with enterprise-grade performance.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Intelligent Agent Architecture
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Our multi-agent system works together to provide comprehensive
              data intelligence.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-border/50 bg-card p-8">
              <div className="mb-8 text-center">
                <h3 className="mb-2 text-2xl font-semibold">How It Works</h3>
                <p className="text-muted-foreground">
                  Queries flow through a sophisticated pipeline of specialized
                  AI agents
                </p>
              </div>

              <div className="grid gap-8 text-sm md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">User Query</h4>
                      <p className="text-muted-foreground">
                        Natural language question about uploaded data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Planner Agent</h4>
                      <p className="text-muted-foreground">
                        Decomposes query into specialized sub-tasks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Parallel Execution</h4>
                      <p className="text-muted-foreground">
                        Specialist agents work simultaneously
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Specialist Agents</h4>
                      <p className="text-muted-foreground">
                        Classifier, Summarizer, Anomaly Detector, Q&A
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Result Aggregation</h4>
                      <p className="text-muted-foreground">
                        Intelligent merging of agent outputs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      6
                    </div>
                    <div>
                      <h4 className="font-semibold">Cached Response</h4>
                      <p className="text-muted-foreground">
                        Results stored in Redis for fast retrieval
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Production-Grade Tech Stack
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Built with modern technologies designed for scale and reliability.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Bun", desc: "Runtime" },
            { name: "Hono", desc: "API Framework" },
            { name: "TypeScript", desc: "Language" },
            { name: "Ollama (Gemma 4)", desc: "LLM Inference" },
            { name: "Qdrant", desc: "Vector Store" },
            { name: "MongoDB", desc: "Database" },
            { name: "Redis", desc: "Cache/Rate Limiter" },
            { name: "Solana (pay.sh)", desc: "Payments" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="rounded-lg border border-border/50 bg-card p-6 text-center transition-shadow hover:shadow-md"
            >
              <h3 className="mb-1 text-lg font-semibold">{tech.name}</h3>
              <p className="text-sm text-muted-foreground">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Transform Your Data?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join thousands of users who are already using DataNow to unlock
            insights from their data with AI-powered intelligence.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DataNow</span>
          </div>
          <p className="text-muted-foreground">
            Agentic Data Intelligence Platform — Built for the future of
            AI-powered data analysis.
          </p>
        </div>
      </footer>
    </div>
  )
}
