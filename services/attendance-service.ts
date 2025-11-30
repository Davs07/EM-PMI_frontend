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

export interface AsistenciaDTO {
  id: number
  participanteId: number
  eventoId: number
  asistio: boolean
  rol?: string // "PONENTE" | "APOYADOR" | "ASISTENTE"
  horaIngreso: string | null
  fechaRegistro: string
}

export const attendanceService = {
  /**
   * Obtiene el registro de asistencia de un participante en un evento específico
   */
  async getByParticipantAndEvent(participanteId: number, eventoId: number): Promise<AsistenciaDTO> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/asistencias/participante/${participanteId}/evento/${eventoId}`
      )
      if (!response.ok) {
        throw new Error(`Error al obtener asistencia: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching attendance for participant ${participanteId} in event ${eventoId}:`, error)
      throw error
    }
  },

  /**
   * Actualiza el estado de asistencia (asistio: true/false) - requiere ADMIN
   * Si se marca como asistido, automáticamente registra la hora de ingreso
   */
  async updateAttendanceStatus(
    participanteId: number,
    eventoId: number,
    asistio: boolean
  ): Promise<AsistenciaDTO> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/asistencias/participante/${participanteId}/evento/${eventoId}/estado`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ asistio }),
        }
      )

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para actualizar asistencia.")
        const errorText = await response.text()
        throw new Error(`Error al actualizar asistencia: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error updating attendance for participant ${participanteId} in event ${eventoId}:`, error)
      throw error
    }
  },

  /**
   * Marca la asistencia como presente (asistio = true)
   */
  async markAsPresent(participanteId: number, eventoId: number): Promise<AsistenciaDTO> {
    return this.updateAttendanceStatus(participanteId, eventoId, true)
  },

  /**
   * Marca la asistencia como ausente (asistio = false)
   */
  async markAsAbsent(participanteId: number, eventoId: number): Promise<AsistenciaDTO> {
    return this.updateAttendanceStatus(participanteId, eventoId, false)
  },

  /**
   * Alterna el estado de asistencia (presente <-> ausente)
   */
  async toggleAttendance(participanteId: number, eventoId: number, currentStatus: boolean): Promise<AsistenciaDTO> {
    return this.updateAttendanceStatus(participanteId, eventoId, !currentStatus)
  },

  /**
   * Registra asistencia mediante código QR escaneado desde una imagen - requiere ADMIN
   * El backend decodifica el QR y marca la asistencia como presente
   */
  async registerAttendanceByQR(imageFile: File): Promise<AsistenciaDTO> {
    try {
      const formData = new FormData()
      formData.append("imagen", imageFile)

      // Para FormData no incluimos Content-Type, el navegador lo añade automáticamente
      const headers: HeadersInit = {}
      const token = tokenUtils.getToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/asistencias/validar-qr-imagen`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para registrar asistencia.")
        
        const errorText = await response.text()
        
        if (response.status === 409) {
          throw new Error("La asistencia ya fue registrada previamente")
        } else if (response.status === 404) {
          throw new Error("No se encontró una asistencia asociada a este código QR")
        } else {
          throw new Error(`Error al validar QR: ${errorText}`)
        }
      }

      return await response.json()
    } catch (error) {
      console.error("Error registering attendance by QR:", error)
      throw error
    }
  },

  /**
   * Crea un nuevo registro de asistencia para un participante en un evento - requiere ADMIN
   */
  async create(participanteId: number, eventoId: number, rol: string = "ASISTENTE"): Promise<AsistenciaDTO> {
    try {
      const payload = {
        participanteId,
        eventoId,
        rol: rol,
        asistio: false,
      }

      const response = await fetch(`${API_BASE_URL}/asistencias/crear`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para crear asistencias.")
        
        const errorText = await response.text()
        
        if (response.status === 409) {
          throw new Error("El participante ya está registrado en este evento")
        }
        
        throw new Error(`Error al crear asistencia: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating attendance:", error)
      throw error
    }
  },
}
