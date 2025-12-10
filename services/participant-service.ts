import { Participante } from "@/components/ui/data/model"
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

/**
 * DTO para participante con información de asistencia incluida
 * Evita el problema de N+1 queries
 */
export interface ParticipanteConAsistenciaDTO {
  id: number
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  dni: string
  email: string
  numeroWhatsapp: string
  ciudad: string
  rol: string
  gradoEstudio: string
  evidenciaEstudio: string | null
  capituloPmi: string
  idMiembroPmi: string
  cuentaConCertificadoPmi: boolean
  asistencia: {
    asistio: boolean
    horaIngreso: string | null
    fechaRegistro: string | null
  } | null
}

/**
 * Tipo para crear un nuevo participante (sin id)
 */
export type CreateParticipanteDTO = Omit<ParticipanteConAsistenciaDTO, "id" | "asistencia">

/**
 * DTO para ponentes con información de asistencia
 * Corresponde al endpoint /participante/evento/{eventoId}/ponentes
 */
export interface PonenteConAsistenciaDTO {
  id: number
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  dni: string
  email: string
  telefono: string
  asistencia: {
    asistio: boolean
    horaIngreso: string | null
  } | null
}

export const participantService = {
  /**
   * Obtiene todos los participantes (sin filtrar por evento)
   * Usado para el modal de agregar asistente
   */
  async getAll(): Promise<Participante[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/listar`)
      if (!response.ok) {
        throw new Error(`Error al obtener participantes: ${response.status}`)
      }
      const data: ParticipanteConAsistenciaDTO[] = await response.json()
      // Mapear a Participante del modelo frontend
      return data.map((dto) => ({
        id: dto.id,
        nombres: dto.nombres || "",
        apellidoPaterno: dto.apellidoPaterno || "",
        apellidoMaterno: dto.apellidoMaterno || "",
        dni: dto.dni || "",
        email: dto.email || "",
        numeroWhatsapp: dto.numeroWhatsapp || "",
        ciudad: dto.ciudad || "",
        rol: dto.rol || "",
        gradoEstudio: dto.gradoEstudio || "",
        evidenciaEstudio: dto.evidenciaEstudio || undefined,
        capituloPmi: dto.capituloPmi || "",
        idMiembroPmi: dto.idMiembroPmi || "",
        cuentaConCertificadoPmi: dto.cuentaConCertificadoPmi || false,
        asistencias: [],
      }))
    } catch (error) {
      console.error("Error fetching participants:", error)
      throw error
    }
  },

  /**
   * Obtiene los participantes de un evento con su estado de asistencia incluido
   * Este endpoint optimizado evita el problema de N+1 queries
   */
  async getByEventIdWithAttendance(eventId: string | number): Promise<ParticipanteConAsistenciaDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/evento/${eventId}/con-asistencia`)
      if (!response.ok) {
        throw new Error(`Error al obtener participantes con asistencia: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching participants with attendance for event ${eventId}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los ponentes de un evento con su estado de asistencia
   * Endpoint: /participante/evento/{eventoId}/ponentes
   */
  async getPonentesByEventId(eventId: string | number): Promise<PonenteConAsistenciaDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/evento/${eventId}/ponentes`)
      if (!response.ok) {
        throw new Error(`Error al obtener ponentes: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching ponentes for event ${eventId}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo participante (requiere autenticación ADMIN)
   */
  async create(participante: CreateParticipanteDTO): Promise<ParticipanteConAsistenciaDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/crear`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(participante),
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para crear participantes.")
        
        const errorText = await response.text()
        let errorMessage = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorText
        } catch {
          // Si no es JSON, usar el texto directo
        }

        throw new Error(`Error al crear participante: ${errorMessage}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating participant:", error)
      throw error
    }
  },

  /**
   * Elimina un participante (requiere autenticación ADMIN)
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/eliminar/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para eliminar participantes.")
        throw new Error(`Error al eliminar participante: ${response.status}`)
      }
    } catch (error) {
      console.error(`Error deleting participant ${id}:`, error)
      throw error
    }
  },
}