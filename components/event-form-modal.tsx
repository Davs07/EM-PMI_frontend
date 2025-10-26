"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Event } from "@/types/event"

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Event) => void
  initialEvent?: Event
}

export function EventFormModal({ isOpen, onClose, onSave, initialEvent }: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>(
    initialEvent || {
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "PRESENCIAL",
      ubicacion: "",
      capacidadMaxima: undefined,
      brindaCertificado: false,
      plantillaImagen: "",
      estadoEvento: "PROGRAMADO",
    },
  )

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          plantillaImagen: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.descripcion || !formData.fechaInicio || !formData.fechaFin) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const eventToSave: Event = {
      id: initialEvent?.id || Date.now().toString(),
      nombre: formData.nombre || "",
      descripcion: formData.descripcion || "",
      fechaInicio: formData.fechaInicio || "",
      fechaFin: formData.fechaFin || "",
      tipo: (formData.tipo as "PRESENCIAL" | "VIRTUAL" | "HIBRIDO") || "PRESENCIAL",
      ubicacion: formData.ubicacion,
      capacidadMaxima: formData.capacidadMaxima,
      brindaCertificado: formData.brindaCertificado || false,
      plantillaImagen: formData.plantillaImagen,
      estadoEvento: (formData.estadoEvento as "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO") || "PROGRAMADO",
    }

    onSave(eventToSave)
    setFormData({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "PRESENCIAL",
      ubicacion: "",
      capacidadMaxima: undefined,
      brindaCertificado: false,
      plantillaImagen: "",
      estadoEvento: "PROGRAMADO",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-700">{initialEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
          <DialogDescription>
            {initialEvent ? "Actualiza los detalles del evento" : "Completa la información del nuevo evento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-purple-700 font-semibold">
                Nombre del Evento *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: VI Congreso Internacional"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-purple-700 font-semibold">
                Tipo de Evento *
              </Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-purple-700 font-semibold">
              Descripción *
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Describe el evento..."
              className="border-gray-300 min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="text-purple-700 font-semibold">
                Fecha de Inicio *
              </Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={formData.fechaInicio || ""}
                onChange={(e) => handleChange("fechaInicio", e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin" className="text-purple-700 font-semibold">
                Fecha de Fin *
              </Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={formData.fechaFin || ""}
                onChange={(e) => handleChange("fechaFin", e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-purple-700 font-semibold">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion || ""}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                placeholder="Ej: Trujillo, Perú"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidadMaxima" className="text-purple-700 font-semibold">
                Capacidad Máxima
              </Label>
              <Input
                id="capacidadMaxima"
                type="number"
                value={formData.capacidadMaxima || ""}
                onChange={(e) =>
                  handleChange("capacidadMaxima", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
                placeholder="Ej: 500"
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estadoEvento" className="text-purple-700 font-semibold">
                Estado del Evento
              </Label>
              <Select value={formData.estadoEvento} onValueChange={(value) => handleChange("estadoEvento", value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROGRAMADO">Programado</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-700 font-semibold">Opciones</Label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.brindaCertificado || false}
                    onChange={(e) => handleChange("brindaCertificado", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Brinda Certificado</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagen" className="text-purple-700 font-semibold">
              Imagen del Evento
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input id="imagen" type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
              {formData.plantillaImagen && (
                <div className="mt-4">
                  <img
                    src={formData.plantillaImagen || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              {initialEvent ? "Actualizar Evento" : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
