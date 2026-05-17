import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react"

const API_BASE = "http://localhost:3000"

type AnalysisType = "summary" | "trends"

const ACTIONS: Record<
  string,
  { label: string; type: AnalysisType; icon: "sparkles" | "trending" }[]
> = {
  json: [{ label: "Summary", type: "summary", icon: "sparkles" }],
  pdf: [{ label: "Summary", type: "summary", icon: "sparkles" }],
  csv: [{ label: "Trends", type: "trends", icon: "trending" }],
}

const ENDPOINTS: Record<AnalysisType, string> = {
  summary: "/analyze/summary",
  trends: "/analyze/trends",
}

export const AnalyzePage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const storageKey = searchParams.get("key") ?? ""
  const filename = searchParams.get("name") ?? storageKey
  const fileType = (searchParams.get("type") ?? "").toLowerCase()

  const actions = ACTIONS[fileType] ?? []

  const [results, setResults] = useState<Partial<Record<AnalysisType, string>>>(
    {}
  )
  const [loading, setLoading] = useState<AnalysisType | null>(null)
  const [error, setError] = useState("")

  const handleRun = async (analysisType: AnalysisType) => {
    if (!token || !storageKey) return
    setLoading(analysisType)
    setError("")
    try {
      const response = await fetch(
        `${API_BASE}${ENDPOINTS[analysisType]}?key=${encodeURIComponent(storageKey)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Analysis failed")
      setResults((prev) => ({
        ...prev,
        [analysisType]: data.result ?? data.message,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Analyze</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">File</p>
            <p className="mt-1 font-medium">{filename}</p>
          </div>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No analysis options available for this file type.
            </p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              {actions.map(({ label, type, icon }) => (
                <Button
                  key={type}
                  className="w-full"
                  onClick={() => handleRun(type)}
                  disabled={loading !== null}
                >
                  {icon === "trending" ? (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {loading === type ? `Running ${label}…` : label}
                </Button>
              ))}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {(Object.entries(results) as [AnalysisType, string][]).map(
            ([type, text]) => (
              <div
                key={type}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h2 className="mb-3 font-semibold capitalize">{type}</h2>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-2 text-lg font-bold">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-1 text-base font-semibold">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-1 font-semibold">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 text-sm leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 list-disc pl-5 text-sm">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 list-decimal pl-5 text-sm">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-0.5">{children}</li>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        {children}
                      </code>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
