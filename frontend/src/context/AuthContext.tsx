import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { authApi, type UserResponse } from "./../lib/api"

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
      // Verify token by fetching user
      authApi
        .getMe(storedToken)
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("authToken")
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    const newToken = response.token
    setToken(newToken)
    localStorage.setItem("authToken", newToken)
    const userData = await authApi.getMe(newToken)
    setUser(userData)
  }

  const register = async (email: string, password: string) => {
    await authApi.register(email, password)
    // Auto-login after registration
    await login(email, password)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("authToken")
  }

  const refreshUser = async () => {
    const t = token ?? localStorage.getItem("authToken")
    if (!t) return
    const userData = await authApi.getMe(t)
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
