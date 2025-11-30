"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { authService, tokenUtils, AuthLoginRequest, AuthCreateUserRequest } from "@/services/auth-service"

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  isGuest: boolean
  username: string | null
  isLoading: boolean
  login: (credentials: AuthLoginRequest) => Promise<void>
  register: (userData: AuthCreateUserRequest) => Promise<void>
  enterAsGuest: () => void
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const GUEST_KEY = "pmi_guest_mode"

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Verifica el estado de autenticación
   */
  const checkAuth = useCallback(() => {
    // Verificar si está en modo invitado
    const guestMode = typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "true"
    if (guestMode) {
      setIsGuest(true)
      setIsAuthenticated(true)
      setUsername("Invitado")
      setIsAdmin(false)
      setIsLoading(false)
      return
    }
    
    const authenticated = authService.isAuthenticated()
    setIsAuthenticated(authenticated)
    
    if (authenticated) {
      setUsername(authService.getCurrentUser())
      setIsAdmin(authService.isAdmin())
      setIsGuest(false)
    } else {
      setUsername(null)
      setIsAdmin(false)
      setIsGuest(false)
    }
    
    setIsLoading(false)
  }, [])

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (credentials: AuthLoginRequest) => {
    const response = await authService.login(credentials)
    setIsAuthenticated(true)
    setUsername(response.username)
    setIsAdmin(tokenUtils.isAdmin())
  }, [])

  /**
   * Registrar usuario
   */
  const register = useCallback(async (userData: AuthCreateUserRequest) => {
    const response = await authService.register(userData)
    setIsAuthenticated(true)
    setUsername(response.username)
    setIsAdmin(tokenUtils.isAdmin())
    setIsGuest(false)
  }, [])

  /**
   * Entrar como invitado (solo lectura)
   */
  const enterAsGuest = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(GUEST_KEY, "true")
    }
    setIsAuthenticated(true)
    setIsGuest(true)
    setIsAdmin(false)
    setUsername("Invitado")
  }, [])

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    authService.logout()
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_KEY)
    }
    setIsAuthenticated(false)
    setUsername(null)
    setIsAdmin(false)
    setIsGuest(false)
  }, [])

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Escuchar evento de sesión expirada
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
    }
  }, [logout])

  const value: AuthContextType = {
    isAuthenticated,
    isAdmin,
    isGuest,
    username,
    isLoading,
    login,
    register,
    enterAsGuest,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
