"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, AlertCircle } from "lucide-react"

interface ImportDialogProps {
  onClose: () => void
  onImport: (attendees: any[]) => void
}

export function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError("")
      parseFile(selectedFile)
    }
  }

  const parseFile = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setError("El archivo debe contener al menos un encabezado y una fila de datos")
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const nameIndex = headers.findIndex((h) => h.includes("nombre") || h.includes("name"))
      const emailIndex = headers.findIndex((h) => h.includes("correo") || h.includes("email"))

      if (nameIndex === -1 || emailIndex === -1) {
        setError("El archivo debe contener columnas 'Nombre' y 'Correo'")
        return
      }

      const newAttendees = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line, idx) => {
          const fields = line.split(",")
          return {
            id: Date.now() + idx,
            name: fields[nameIndex]?.trim() || "",
            email: fields[emailIndex]?.trim() || "",
            status: "absent" as const,
            type: "presencial",
          }
        })
        .filter((a) => a.name && a.email)

      if (newAttendees.length === 0) {
        setError("No se encontraron registros válidos en el archivo")
        return
      }

      setPreview(newAttendees.slice(0, 5))
    } catch (err) {
      setError("Error al procesar el archivo. Asegúrate de que sea un CSV válido.")
    }
  }

  const handleImport = () => {
    if (!file || preview.length === 0) return

    const text = file.textContent || ""
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const nameIndex = headers.findIndex((h) => h.includes("nombre") || h.includes("name"))
    const emailIndex = headers.findIndex((h) => h.includes("correo") || h.includes("email"))

    const newAttendees = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line, idx) => {
        const fields = line.split(",")
        return {
          id: Date.now() + idx,
          name: fields[nameIndex]?.trim() || "",
          email: fields[emailIndex]?.trim() || "",
          status: "absent" as const,
          type: "presencial",
        }
      })
      .filter((a) => a.name && a.email)

    onImport(newAttendees)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Asistentes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-orange-500">Selecciona un archivo CSV</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            {file && <p className="text-sm text-muted-foreground mt-2">{file.name}</p>}
            <p className="text-xs text-muted-foreground mt-3">
              Formato esperado: Nombre, Correo (las columnas pueden estar en cualquier orden)
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Vista previa ({preview.length} registros):</p>
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Nombre</th>
                      <th className="px-3 py-2 text-left">Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((a) => (
                      <tr key={a.id} className="border-t">
                        <td className="px-3 py-2">{a.name}</td>
                        <td className="px-3 py-2">{a.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || preview.length === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Importar {preview.length > 0 && `(${preview.length} registros)`}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
