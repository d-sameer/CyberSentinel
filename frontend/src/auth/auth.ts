
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

export interface UserProfile {
  id: number
  username: string
  email: string
  role: 'Admin' | 'Analyst' | 'Viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid username or password.')
    }

    throw new Error(`Login failed (${response.status}). Please try again.`)
  }

  return response.json() as Promise<LoginResponse>
}

export async function fetchCurrentUser(
  token: string,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Your session is invalid or has expired.')
  }

  return response.json() as Promise<UserProfile>
}
