"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Users, Upload, FileText, Check, Loader2, X } from "lucide-react"
import type { Event } from "@/types/event"
import { EventDashboard } from "./event-dashboard"
import { useAuth } from "@/context/AuthContext"
import { eventService } from "@/services/event-service"

interface EventDetailViewProps {
  event: Event
  onBack: () => void
  onEdit: (event: Event) => void
}

export function EventDetailView({ event, onBack, onEdit }: EventDetailViewProps) {
  const { isGuest } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crear y limpiar URL de vista previa cuando cambia el archivo seleccionado
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
        setPreviewUrl(null)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return "bg-green-100 text-green-800"
      case "EN_CURSO":
        return "bg-blue-100 text-blue-800"
      case "FINALIZADO":
        return "bg-gray-100 text-gray-800"
      case "CANCELADO":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PRESENCIAL":
        return "bg-blue-100 text-blue-800"
      case "VIRTUAL":
        return "bg-purple-100 text-purple-800"
      case "HIBRIDO":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadError("Solo se permiten archivos PDF")
        setSelectedFile(null)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("El archivo no debe superar 10MB")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setUploadError(null)
      setUploadSuccess(false)
    }
  }

  const handleUploadTemplate = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      await eventService.uploadCertificateTemplate(event.id, selectedFile)
      setUploadSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Error al subir la plantilla")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-transparent border-purple-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        {!isGuest && (
          <Button
            size="sm"
            onClick={() => onEdit(event)}
            className="ml-auto bg-orange-500 hover:bg-orange-600 text-white"
          >
            Editar Evento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {event.plantillaImagen && (
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={event.plantillaImagen || "/placeholder.svg"}
                alt={event.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl text-purple-700">{event.nombre}</CardTitle>
                  <CardDescription className="mt-2">{event.descripcion}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTypeColor(event.tipo)}`}>
                  {event.tipo}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(event.estadoEvento)}`}>
                  {event.estadoEvento}
                </span>
                {event.brindaCertificado && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">
                    Con Certificado
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Inicio</p>
                    <p className="font-semibold text-gray-900">{formatDate(event.fechaInicio)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Fin</p>
                    <p className="font-semibold text-gray-900">{formatDate(event.fechaFin)}</p>
                  </div>
                </div>
              </div>

              {event.ubicacion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-semibold text-gray-900">{event.ubicacion}</p>
                  </div>
                </div>
              )}

              {event.capacidadMaxima && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Capacidad Máxima</p>
                    <p className="font-semibold text-gray-900">{event.capacidadMaxima} personas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg text-purple-700">Información del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-semibold text-gray-900">{event.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold text-gray-900">{event.estadoEvento}</p>
              </div>
              {event.capacidadMaxima && (
                <div>
                  <p className="text-sm text-gray-600">Capacidad</p>
                  <p className="font-semibold text-gray-900">{event.capacidadMaxima} personas</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Certificado</p>
                <p className="font-semibold text-gray-900">{event.brindaCertificado ? "Sí" : "No"}</p>
              </div>

              {/* Sección para subir plantilla de certificado */}
              {event.brindaCertificado && !isGuest && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Plantilla de Certificado</p>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="certificate-template-input"
                    />
                    
                    {!selectedFile ? (
                      <label
                        htmlFor="certificate-template-input"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Seleccionar PDF</span>
                      </label>
                    ) : (
                      <div className="space-y-3">
                        {/* Nombre del archivo y botón para quitar */}
                        <div className="flex items-center justify-between gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-sm text-purple-700 truncate">{selectedFile.name}</span>
                          </div>
                          <button
                            onClick={clearSelectedFile}
                            className="p-1 hover:bg-purple-200 rounded transition-colors flex-shrink-0"
                            title="Quitar archivo"
                          >
                            <X className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>

                        {/* Vista previa del PDF */}
                        {previewUrl && (
                          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                            <embed
                              src={previewUrl}
                              type="application/pdf"
                              className="w-full h-64"
                            />
                          </div>
                        )}

                        {/* Botón para subir */}
                        <Button
                          onClick={handleUploadTemplate}
                          disabled={isUploading}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Subir Plantilla
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Plantilla subida correctamente</span>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-red-500 text-sm">{uploadError}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-purple-700">Gestión de Asistentes</CardTitle>
          <CardDescription>Administra los asistentes registrados para este evento</CardDescription>
        </CardHeader>
        <CardContent>
          <EventDashboard eventId={event.id} />
        </CardContent>
      </Card>
    </div>
  )
}
