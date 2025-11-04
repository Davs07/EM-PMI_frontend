"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { emailService, type EnvioRecordatoriosResponse } from "@/services/email-service"
import { CalendarIcon, Send, Loader2, Mail, CheckCircle2, XCircle } from "lucide-react"
import type { Event } from "@/types/event"

interface SendInvitationsModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
}

export default function SendInvitationsModal({ isOpen, onClose, event }: SendInvitationsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("recordatorio")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EnvioRecordatoriosResponse | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Estado para Recordatorio (con calendario)
  const [recordatorioData, setRecordatorioData] = useState({
    asunto: `Recordatorio: ${event.nombre}`,
    mensaje: `¡Hola {nombre}!, <br>
⏰ ¡La cuenta regresiva ha comenzado! En solo <strong>3 días></strong> nos encontraremos en el <strong>VI Congreso</strong> <br><strong>Internacional de Dirección de Proyectos</strong>, un evento que reunirá a profesionales y líderes <br>apasionados por la gestión, la innovación y el liderazgo. <br>
📅 <strong>Fechas: </strong> 7 y 8 de noviembre<br>
📍 <strong>Lugar: </strong> Colegio de Ingenieros – CECAP | Trujillo, Perú<br>
Durante estos dos días vivirás una experiencia única de <strong>aprendizaje, inspiración y conexión</strong>, <br>junto a <strong>ponentes nacionales e internacionales </strong>que compartirán tendencias, herramientas <br>y casos de éxito en gestión de proyectos. <br>
💼 <strong>Prepárate para: </strong> <br>
•	Conferencias magistrales con expertos reconocidos<br>
•	Espacios de networking y colaboración<br>
•	Actividades de desarrollo profesional<br>
•	Una comunidad que impulsa el cambio y la excelencia<br>
Y si aún no lo has hecho, visita la web oficial para conocer el programa completo y los detalles logísticos: <br>
🌐 congresotrujillo2025.pminorteperu.org<br>
¡Gracias por ser parte de esta gran experiencia! <br>
Nos vemos muy pronto en Trujillo 👋<br>
Atte, <br>
<strong>Equipo PMI Norte Perú</strong>`,
    resumenEvento: event.nombre,
    descripcionEvento: event.descripcion || "",
    inicio: event.fechaInicio ? new Date(event.fechaInicio).toISOString() : new Date().toISOString(),
    fin: event.fechaFin ? new Date(event.fechaFin).toISOString() : new Date(new Date(event.fechaInicio || new Date()).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    lugar: event.ubicacion || "Por definir",
    flyer: null as File | null,
  })

  // Estado para Invitación Virtual
  const [virtualData, setVirtualData] = useState({
    asunto: `Invitación Virtual: ${event.nombre}`,
    mensaje: `Hola {nombre},\n\nEstás invitado al evento virtual "${event.nombre}".\n\nNos vemos en línea.`,
    googleMeetLink: "",
    inicio: event.fechaInicio ? new Date(event.fechaInicio).toISOString() : new Date().toISOString(),
    fin: event.fechaFin ? new Date(event.fechaFin).toISOString() : new Date(new Date(event.fechaInicio || new Date()).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    lugar: "Evento Virtual - Google Meet",
  })

  // Estado para Invitación Presencial
  const [presencialData, setPresencialData] = useState({
    asunto: `Invitación Presencial: ${event.nombre}`,
    mensaje: `Hola {nombre},\n\nEstás invitado al evento presencial "${event.nombre}".\n\nTu código QR de entrada va adjunto.`,
    inicio: event.fechaInicio ? new Date(event.fechaInicio).toISOString() : new Date().toISOString(),
    fin: event.fechaFin ? new Date(event.fechaFin).toISOString() : new Date(new Date(event.fechaInicio || new Date()).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    lugar: event.ubicacion || "Por definir",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setRecordatorioData({ ...recordatorioData, flyer: file })
  }

  const resetMessages = () => {
    setResult(null)
    setSuccessMessage("")
    setErrorMessage("")
  }

  const handleEnviarRecordatorio = async () => {
    resetMessages()
    setLoading(true)
    try {
      const { flyer, ...restData } = recordatorioData
      const response = await emailService.enviarRecordatorio({
        eventoId: Number(event.id),
        ...restData,
        flyer: flyer || undefined,
      })
      setResult(response)
      if (response.enviados > 0) {
        setSuccessMessage(`✅ Se enviaron ${response.enviados} de ${response.total} recordatorios`)
      }
      if (response.fallidos > 0) {
        setErrorMessage(`⚠️ ${response.fallidos} correos fallaron`)
      }
    } catch (error) {
      setErrorMessage(`Error al enviar recordatorios: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarVirtual = async () => {
    resetMessages()
    if (!virtualData.googleMeetLink.trim()) {
      setErrorMessage("Por favor, ingresa el enlace de Google Meet")
      return
    }
    setLoading(true)
    try {
      const response = await emailService.enviarInvitacionVirtual(Number(event.id), virtualData)
      setSuccessMessage(response || "✅ Invitaciones virtuales enviadas exitosamente")
    } catch (error) {
      setErrorMessage(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarPresencial = async () => {
    resetMessages()
    setLoading(true)
    try {
      const response = await emailService.enviarInvitacionPresencial(Number(event.id), presencialData)
      setSuccessMessage(response || "✅ Invitaciones presenciales enviadas exitosamente (con QR)")
    } catch (error) {
      setErrorMessage(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetMessages()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Invitaciones - {event.nombre}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recordatorio">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Recordatorio
            </TabsTrigger>
            <TabsTrigger value="virtual">
              <Send className="h-4 w-4 mr-2" />
              Virtual
            </TabsTrigger>
            <TabsTrigger value="presencial">
              <Mail className="h-4 w-4 mr-2" />
              Presencial
            </TabsTrigger>
          </TabsList>

          {/* TAB: RECORDATORIO CON CALENDARIO */}
          <TabsContent value="recordatorio" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Envía un recordatorio con archivo .ics para que los participantes agreguen el evento a su calendario.
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-asunto">Asunto</Label>
              <Input
                id="rec-asunto"
                value={recordatorioData.asunto}
                onChange={(e) => setRecordatorioData({ ...recordatorioData, asunto: e.target.value })}
                placeholder="Asunto del correo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mensaje">
                Mensaje <span className="text-xs text-muted-foreground">(usa {"{nombre}"} para personalizar)</span>
              </Label>
              <Textarea
                id="rec-mensaje"
                value={recordatorioData.mensaje}
                onChange={(e) => setRecordatorioData({ ...recordatorioData, mensaje: e.target.value })}
                rows={5}
                placeholder="Escribe tu mensaje..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rec-inicio">Fecha de Inicio</Label>
                <Input
                  id="rec-inicio"
                  type="datetime-local"
                  value={recordatorioData.inicio.slice(0, 16)}
                  onChange={(e) =>
                    setRecordatorioData({ ...recordatorioData, inicio: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec-fin">Fecha de Fin</Label>
                <Input
                  id="rec-fin"
                  type="datetime-local"
                  value={recordatorioData.fin.slice(0, 16)}
                  onChange={(e) =>
                    setRecordatorioData({ ...recordatorioData, fin: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-lugar">Lugar</Label>
              <Input
                id="rec-lugar"
                value={recordatorioData.lugar}
                onChange={(e) => setRecordatorioData({ ...recordatorioData, lugar: e.target.value })}
                placeholder="Ubicación del evento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-flyer">Flyer (Opcional)</Label>
              <Input id="rec-flyer" type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              {recordatorioData.flyer && (
                <p className="text-sm text-muted-foreground">Archivo: {recordatorioData.flyer.name}</p>
              )}
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <XCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {result && result.errores.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Errores:</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {result.errores.map((err, idx) => (
                    <li key={idx} className="text-red-600">
                      • {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={handleEnviarRecordatorio} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Recordatorio
                </>
              )}
            </Button>
          </TabsContent>

          {/* TAB: INVITACIÓN VIRTUAL */}
          <TabsContent value="virtual" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Envía invitaciones con enlace de Google Meet y archivo .ics para el calendario.
            </div>

            <div className="space-y-2">
              <Label htmlFor="virt-asunto">Asunto</Label>
              <Input
                id="virt-asunto"
                value={virtualData.asunto}
                onChange={(e) => setVirtualData({ ...virtualData, asunto: e.target.value })}
                placeholder="Asunto del correo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="virt-mensaje">
                Mensaje <span className="text-xs text-muted-foreground">(usa {"{nombre}"} para personalizar)</span>
              </Label>
              <Textarea
                id="virt-mensaje"
                value={virtualData.mensaje}
                onChange={(e) => setVirtualData({ ...virtualData, mensaje: e.target.value })}
                rows={5}
                placeholder="Escribe tu mensaje..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="virt-meet">Enlace de Google Meet *</Label>
              <Input
                id="virt-meet"
                value={virtualData.googleMeetLink}
                onChange={(e) => setVirtualData({ ...virtualData, googleMeetLink: e.target.value })}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="virt-inicio">Fecha de Inicio</Label>
                <Input
                  id="virt-inicio"
                  type="datetime-local"
                  value={virtualData.inicio.slice(0, 16)}
                  onChange={(e) =>
                    setVirtualData({ ...virtualData, inicio: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="virt-fin">Fecha de Fin</Label>
                <Input
                  id="virt-fin"
                  type="datetime-local"
                  value={virtualData.fin.slice(0, 16)}
                  onChange={(e) => setVirtualData({ ...virtualData, fin: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <XCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button onClick={handleEnviarVirtual} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Invitación Virtual
                </>
              )}
            </Button>
          </TabsContent>

          {/* TAB: INVITACIÓN PRESENCIAL */}
          <TabsContent value="presencial" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Envía invitaciones con código QR único para cada participante y archivo .ics para el calendario.
            </div>

            <div className="space-y-2">
              <Label htmlFor="pres-asunto">Asunto</Label>
              <Input
                id="pres-asunto"
                value={presencialData.asunto}
                onChange={(e) => setPresencialData({ ...presencialData, asunto: e.target.value })}
                placeholder="Asunto del correo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pres-mensaje">
                Mensaje <span className="text-xs text-muted-foreground">(usa {"{nombre}"} para personalizar)</span>
              </Label>
              <Textarea
                id="pres-mensaje"
                value={presencialData.mensaje}
                onChange={(e) => setPresencialData({ ...presencialData, mensaje: e.target.value })}
                rows={5}
                placeholder="Escribe tu mensaje..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pres-inicio">Fecha de Inicio</Label>
                <Input
                  id="pres-inicio"
                  type="datetime-local"
                  value={presencialData.inicio.slice(0, 16)}
                  onChange={(e) =>
                    setPresencialData({ ...presencialData, inicio: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pres-fin">Fecha de Fin</Label>
                <Input
                  id="pres-fin"
                  type="datetime-local"
                  value={presencialData.fin.slice(0, 16)}
                  onChange={(e) => setPresencialData({ ...presencialData, fin: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pres-lugar">Lugar</Label>
              <Input
                id="pres-lugar"
                value={presencialData.lugar}
                onChange={(e) => setPresencialData({ ...presencialData, lugar: e.target.value })}
                placeholder="Ubicación del evento"
              />
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <XCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button onClick={handleEnviarPresencial} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Invitación Presencial
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
