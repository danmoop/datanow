const API_BASE = "http://localhost:3000"

export interface AuthResponse {
  token: string
}

export interface FileUpload {
  _id: string
  filename: string
  fileType: string
  storageKey: string
  fileSizeBytes: number
  uploadedAt: string
  status: "processing" | "ready" | "failed"
}

export interface UserResponse {
  _id: string
  email: string
  name?: string
  isPremium: boolean
  fileUploads: FileUpload[]
  createdAt: string
}

export const authApi = {
  register: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Registration failed")
    return data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Login failed")
    return data
  },

  getMe: async (token: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch user")
    return response.json()
  },
}

export const paymentApi = {
  initiate: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/auth/nonce`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Failed to initiate payment")
    }

    const originURL = location.href
    location.href = `http://127.0.0.1:1402/auth/buyPremium?nonce=${data.nonce}&originURL=${originURL}`
  },
}

export const uploadApi = {
  upload: async (file: File, token: string): Promise<{ uploadId: string }> => {
    const form = new FormData()
    form.append("file", file)
    const response = await fetch(`${API_BASE}/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Upload failed")
    return data
  },

  download: async (storageKey: string, token: string): Promise<Blob> => {
    const response = await fetch(
      `${API_BASE}/files/download?key=${encodeURIComponent(storageKey)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error("Download failed")
    return response.blob()
  },

  delete: async (storageKey: string, token: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/files?key=${encodeURIComponent(storageKey)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error("Delete failed")
  },
}
