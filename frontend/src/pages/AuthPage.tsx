import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "@/components/LoginForm"
import { SignupForm } from "@/components/SignupForm"

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const handleAuthSuccess = () => {
    navigate("/dashboard")
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">DataNow</h1>
          <p className="mt-2 text-muted-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
