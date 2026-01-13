// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos para errores HTTP
export interface HttpError {
  status: number
  message: string
  code?: string
}

// Tipos específicos para login
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    username: string
    role: 'admin' | 'sec6' | 'sec60' | 'sec72'
    school_name: string
  }
  error?: string
}

// Tipos para errores de fetch
export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`HTTP error! status: ${status}`)
    this.name = 'FetchError'
  }
}

// Función helper para manejar errores de fetch
export async function handleApiResponse<T = any>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let errorData: any
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
