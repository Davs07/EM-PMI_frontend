"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield } from "lucide-react"

export function UserMenu() {
  const { isAuthenticated, isAdmin, username, logout } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
        <User className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-700">{username}</span>
        {isAdmin && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </Button>
    </div>
  )
}
