import { tokenUtils } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface FetchOptions {
  method?: HttpMethod
  body?: any
  requiresAuth?: boolean
}

/**
 * Cliente HTTP centralizado con manejo automático de JWT
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, requiresAuth = false } = options

  // Construir headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Agregar token de autenticación si es necesario
  // Para métodos que modifican datos (POST, PUT, DELETE, PATCH) siempre se requiere auth
  const methodsRequiringAuth = ["POST", "PUT", "DELETE", "PATCH"]
  const needsAuth = requiresAuth || methodsRequiringAuth.includes(method)

  if (needsAuth) {
    const token = tokenUtils.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  // Construir URL completa
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Manejar errores de autenticación
    if (response.status === 401) {
      // Token inválido o expirado
      tokenUtils.removeToken()
      
      // Disparar evento para que el contexto de auth lo maneje
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"))
      }
      
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para realizar esta acción.")
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Error ${response.status}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    // Si la respuesta está vacía (ej: DELETE exitoso)
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T
    }

    return await response.json()
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error)
    throw error
  }
}

/**
 * Métodos de conveniencia
 */
export const api = {
  get: <T>(endpoint: string, requiresAuth = false) =>
    apiClient<T>(endpoint, { method: "GET", requiresAuth }),

  post: <T>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
}
