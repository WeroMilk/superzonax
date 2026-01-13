export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HttpError {
  status: number
  message: string
  code?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: number
    username: string
    role: 'admin' | 'sec6' | 'sec60' | 'sec72'
    school_name: string
  }
  error?: string
}

export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`HTTP error! status: ${status}`)
    this.name = 'FetchError'
  }
}

export async function handleApiResponse<T = unknown>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: response.statusText }
    }
    
    throw new FetchError(
      response.status,
      response.statusText,
      errorData
    )
  }
  
  return response.json()
}
