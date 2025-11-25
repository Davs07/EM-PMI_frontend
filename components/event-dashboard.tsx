"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, QrCode, FileText, RefreshCw, Mail, Search, Filter, UserPlus } from "lucide-react"
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
import { participantService } from "@/services/participant-service"
import { attendanceService } from "@/services/attendance-service"
import { eventService } from "@/services/event-service"
import type { Event } from "@/types/event"
import { cn } from "@/lib/utils"

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

  // Cargar evento y participantes desde la API
  useEffect(() => {
    if (eventId) {
      loadEventData()
      loadParticipantes()
    }
  }, [eventId])

  const loadEventData = async () => {
    if (!eventId) return
    try {
      const events = await eventService.getAll()
      const event = events.find(e => e.id === eventId)
      if (event) {
        setCurrentEvent(event)
      }
    } catch (error) {
      console.error("Error cargando datos del evento:", error)
    }
  }

  // Auto-refresco opcional cada 30 segundos
  useEffect(() => {
    if (!autoRefresh || !eventId) return

    const interval = setInterval(() => {
      loadParticipantes()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [autoRefresh, eventId])

  const loadParticipantes = async () => {
    if (!eventId) {
      setError("No se ha especificado un ID de evento")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      // Cargar participantes específicos del evento usando el nuevo endpoint
      const participantes = await participantService.getByEventId(eventId)

      // Transformar Participante a Attendee y cargar estado de asistencia
      const transformedAttendeesPromises = participantes.map(async (p: Participante) => {
        let attendanceStatus: "present" | "absent" = "absent"
        let registrationDate = new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })

        // Intentar obtener el estado de asistencia desde el backend
        try {
          const asistencia = await attendanceService.getByParticipantAndEvent(p.id, Number(eventId))
          attendanceStatus = asistencia.asistio ? "present" : "absent"

          // Usar la fecha de registro real de la asistencia
          if (asistencia.fechaRegistro) {
            registrationDate = new Date(asistencia.fechaRegistro).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            })
          }
        } catch (error) {
          // Si no existe el registro de asistencia, se mantiene como ausente por defecto
          console.warn(`No se encontró registro de asistencia para participante ${p.id} en evento ${eventId}`)
        }

        return {
          id: p.id,
          dni: p.dni,
          fullName: `${p.apellidoPaterno} ${p.apellidoMaterno} ${p.nombres}`.trim(),
          email: p.email,
          phone: p.numeroWhatsapp,
          registrationDate: registrationDate, // Fecha real desde la asistencia
          city: p.ciudad,
          role: p.rol,
          modality: determineModality(p),
          studyProgram: p.gradoEstudio || null,
          educationalInstitution: null,
          studentCardLink: p.evidenciaEstudio || null,
          pmiChapter: p.capituloPmi || null,
          pmiMemberId: p.idMiembroPmi || null,
          pmiCertification: p.cuentaConCertificadoPmi,
          paymentVoucher: "Boleta",
          ruc: null,
          paymentVoucherLink: "",
          receiveEventInfo: true,
          authorizeDataUsage: true,
          status: attendanceStatus, // Estado real desde el backend
          type: determineType(p),
          participante: p,
        } as Attendee
      })

      const transformedAttendees = await Promise.all(transformedAttendeesPromises)
      setAttendees(transformedAttendees)
    } catch (err) {
      console.error("Error al cargar participantes:", err)
      setError("No se pudieron cargar los participantes. Verifica que el servidor esté en ejecución.")
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="min-h-screen bg-background/50">
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

      <div className="container mx-auto px-0 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <TabsList className="bg-transparent p-0 gap-2">
              <TabsTrigger
                value="asistentes"
                className="rounded-full px-6 py-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:border-gray-200 hover:bg-gray-50 transition-all"
              >
                Asistentes
              </TabsTrigger>
              <TabsTrigger
                value="ponentes"
                className="rounded-full px-6 py-2 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:border-gray-200 hover:bg-gray-50 transition-all"
              >
                Ponentes
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                onClick={loadParticipantes}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2 rounded-full bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                title="Recargar datos desde el servidor"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recargar
              </Button>
            </div>
          </div>

          {["asistentes", "ponentes"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6 animate-fade-in">
              <Card className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col gap-6 mb-8">
                  {/* Header Controls */}
                  <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                    <div className="flex-1 w-full lg:w-auto">
                      <AdvancedSearch onSearch={handleSearch} onClear={handleClearSearch} />
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                      <Button
                        variant={attendanceFilter === "all" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("all")}
                        className={cn("rounded-full px-4", attendanceFilter === "all" ? "bg-gray-900 text-white hover:bg-black" : "bg-white border-gray-200 hover:bg-gray-50")}
                        size="sm"
                      >
                        Todos
                      </Button>
                      <Button
                        variant={attendanceFilter === "present" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("present")}
                        className={cn("rounded-full px-4", attendanceFilter === "present" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-white border-gray-200 hover:bg-gray-50")}
                        size="sm"
                      >
                        Asistió
                      </Button>
                      <Button
                        variant={attendanceFilter === "absent" ? "default" : "outline"}
                        onClick={() => setAttendanceFilter("absent")}
                        className={cn("rounded-full px-4", attendanceFilter === "absent" ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-white border-gray-200 hover:bg-gray-50")}
                        size="sm"
                      >
                        No Asistió
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {activeTab === "asistentes" && (
                    <div className="flex flex-wrap gap-3 p-1">
                      <Button onClick={() => setShowQRScanner(true)} className="gap-2 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <QrCode className="h-4 w-4" />
                        Escanear QR
                      </Button>
                      <Button onClick={() => setShowAddAttendeeModal(true)} variant="outline" className="gap-2 rounded-full bg-white border-gray-200 hover:bg-gray-50">
                        <UserPlus className="h-4 w-4" />
                        Agregar
                      </Button>
                      {currentEvent && (
                        <Button
                          onClick={() => setShowInvitationsModal(true)}
                          variant="outline"
                          className="gap-2 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Mail className="h-4 w-4" />
                          Invitaciones
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
                    <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <p>Cargando participantes...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 dark:bg-red-900/20 dark:text-red-400">
                      <Filter className="h-8 w-8" />
                    </div>
                    <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
                    <Button onClick={loadParticipantes} variant="outline" className="rounded-full">
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                    <AttendanceTable
                      attendees={filteredAttendees as any}
                      onToggleAttendance={toggleAttendance}
                      onViewDetails={handleViewDetails as any}
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-8 flex-wrap justify-end border-t border-gray-100 pt-6">
                  <Button onClick={() => setShowImportDialog(true)} variant="outline" className="gap-2 rounded-full border-gray-200">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" className="gap-2 rounded-full border-gray-200">
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button onClick={handleExportPDF} variant="outline" className="gap-2 rounded-full border-gray-200">
                    <FileText className="h-4 w-4" />
                    Reporte
                  </Button>
                  <Button onClick={() => setShowReminderModal(true)} variant="ghost" className="gap-2 rounded-full text-muted-foreground hover:text-foreground">
                    Recordatorio
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

