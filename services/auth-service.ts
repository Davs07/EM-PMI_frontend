const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * Interfaces para autenticación
 */
export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthCreateUserRequest {
  username: string
  password: string
  roleRequest: {
    roleListName: string[]
  }
}

export interface AuthResponse {
  username: string
  message: string
  jwt: string
  status: boolean
}

export interface DecodedToken {
  sub: string // username
  authorities: string[] // roles y permisos
  exp: number // timestamp de expiración
  iat: number // timestamp de creación
}

/**
 * Utilidades para manejo del token
 */
const TOKEN_KEY = "pmi_auth_token"
const USER_KEY = "pmi_auth_user"

export const tokenUtils = {
  /**
   * Guarda el token en localStorage
   */
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },

  /**
   * Obtiene el token de localStorage
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  /**
   * Elimina el token de localStorage
   */
  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  /**
   * Guarda la información del usuario
   */
  setUser(username: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, username)
    }
  },

  /**
   * Obtiene el nombre de usuario
   */
  getUser(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_KEY)
    }
    return null
  },

  /**
   * Decodifica el payload del JWT (sin verificar firma)
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split(".")[1]
      const decoded = JSON.parse(atob(payload))
      return decoded
    } catch {
      return null
    }
  },

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return true
    
    // exp está en segundos, Date.now() en milisegundos
    const expirationTime = decoded.exp * 1000
    return Date.now() >= expirationTime
  },

  /**
   * Verifica si el usuario tiene rol de ADMIN
   */
  isAdmin(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    const decoded = this.decodeToken(token)
    if (!decoded) return false
    
    return decoded.authorities?.includes("ROLE_ADMIN") || false
  },

  /**
   * Obtiene las autoridades/roles del usuario
   */
  getAuthorities(): string[] {
    const token = this.getToken()
    if (!token) return []
    
    const decoded = this.decodeToken(token)
    return decoded?.authorities || []
  },
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Inicia sesión con username y password
   */
  async login(credentials: AuthLoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/log-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Error al iniciar sesión"
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          if (response.status === 401) {
            errorMessage = "Usuario o contraseña incorrectos"
          } else if (response.status === 403) {
            errorMessage = "Acceso denegado"
          }
        }
        
        throw new Error(errorMessage)
      }

      const data: AuthResponse = await response.json()
      
      // Guardar token y usuario
      tokenUtils.setToken(data.jwt)
      tokenUtils.setUser(data.username)
      
      return data
    } catch (error) {
      console.error("Error en login:", error)
      throw error
    }
  },

  /**
   * Registra un nuevo usuario
   */
  async register(userData: AuthCreateUserRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Error al registrar usuario"
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          // Usar mensaje genérico
        }
        
        throw new Error(errorMessage)
      }

      const data: AuthResponse = await response.json()
      
      // Guardar token y usuario automáticamente después del registro
      tokenUtils.setToken(data.jwt)
      tokenUtils.setUser(data.username)
      
      return data
    } catch (error) {
      console.error("Error en registro:", error)
      throw error
    }
  },

  /**
   * Cierra sesión
   */
  logout(): void {
    tokenUtils.removeToken()
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = tokenUtils.getToken()
    if (!token) return false
    return !tokenUtils.isTokenExpired(token)
  },

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): string | null {
    return tokenUtils.getUser()
  },

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    return tokenUtils.isAdmin()
  },
}
