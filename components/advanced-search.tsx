"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AdvancedSearchProps {
  onSearch: (searchTerm: string, searchField: string) => void
  onClear: () => void
}

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("nombre")

  const handleSearch = () => {
    onSearch(searchTerm, searchField)
  }

  const handleClear = () => {
    setSearchTerm("")
    setSearchField("nombre")
    onClear()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Campo de Búsqueda</label>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="nombre">Nombre y Apellidos</option>
            <option value="dni">DNI</option>
            <option value="email">Correo Electrónico</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Término de Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ingrese el término..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={handleClear} variant="outline" className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
