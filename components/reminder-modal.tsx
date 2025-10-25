"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload } from "lucide-react"

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (data: ReminderData) => void
}

interface ReminderData {
  subject: string
  message: string
  pdfs: File[]
}

export function ReminderModal({ isOpen, onClose, onSend }: ReminderModalProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [pdfs, setPdfs] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter((file) => file.type === "application/pdf")

    if (pdfFiles.length !== files.length) {
      alert("Solo se permiten archivos PDF")
    }

    setPdfs((prev) => [...prev, ...pdfFiles])
  }

  const removeFile = (index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      alert("Por favor ingresa un encabezado")
      return
    }
    if (!message.trim()) {
      alert("Por favor ingresa un mensaje")
      return
    }

    setIsLoading(true)
    try {
      onSend({
        subject,
        message,
        pdfs,
      })

      // Reset form
      setSubject("")
      setMessage("")
      setPdfs([])
      onClose()
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Error al enviar el recordatorio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-600">Crear Recordatorio</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subject Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Encabezado</label>
            <Input
              placeholder="Ej: Recordatorio de asistencia al evento"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-gray-300"
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mensaje</label>
            <Textarea
              placeholder="Ingresa el contenido del recordatorio que deseas enviar por correo electrónico..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="border-gray-300 resize-none"
            />
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Adjuntar PDFs</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-orange-500" />
                <span className="text-sm text-gray-600">Haz clic para seleccionar PDFs o arrastra archivos aquí</span>
              </label>
            </div>

            {/* Uploaded Files List */}
            {pdfs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Archivos adjuntos ({pdfs.length})</p>
                <div className="space-y-2">
                  {pdfs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {isLoading ? "Enviando..." : "Enviar Recordatorio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
