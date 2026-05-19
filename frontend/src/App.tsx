import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { AuthPage } from "@/pages/AuthPage"
import { Dashboard } from "@/pages/Dashboard"
import { UploadPage } from "@/pages/UploadPage"
import { AnalyzePage } from "@/pages/AnalyzePage"

function AppContent() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={token ? <Dashboard /> : <AuthPage />} />
      <Route path="/login" element={token ? <Dashboard /> : <AuthPage />} />
      <Route path="/dashboard" element={token ? <Dashboard /> : <AuthPage />} />
      <Route path="/upload" element={token ? <UploadPage /> : <AuthPage />} />
      <Route path="/analyze" element={token ? <AnalyzePage /> : <AuthPage />} />
    </Routes>
  )
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
