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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-8 border-0 shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{initialEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {initialEvent ? "Actualiza los detalles del evento" : "Completa la información del nuevo evento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground font-semibold">
                Nombre del Evento *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: VI Congreso Internacional"
                className="border-gray-200 rounded-xl h-11 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-foreground font-semibold">
                Tipo de Evento *
              </Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                <SelectTrigger className="border-gray-200 rounded-xl h-11 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground font-semibold">
              Descripción *
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Describe el evento..."
              className="border-gray-200 rounded-xl min-h-24 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="text-foreground font-semibold">
                Fecha de Inicio *
              </Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={formData.fechaInicio || ""}
                onChange={(e) => handleChange("fechaInicio", e.target.value)}
                className="border-gray-200 rounded-xl h-11 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin" className="text-foreground font-semibold">
                Fecha de Fin *
              </Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={formData.fechaFin || ""}
                onChange={(e) => handleChange("fechaFin", e.target.value)}
                className="border-gray-200 rounded-xl h-11 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-foreground font-semibold">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion || ""}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                placeholder="Ej: Trujillo, Perú"
                className="border-gray-200 rounded-xl h-11 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidadMaxima" className="text-foreground font-semibold">
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
                className="border-gray-200 rounded-xl h-11 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estadoEvento" className="text-foreground font-semibold">
                Estado del Evento
              </Label>
              <Select value={formData.estadoEvento} onValueChange={(value) => handleChange("estadoEvento", value)}>
                <SelectTrigger className="border-gray-200 rounded-xl h-11 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PROGRAMADO">Programado</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Opciones</Label>
              <div className="flex items-center gap-4 pt-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.brindaCertificado || false}
                    onChange={(e) => handleChange("brindaCertificado", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">Brinda Certificado</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagen" className="text-foreground font-semibold">
              Imagen del Evento
            </Label>
            <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center">
              <input id="imagen" type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              {formData.plantillaImagen && (
                <div className="mt-4">
                  <img
                    src={formData.plantillaImagen || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full h-12 border-gray-200 hover:bg-gray-50">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 rounded-full h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              {initialEvent ? "Actualizar Evento" : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
