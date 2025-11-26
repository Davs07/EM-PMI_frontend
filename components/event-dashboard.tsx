"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, QrCode, FileText, RefreshCw, Mail } from "lucide-react"
import { AttendanceTable } from "./attendance-table"
import { PMIHeader } from "./pmi-header"
import { QRScanner } from "./qr-scanner"
import { ImportDialog } from "./import-dialog"
import { AttendeeDetailsModal } from "./attendee-details-modal"
import { AdvancedSearch } from "./advanced-search"
import { ReminderModal } from "./reminder-modal"
import { AddAttendeeModal } from "./add-attendee-modal"
import SendInvitationsModal from "./send-invitations-modal"
import { Participante } from "./ui/data/model"
import { participantService, ParticipanteConAsistenciaDTO } from "@/services/participant-service"
import { attendanceService } from "@/services/attendance-service"
import { eventService } from "@/services/event-service"
import type { Event } from "@/types/event"

interface Attendee {
  id: number
  dni: string
  fullName: string
  email: string
  phone: string
  registrationDate: string
  city: string
  role: string
  modality: string
  studyProgram: string | null
  educationalInstitution: string | null
  studentCardLink: string | null
  pmiChapter: string | null
  pmiMemberId: string | null
  pmiCertification: boolean
  paymentVoucher: string
  ruc: string | null
  paymentVoucherLink: string
  receiveEventInfo: boolean
  authorizeDataUsage: boolean
  status: "present" | "absent"
  type: string
  participante: Participante
}

interface EventDashboardProps {
  eventId?: string
}

