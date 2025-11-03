const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

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
        body: formData,
      })

      if (!response.ok) {
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
   */
  async enviarInvitacionVirtual(
    eventoId: number,
    invitacion: InvitacionVirtual
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/email/virtual?eventoId=${eventoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitacion),
      })

      if (!response.ok) {
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
   */
  async enviarInvitacionPresencial(
    eventoId: number,
    invitacion: InvitacionPresencial
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/email/presencial?eventoId=${eventoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitacion),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Error al enviar invitación presencial: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error("Error sending presencial invitation:", error)
      throw error
    }
  },
}
