import type { Event } from "@/types/event"
import { tokenUtils } from "./auth-service"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api"

/**
 * Helper para obtener headers con autenticación
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  const token = tokenUtils.getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export interface EventoDTO {
  id: number
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  tipoEvento: string // "PRESENCIAL" | "VIRTUAL" | "HIBRIDO"
  ubicacion: string
  capacidadMaxima: number
  brindaCertificado: boolean
  plantillaImagen: string | null // Base64 o null
  fechaCreacion: string
  estadoEvento: string // "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO"
  eventoPadreId: number | null
  eventosHijoIds: number[]
}

/**
 * Mapea un EventoDTO del backend a un Event del frontend
 */
function mapEventoDTOToEvent(dto: EventoDTO): Event {
  // Procesar la imagen correctamente
  let imagenUrl = "/placeholder.jpg"
  
  if (dto.plantillaImagen && dto.plantillaImagen.trim() !== "") {
    // Si ya viene con el prefijo data:image
    if (dto.plantillaImagen.startsWith("data:")) {
      imagenUrl = dto.plantillaImagen
    } else {
      // Si es Base64 puro, agregar el prefijo
      imagenUrl = `data:image/jpeg;base64,${dto.plantillaImagen}`
    }
  }

  return {
    id: dto.id.toString(),
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin,
    tipo: dto.tipoEvento as "PRESENCIAL" | "VIRTUAL" | "HIBRIDO",
    ubicacion: dto.ubicacion || "",
    capacidadMaxima: dto.capacidadMaxima,
    brindaCertificado: dto.brindaCertificado,
    plantillaImagen: imagenUrl,
    estadoEvento: dto.estadoEvento as "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO",
    createdAt: dto.fechaCreacion,
  }
}

/**
 * Mapea un Event del frontend a un objeto para enviar al backend
 */
function mapEventToBackend(event: Omit<Event, "id" | "createdAt" | "updatedAt">) {
  // Extraer solo la parte Base64 de la imagen (sin el prefijo data:image/...;base64,)
  let plantillaImagenBase64: string | null = null
  
  if (event.plantillaImagen && event.plantillaImagen !== "/placeholder.jpg") {
    if (event.plantillaImagen.startsWith("data:")) {
      // Si viene con el prefijo data:image/...;base64,XXX
      const base64Data = event.plantillaImagen.split(",")[1]
      plantillaImagenBase64 = base64Data || null
    } else {
      // Si ya es Base64 puro
      plantillaImagenBase64 = event.plantillaImagen
    }
  }

  return {
    nombre: event.nombre,
    descripcion: event.descripcion,
    fechaInicio: event.fechaInicio,
    fechaFin: event.fechaFin,
    tipoEvento: event.tipo,
    ubicacion: event.ubicacion || "",
    capacidadMaxima: event.capacidadMaxima || 100,
    brindaCertificado: event.brindaCertificado,
    estadoEvento: event.estadoEvento,
    plantillaImagen: plantillaImagenBase64,
  }
}

export const eventService = {
  /**
   * Obtiene todos los eventos desde el backend
   */
  async getAll(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/listar`)
      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${response.status}`)
      }
      const data: EventoDTO[] = await response.json()
      return data.map(mapEventoDTOToEvent)
    } catch (error) {
      console.error("Error fetching events:", error)
      throw error
    }
  },

  /**
   * Obtiene un evento por ID
   */
  async getById(id: string): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`)
      if (!response.ok) {
        throw new Error(`Error al obtener evento: ${response.status}`)
      }
      const data: EventoDTO = await response.json()
      return mapEventoDTOToEvent(data)
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo evento (requiere autenticación ADMIN)
   */
  async create(event: Omit<Event, "id">): Promise<Event> {
    try {
      const payload = mapEventToBackend(event)
      const response = await fetch(`${API_BASE_URL}/eventos/crear`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para crear eventos.")
        throw new Error(`Error al crear evento: ${response.status}`)
      }
      const data: EventoDTO = await response.json()
      return mapEventoDTOToEvent(data)
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  },

  /**
   * Actualiza un evento existente (requiere autenticación ADMIN)
   */
  async update(id: string, event: Event): Promise<Event> {
    try {
      const payload = mapEventToBackend(event)
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para actualizar eventos.")
        throw new Error(`Error al actualizar evento: ${response.status}`)
      }
      const data: EventoDTO = await response.json()
      return mapEventoDTOToEvent(data)
    } catch (error) {
      console.error(`Error updating event ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un evento (requiere autenticación ADMIN)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para eliminar eventos.")
        throw new Error(`Error al eliminar evento: ${response.status}`)
      }
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error)
      throw error
    }
  },

  /**
   * Sube una plantilla de certificado PDF para un evento (requiere autenticación ADMIN)
   * @param eventId - ID del evento
   * @param file - Archivo PDF de la plantilla
   * @returns Mensaje de confirmación
   */
  async uploadCertificateTemplate(eventId: string, file: File): Promise<{ mensaje: string; eventoId: number }> {
    try {
      // Validar tipo de archivo
      if (file.type !== "application/pdf") {
        throw new Error("Solo se permiten archivos PDF")
      }

      // Validar tamaño (máximo 10MB según el backend)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("El archivo no debe superar 10MB")
      }

      const formData = new FormData()
      formData.append("plantilla", file)

      // Para FormData NO se debe incluir Content-Type, el browser lo agrega automáticamente
      const token = tokenUtils.getToken()
      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/eventos/${eventId}/plantilla-certificado`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para subir plantillas.")
        if (response.status === 404) throw new Error("Evento no encontrado.")
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error al subir plantilla: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error uploading certificate template for event ${eventId}:`, error)
      throw error
    }
  },
}