export function EventDashboard({ eventId }: EventDashboardProps) {
  const [activeTab, setActiveTab] = useState("asistentes")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("nombre")
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false)
  const [showInvitationsModal, setShowInvitationsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)

  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // Ref para evitar actualizaciones de estado en componentes desmontados
  const isMountedRef = useRef(true)

  // Función para cargar datos del evento - memoizada para evitar recreación
  const loadEventData = useCallback(async () => {
    if (!eventId) return
    try {
      // Usar getById en lugar de getAll para evitar cargar todos los eventos
      const event = await eventService.getById(eventId)
      if (isMountedRef.current && event) {
        setCurrentEvent(event)
      }
    } catch (error) {
      console.error("Error cargando datos del evento:", error)
    }
  }, [eventId])

  // Función para cargar participantes - memoizada
  // Usa el nuevo endpoint optimizado que incluye la asistencia (evita N+1 queries)
  const loadParticipantes = useCallback(async () => {
    if (!eventId) {
      setError("No se ha especificado un ID de evento")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Usar el nuevo endpoint optimizado que trae participantes CON asistencia
      // Esto evita hacer N llamadas adicionales por cada participante
      const participantesConAsistencia = await participantService.getByEventIdWithAttendance(eventId)
      
      // Verificar si el componente sigue montado antes de continuar
      if (!isMountedRef.current) return
      
      // Transformar ParticipanteConAsistenciaDTO a Attendee
      // Ya no necesitamos hacer llamadas adicionales por cada participante
      const transformedAttendees = participantesConAsistencia.map((p: ParticipanteConAsistenciaDTO) => {
        // Determinar estado de asistencia desde los datos ya incluidos
        const attendanceStatus: "present" | "absent" = p.asistencia?.asistio ? "present" : "absent"
        
        // Formatear fecha de registro
        let registrationDate = new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
        
        if (p.asistencia?.fechaRegistro) {
          registrationDate = new Date(p.asistencia.fechaRegistro).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        }

        // Crear objeto Participante para compatibilidad con componentes existentes
        const participante: Participante = {
          id: p.id,
          nombres: p.nombres || "",
          apellidoPaterno: p.apellidoPaterno || "",
          apellidoMaterno: p.apellidoMaterno || "",
          dni: p.dni || "",
          email: p.email || "",
          numeroWhatsapp: p.numeroWhatsapp || "",
          ciudad: p.ciudad || "",
          rol: p.rol || "",
          gradoEstudio: p.gradoEstudio || "",
          evidenciaEstudio: p.evidenciaEstudio || undefined,
          capituloPmi: p.capituloPmi || "",
          idMiembroPmi: p.idMiembroPmi || "",
          cuentaConCertificadoPmi: p.cuentaConCertificadoPmi || false,
          asistencias: [],
        }

        return {
          id: p.id,
          dni: p.dni || "",
          fullName: `${p.apellidoPaterno || ""} ${p.apellidoMaterno || ""} ${p.nombres || ""}`.trim(),
          email: p.email || "",
          phone: p.numeroWhatsapp || "",
          registrationDate: registrationDate,
          city: p.ciudad || "",
          role: p.rol || "",
          modality: determineModality(participante),
          studyProgram: p.gradoEstudio || null,
          educationalInstitution: null,
          studentCardLink: p.evidenciaEstudio || null,
          pmiChapter: p.capituloPmi || null,
          pmiMemberId: p.idMiembroPmi || null,
          pmiCertification: p.cuentaConCertificadoPmi || false,
          paymentVoucher: "Boleta",
          ruc: null,
          paymentVoucherLink: "",
          receiveEventInfo: true,
          authorizeDataUsage: true,
          status: attendanceStatus,
          type: determineType(participante),
          participante: participante,
        } as Attendee
      })
      
      // Solo actualizar si el componente sigue montado
      if (isMountedRef.current) {
        setAttendees(transformedAttendees)
      }
    } catch (err) {
      console.error("Error al cargar participantes:", err)
      if (isMountedRef.current) {
        setError("No se pudieron cargar los participantes. Verifica que el servidor esté en ejecución.")
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [eventId])

  // Cargar evento y participantes desde la API - solo cuando cambia eventId
  useEffect(() => {
    isMountedRef.current = true
    
    if (eventId) {
      loadEventData()
      loadParticipantes()
    }
    
    // Cleanup: marcar como desmontado para evitar actualizaciones de estado
    return () => {
      isMountedRef.current = false
    }
  }, [eventId, loadEventData, loadParticipantes])

  // Auto-refresco opcional cada 30 segundos
  useEffect(() => {
    if (!autoRefresh || !eventId) return

    const interval = setInterval(() => {
      loadParticipantes()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [autoRefresh, eventId, loadParticipantes])

  // Función para determinar el tipo de participante basado en su rol
  const determineType = (participante: Participante): string => {
    const rol = participante.rol?.toLowerCase() || ""
    if (rol.includes("ponente") || rol.includes("speaker") || rol.includes("expositor")) return "ponentes"
    return "asistentes" // Por defecto asistentes (incluye presencial, virtual e híbrido)
  }

  // Función para determinar la modalidad
  const determineModality = (participante: Participante): string => {
    const rol = participante.rol?.toLowerCase() || ""
    if (rol.includes("virtual")) return "Virtual"
    if (rol.includes("híbrido") || rol.includes("hibrido")) return "Híbrida"
    return "Presencial"
  }

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesTab = attendee.type === activeTab
    let matchesSearch = true

    if (searchTerm) {
      if (searchField === "nombre") {
        matchesSearch = attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      } else if (searchField === "dni") {
        matchesSearch = attendee.dni.includes(searchTerm)
      } else if (searchField === "email") {
        matchesSearch = attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }

    const matchesFilter =
      attendanceFilter === "all" || attendee.status === (attendanceFilter === "present" ? "present" : "absent")
    return matchesTab && matchesSearch && matchesFilter
  })

  const toggleAttendance = async (id: number) => {
    if (!eventId) {
      console.error("No se puede actualizar asistencia sin ID de evento")
      return
    }

    // Encontrar el asistente actual
    const attendee = attendees.find((a) => a.id === id)
    if (!attendee) {
      console.error(`No se encontró el asistente con ID ${id}`)
      return
    }

    // Determinar el nuevo estado
    const newStatus = attendee.status === "present" ? "absent" : "present"
    const asistio = newStatus === "present"

    try {
      // Actualizar en el backend
      await attendanceService.updateAttendanceStatus(id, Number(eventId), asistio)

      // Si la actualización fue exitosa, actualizar el estado local
      setAttendees(
        attendees.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      )

      console.log(`✅ Asistencia actualizada: Participante ${id} - ${asistio ? "Presente" : "Ausente"}`)
    } catch (error) {
      console.error("❌ Error al actualizar asistencia:", error)
      alert("No se pudo actualizar la asistencia. Por favor, intenta de nuevo.")
    }
  }

  const handleSearch = (term: string, field: string) => {
    setSearchTerm(term)
    setSearchField(field)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchField("nombre")
  }

  const handleViewDetails = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setShowDetailsModal(true)
  }

  const handleExportCSV = () => {
    const csv = ["DNI,Apellidos y Nombres,Correo Electrónico,Marca Temporal,Estado"]
    filteredAttendees.forEach((a) => {
      csv.push(
        `"${a.dni}","${a.fullName}","${a.email}","${a.registrationDate}","${a.status === "present" ? "Presente" : "Ausente"}"`,
      )
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `asistentes-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleExportPDF = () => {
    const content = `
REPORTE DE ASISTENCIA - ${activeTab.toUpperCase()}
Fecha: ${new Date().toLocaleDateString("es-ES")}

RESUMEN:
- Total de asistentes: ${filteredAttendees.length}
- Presentes: ${filteredAttendees.filter((a) => a.status === "present").length}
- Ausentes: ${filteredAttendees.filter((a) => a.status === "absent").length}

DETALLE:
${filteredAttendees.map((a) => `${a.dni} | ${a.fullName} | ${a.email} | ${a.registrationDate} | ${a.status === "present" ? "Presente" : "Ausente"}`).join("\n")}
    `

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-${activeTab}-${new Date().toISOString().split("T")[0]}.txt`
    link.click()
  }

  const handleSendReminder = (data: { subject: string; message: string; pdfs: File[] }) => {
    console.log("Recordatorio a enviar:", {
      subject: data.subject,
      message: data.message,
      pdfCount: data.pdfs.length,
      recipients: filteredAttendees.length,
    })

    // Here you would typically send this to your backend API
    // For now, we'll just show a success message
    alert(`Recordatorio enviado a ${filteredAttendees.length} asistentes`)
  }

  return (
    <div className="min-h-screen bg-background">
      <PMIHeader />

      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          attendees={attendees.map(a => ({ 
            id: a.id, 
            fullName: a.fullName,
            dni: a.dni 
          }))}
          onScan={(participanteId: number, success: boolean) => {
            if (success) {
              // Actualizar el estado del participante en la lista local
              setAttendees(
                attendees.map((a) => 
                  a.id === participanteId ? { ...a, status: "present" } : a
                )
              )
              console.log(`✅ Asistencia marcada por QR para participante ${participanteId}`)
            }
          }}
        />
      )}

      {showImportDialog && eventId && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={() => {
            // Recargar participantes después de importar
            loadParticipantes()
            setShowImportDialog(false)
          }}
          eventId={eventId}
        />
      )}

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSend={handleSendReminder}
      />

      <AddAttendeeModal
        isOpen={showAddAttendeeModal}
        onClose={() => setShowAddAttendeeModal(false)}
        eventId={eventId || ""}
        onSuccess={() => {
          loadParticipantes()
          setShowAddAttendeeModal(false)
        }}
        existingParticipantIds={attendees.map(a => a.id)}
      />

      {currentEvent && (
        <SendInvitationsModal
          isOpen={showInvitationsModal}
          onClose={() => setShowInvitationsModal(false)}
          event={currentEvent}
        />
      )}

      <AttendeeDetailsModal
        attendee={selectedAttendee}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedAttendee(null)
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="asistentes" className="text-base">
              Asistentes
            </TabsTrigger>
            <TabsTrigger value="ponentes" className="text-base">
              Ponentes
            </TabsTrigger>
          </TabsList>

          {["asistentes", "ponentes"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              <Card className="p-6">
                <div className="mb-6">
                  <AdvancedSearch onSearch={handleSearch} onClear={handleClearSearch} />
                </div>

                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={attendanceFilter === "all" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("all")}
                        className="rounded-full"
                        size="sm"
                      >
                        Todos
                      </Button>
                      <Button
                        variant={attendanceFilter === "present" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("present")}
                        className="rounded-full"
                        size="sm"
                      >
                        Asistió
                      </Button>
                      <Button
                        variant={attendanceFilter === "absent" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("absent")}
                        className="rounded-full"
                        size="sm"
                      >
                        No Asís
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={loadParticipantes}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        title="Recargar datos desde el servidor"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Recargar
                      </Button>
                      
                      <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
                        <input
                          type="checkbox"
                          id="autoRefresh"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="cursor-pointer"
                        />
                        <label htmlFor="autoRefresh" className="text-sm cursor-pointer whitespace-nowrap">
                          Auto-actualizar
                        </label>
                      </div>
                    </div>
                  </div>

                  {searchTerm && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Búsqueda: "{searchTerm}" en{" "}
                        {searchField === "nombre" ? "Nombre" : searchField === "dni" ? "DNI" : "Email"}
                      </span>
                      <button onClick={handleClearSearch} className="text-orange-500 hover:text-orange-600 font-medium">
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === "asistentes" && (
                  <div className="mb-6 flex gap-2 flex-wrap">
                    <Button onClick={() => setShowQRScanner(true)} className="gap-2 bg-orange-500 hover:bg-orange-600">
                      <QrCode className="h-4 w-4" />
                      Escanear QR
                    </Button>
                    <Button onClick={() => setShowAddAttendeeModal(true)} variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Agregar Participante
                    </Button>
                    {currentEvent && (
                      <Button 
                        onClick={() => setShowInvitationsModal(true)} 
                        variant="outline" 
                        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4" />
                        Enviar Invitaciones
                      </Button>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando participantes desde el backend...
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={loadParticipantes} variant="outline">
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <AttendanceTable
                    attendees={filteredAttendees as any}
                    onToggleAttendance={toggleAttendance}
                    onViewDetails={handleViewDetails as any}
                  />
                )}

                <div className="flex gap-2 mt-6 flex-wrap">
                  <Button onClick={() => setShowImportDialog(true)} variant="outline" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                  <Button onClick={handleExportCSV} className="gap-2 bg-orange-500 hover:bg-orange-600">
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button onClick={handleExportPDF} variant="outline" className="gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    Exportar Reporte
                  </Button>
                  <Button onClick={() => setShowReminderModal(true)} variant="outline" className="gap-2 bg-transparent">
                    Crear Recordatorio
                  </Button>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
