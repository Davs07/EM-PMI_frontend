import { Participante } from "@/components/ui/data/model"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export interface ParticipanteDTO {
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
}

/**
 * Mapea un ParticipanteDTO del backend a un Participante del frontend
 */
function mapParticipanteDTOToParticipante(dto: ParticipanteDTO): Participante {
  return {
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
  }
}

export const participantService = {
  /**
   * Obtiene todos los participantes (sin filtrar por evento)
   */
  async getAll(): Promise<Participante[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/listar`)
      if (!response.ok) {
        throw new Error(`Error al obtener participantes: ${response.status}`)
      }
      const data: ParticipanteDTO[] = await response.json()
      return data.map(mapParticipanteDTOToParticipante)
    } catch (error) {
      console.error("Error fetching participants:", error)
      throw error
    }
  },

  /**
   * Obtiene los participantes de un evento específico
   * Este es el endpoint que debes usar para cargar participantes por evento
   */
  async getByEventId(eventId: string | number): Promise<Participante[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/evento/${eventId}`)
      if (!response.ok) {
        throw new Error(`Error al obtener participantes del evento: ${response.status}`)
      }
      const data: ParticipanteDTO[] = await response.json()
      return data.map(mapParticipanteDTOToParticipante)
    } catch (error) {
      console.error(`Error fetching participants for event ${eventId}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo participante
   */
  async create(participante: Omit<ParticipanteDTO, "id">): Promise<Participante> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participante),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error del servidor:", errorText)
        
        // Intentar parsear si es JSON
        let errorMessage = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorText
        } catch {
          // Si no es JSON, usar el texto directo
        }
        
        throw new Error(`Error al crear participante: ${errorMessage}`)
      }
      
      const data: ParticipanteDTO = await response.json()
      return mapParticipanteDTOToParticipante(data)
    } catch (error) {
      console.error("Error creating participant:", error)
      throw error
    }
  },

  /**
   * Elimina un participante
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/participante/eliminar/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`Error al eliminar participante: ${response.status}`)
      }
    } catch (error) {
      console.error(`Error deleting participant ${id}:`, error)
      throw error
    }
  },
}
