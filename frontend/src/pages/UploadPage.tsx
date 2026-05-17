import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { uploadApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, FileText } from "lucide-react"

const ACCEPTED = [".csv", ".pdf", ".json"]

export const UploadPage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const ext = "." + selected.name.split(".").pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError("Only CSV, PDF, and JSON files are supported.")
      setFile(null)
      return
    }
    setError("")
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file || !token) return
    setIsUploading(true)
    setError("")
    try {
      await uploadApi.upload(file, token)
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
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
          <h1 className="text-2xl font-bold">Upload File</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Supported formats: CSV, PDF, JSON. Free tier limit: 5 MB.
          </p>

          {/* Drop zone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-12 transition-colors hover:border-primary hover:bg-muted/40"
          >
            {file ? (
              <>
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Click to change
                </span>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Click to select a file</p>
                  <p className="text-sm text-muted-foreground">
                    CSV, PDF, or JSON
                  </p>
                </div>
              </>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            className="mt-6 w-full"
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  )
}
