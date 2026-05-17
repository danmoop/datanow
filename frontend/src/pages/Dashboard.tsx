import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Crown,
  Upload,
  FileText,
  AlertCircle,
  Download,
  Trash2,
  Sparkles,
} from "lucide-react"
import { uploadApi, paymentApi, type FileUpload } from "@/lib/api"

const StatusBadge = ({ isPremium }: { isPremium: boolean }) => {
  if (isPremium) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-400">
        <Crown className="h-4 w-4" />
        Premium
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      Free
    </div>
  )
}

const FileRow = ({ file }: { file: FileUpload }) => {
  const { token, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const handleDownload = async () => {
    if (!token) return
    const blob = await uploadApi.download(file.storageKey, token)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!token) return
    setDeleting(true)
    try {
      await uploadApi.delete(file.storageKey, token)
      await refreshUser()
    } finally {
      setDeleting(false)
    }
  }

  const statusColor = {
    ready: "text-green-600 dark:text-green-400",
    processing: "text-amber-600 dark:text-amber-400",
    failed: "text-red-600 dark:text-red-400",
  }[file.status]

  return (
    <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{file.filename}</p>
          <p className="text-xs text-muted-foreground">
            {(file.fileSizeBytes / 1024).toFixed(1)} KB ·{" "}
            {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium capitalize ${statusColor}`}>
          {file.status}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(
              `/analyze?key=${encodeURIComponent(file.storageKey)}&name=${encodeURIComponent(file.filename)}&type=${file.fileType}`
            )
          }
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const Dashboard = () => {
  const { user, token, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  useEffect(() => {
    refreshUser()
  }, [])

  const handleUpgrade = async () => {
    if (!token) return
    setUpgrading(true)
    setUpgradeError(null)
    try {
      await paymentApi.initiate(token)
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setUpgrading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">DataNow</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {/* User info card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{user?.email}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <StatusBadge isPremium={user?.isPremium ?? false} />
          </div>
          {!user?.isPremium && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Upgrade to Premium</p>
                  <p className="text-xs text-muted-foreground">
                    Unlimited AI analyses · 50MB file limit
                  </p>
                </div>
                <Button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="gap-1.5"
                >
                  <Crown className="h-4 w-4" />
                  {upgrading ? "Redirecting…" : "Upgrade"}
                </Button>
              </div>
              {upgradeError && (
                <p className="mt-2 text-xs text-red-500">{upgradeError}</p>
              )}
            </div>
          )}
        </div>

        {/* Files */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Your Files{" "}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({user?.fileUploads?.length ?? 0})
              </span>
            </h3>
            <Button size="sm" onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-3.5 w-3.5" />
              Upload
            </Button>
          </div>

          <div className="mt-4">
            {!user?.fileUploads?.length ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No files uploaded yet.
                </p>
                <Button variant="outline" onClick={() => navigate("/upload")}>
                  Upload your first file
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {user.fileUploads.map((file) => (
                  <FileRow key={file._id} file={file} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
