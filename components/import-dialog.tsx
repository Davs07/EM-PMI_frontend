"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

interface ImportDialogProps {
  onClose: () => void
  onImport: (attendees: any[]) => void
  eventId: string
}

export function ImportDialog({ onClose, onImport, eventId }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validar que sea un archivo Excel
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel" // .xls
      ]
      
      if (!validTypes.includes(selectedFile.type)) {
        setError("Por favor selecciona un archivo Excel válido (.xlsx o .xls)")
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError("")
      setSuccess("")
    }
  }

  const handleImport = async () => {
    if (!file || !eventId) {
      setError("Debe seleccionar un archivo y tener un evento válido")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccess("")

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("archivo", file)
      formData.append("eventoId", eventId)

      // Enviar al backend
      const response = await fetch(`${API_BASE_URL}/test/cargar-archivo`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al procesar el archivo")
      }

      // Mostrar mensaje de éxito
      setSuccess(data.message || "Archivo procesado correctamente")
      
      // Esperar 1.5 segundos para mostrar el mensaje y luego cerrar
      setTimeout(() => {
        onImport([]) // Llamar a onImport para refrescar la lista
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error("Error al importar archivo:", err)
      setError(err.message || "Error al procesar el archivo. Verifica que el formato sea correcto.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Participantes desde Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-orange-500">Selecciona un archivo Excel</span>
              <input 
                type="file" 
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                onChange={handleFileChange} 
                className="hidden"
                disabled={isUploading}
              />
            </label>
            {file && <p className="text-sm text-muted-foreground mt-2">{file.name}</p>}
            <p className="text-xs text-muted-foreground mt-3">
              Formato esperado: Archivo Excel (.xlsx o .xls) con las columnas:
            </p>
            <div className="text-xs text-muted-foreground mt-2 text-left inline-block">
              <ul className="list-disc list-inside space-y-1">
                <li>Nombres</li>
                <li>Apellido Paterno</li>
                <li>Apellido Materno</li>
                <li>DNI</li>
                <li>Email (obligatorio)</li>
                <li>Número de WhatsApp</li>
                <li>Ciudad</li>
                <li>Rol (Soy...)</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>Importar Archivo</>
              )}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1 bg-transparent"
              disabled={isUploading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
