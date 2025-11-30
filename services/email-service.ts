import { tokenUtils } from "./auth-service"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api"

/**
 * Helper para obtener headers con autenticación (sin Content-Type para FormData)
 */
function getAuthHeadersForFormData(): HeadersInit {
  const headers: HeadersInit = {}
  const token = tokenUtils.getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export interface RecordatorioRequest {
  eventoId: number
  asunto: string
  mensaje: string
  resumenEvento: string
  descripcionEvento: string
  inicio: string // ISO 8601 format
  fin: string // ISO 8601 format
  lugar: string
  flyer?: File
}

export interface InvitacionVirtual {
  asunto: string
  mensaje: string
  googleMeetLink: string
  inicio: string
  fin: string
  lugar: string
  flyerPath?: string
}

export interface InvitacionPresencial {
  asunto: string
  mensaje: string
  inicio: string
  fin: string
  lugar: string
  flyerPath?: string
}

export interface EnvioRecordatoriosResponse {
  total: number
  enviados: number
  fallidos: number
  errores: string[]
}

export const emailService = {
  /**
   * Envía recordatorios a todos los participantes del evento con archivo .ics para calendario
   * Requiere autenticación ADMIN
   */
  async enviarRecordatorio(request: RecordatorioRequest): Promise<EnvioRecordatoriosResponse> {
    try {
      const formData = new FormData()
      formData.append("eventoId", request.eventoId.toString())
      formData.append("asunto", request.asunto)
      formData.append("mensaje", request.mensaje)
      formData.append("resumenEvento", request.resumenEvento)
      formData.append("descripcionEvento", request.descripcionEvento)
      formData.append("inicio", request.inicio)
      formData.append("fin", request.fin)
      formData.append("lugar", request.lugar)

      if (request.flyer) {
        formData.append("flyer", request.flyer)
      }

      const response = await fetch(`${API_BASE_URL}/email/recordatorio`, {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para enviar recordatorios.")
        throw new Error(`Error al enviar recordatorio: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending reminder:", error)
      throw error
    }
  },

  /**
   * Envía invitaciones virtuales con link de Google Meet
   * Requiere autenticación ADMIN
   */
  async enviarInvitacionVirtual(
    eventoId: number,
    invitacion: InvitacionVirtual
  ): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('eventoId', eventoId.toString())
      formData.append('asunto', invitacion.asunto)
      formData.append('mensaje', invitacion.mensaje)
      formData.append('googleMeetLink', invitacion.googleMeetLink)
      formData.append('inicio', invitacion.inicio)
      formData.append('fin', invitacion.fin)
      formData.append('lugar', invitacion.lugar)
      if (invitacion.flyerPath) {
        formData.append('flyerPath', invitacion.flyerPath)
      }

      const response = await fetch(`${API_BASE_URL}/email/virtual`, {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para enviar invitaciones.")
        const errorText = await response.text()
        throw new Error(errorText || `Error al enviar invitación virtual: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error("Error sending virtual invitation:", error)
      throw error
    }
  },

  /**
   * Envía invitaciones presenciales con código QR de entrada
   * Requiere autenticación ADMIN
   */
  async enviarInvitacionPresencial(
    eventoId: number,
    invitacion: InvitacionPresencial
  ): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('eventoId', eventoId.toString())
      formData.append('asunto', invitacion.asunto)
      formData.append('mensaje', invitacion.mensaje)
      formData.append('inicio', invitacion.inicio)
      formData.append('fin', invitacion.fin)
      formData.append('lugar', invitacion.lugar)
      if (invitacion.flyerPath) {
        formData.append('flyerPath', invitacion.flyerPath)
      }

      const response = await fetch(`${API_BASE_URL}/email/presencial`, {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para enviar invitaciones.")
        const errorText = await response.text()
        throw new Error(errorText || `Error al enviar invitación presencial: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error("Error sending presencial invitation:", error)
      throw error
    }
  },

  /**
   * Envía certificados de participación a todos los asistentes del evento
   * Requiere autenticación ADMIN
   */
  async enviarCertificados(
    eventoId: number,
    mensaje: string
  ): Promise<string> {
    try {
      const mensajeConSaltosDeLinea = mensaje.replace(/\n/g, '<br>')
      
      const formData = new FormData()
      formData.append("mensaje", mensajeConSaltosDeLinea)

      const response = await fetch(`${API_BASE_URL}/certificados/evento/${eventoId}/enviar`, {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.")
        if (response.status === 403) throw new Error("No tienes permisos para enviar certificados.")
        const errorText = await response.text()
        throw new Error(errorText || `Error al enviar certificados: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error("Error sending certificates:", error)
      throw error
    }
  },
}
