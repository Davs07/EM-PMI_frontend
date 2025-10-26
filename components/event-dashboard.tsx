"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, QrCode, FileText } from "lucide-react"
import { AttendanceTable } from "./attendance-table"
import { PMIHeader } from "./pmi-header"
import { QRScanner } from "./qr-scanner"
import { ImportDialog } from "./import-dialog"
import { AttendeeDetailsModal } from "./attendee-details-modal"
import { AdvancedSearch } from "./advanced-search"
import { ReminderModal } from "./reminder-modal"

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
}

interface EventDashboardProps {
  eventId?: string
}

export function EventDashboard({ eventId }: EventDashboardProps) {
  const [activeTab, setActiveTab] = useState("presencial")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("nombre")
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)

  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: 1,
      dni: "12345678",
      fullName: "Fernando Becerra García",
      email: "Fernando@gmail.com",
      phone: "+51987654321",
      registrationDate: "2025-10-20 14:30",
      city: "Lima",
      role: "Miembro de un capítulo del PMI",
      modality: "Presencial",
      studyProgram: null,
      educationalInstitution: null,
      studentCardLink: null,
      pmiChapter: "PMI Lima",
      pmiMemberId: "PMI-001",
      pmiCertification: true,
      paymentVoucher: "Boleta",
      ruc: null,
      paymentVoucherLink: "https://example.com/voucher1.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "present" as const,
      type: "presencial",
    },
    {
      id: 2,
      dni: "87654321",
      fullName: "Marcio Alvarez López",
      email: "Marcio@gmail.com",
      phone: "+51912345678",
      registrationDate: "2025-10-19 10:15",
      city: "Arequipa",
      role: "Estudiante",
      modality: "Híbrida",
      studyProgram: "Ingeniería Civil",
      educationalInstitution: "Universidad Nacional de Ingeniería",
      studentCardLink: "https://example.com/carnet2.pdf",
      pmiChapter: null,
      pmiMemberId: null,
      pmiCertification: false,
      paymentVoucher: "Factura",
      ruc: "20123456789",
      paymentVoucherLink: "https://example.com/voucher2.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "absent" as const,
      type: "presencial",
    },
    {
      id: 3,
      dni: "11223344",
      fullName: "Fabricio Marín Rodríguez",
      email: "Fabricio@gmail.com",
      phone: "+51998765432",
      registrationDate: "2025-10-18 16:45",
      city: "Trujillo",
      role: "Público en general",
      modality: "Virtual",
      studyProgram: null,
      educationalInstitution: null,
      studentCardLink: null,
      pmiChapter: null,
      pmiMemberId: null,
      pmiCertification: false,
      paymentVoucher: "Boleta",
      ruc: null,
      paymentVoucherLink: "https://example.com/voucher3.pdf",
      receiveEventInfo: false,
      authorizeDataUsage: true,
      status: "absent" as const,
      type: "presencial",
    },
    {
      id: 4,
      dni: "55667788",
      fullName: "Davy Rodriguez Pérez",
      email: "Davy@gmail.com",
      phone: "+51945678901",
      registrationDate: "2025-10-17 09:20",
      city: "Cusco",
      role: "Estudiante",
      modality: "Presencial",
      studyProgram: "Ingeniería Ambiental",
      educationalInstitution: "Pontificia Universidad Católica",
      studentCardLink: "https://example.com/carnet4.pdf",
      pmiChapter: null,
      pmiMemberId: null,
      pmiCertification: false,
      paymentVoucher: "Boleta",
      ruc: null,
      paymentVoucherLink: "https://example.com/voucher4.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "absent" as const,
      type: "presencial",
    },
    {
      id: 5,
      dni: "99887766",
      fullName: "Juan García Sánchez",
      email: "Juan@gmail.com",
      phone: "+51956789012",
      registrationDate: "2025-10-16 13:00",
      city: "Lima",
      role: "Miembro de un capítulo del PMI",
      modality: "Virtual",
      studyProgram: null,
      educationalInstitution: null,
      studentCardLink: null,
      pmiChapter: "PMI Lima",
      pmiMemberId: "PMI-002",
      pmiCertification: true,
      paymentVoucher: "Factura",
      ruc: "20987654321",
      paymentVoucherLink: "https://example.com/voucher5.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "present" as const,
      type: "virtual",
    },
    {
      id: 6,
      dni: "44332211",
      fullName: "María López Martínez",
      email: "Maria@gmail.com",
      phone: "+51967890123",
      registrationDate: "2025-10-15 11:30",
      city: "Piura",
      role: "Estudiante",
      modality: "Virtual",
      studyProgram: "Administración de Proyectos",
      educationalInstitution: "Universidad de Piura",
      studentCardLink: "https://example.com/carnet6.pdf",
      pmiChapter: null,
      pmiMemberId: null,
      pmiCertification: false,
      paymentVoucher: "Boleta",
      ruc: null,
      paymentVoucherLink: "https://example.com/voucher6.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "present" as const,
      type: "virtual",
    },
    {
      id: 7,
      dni: "77665544",
      fullName: "Carlos Ruiz Flores",
      email: "Carlos@gmail.com",
      phone: "+51978901234",
      registrationDate: "2025-10-14 15:45",
      city: "Ica",
      role: "Miembro de un capítulo del PMI",
      modality: "Presencial",
      studyProgram: null,
      educationalInstitution: null,
      studentCardLink: null,
      pmiChapter: "PMI Sur",
      pmiMemberId: "PMI-003",
      pmiCertification: true,
      paymentVoucher: "Factura",
      ruc: "20456789123",
      paymentVoucherLink: "https://example.com/voucher7.pdf",
      receiveEventInfo: true,
      authorizeDataUsage: true,
      status: "absent" as const,
      type: "ponentes",
    },
  ])

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

  const toggleAttendance = (id: number) => {
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, status: a.status === "present" ? "absent" : "present" } : a)),
    )
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
          onScan={(email) => {
            const attendee = attendees.find((a) => a.email === email)
            if (attendee) {
              toggleAttendance(attendee.id)
            }
            setShowQRScanner(false)
          }}
        />
      )}

      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={(newAttendees) => {
            setAttendees([...attendees, ...newAttendees])
            setShowImportDialog(false)
          }}
        />
      )}

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSend={handleSendReminder}
      />

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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="virtual" className="text-base">
              Virtual
            </TabsTrigger>
            <TabsTrigger value="presencial" className="text-base">
              Presencial
            </TabsTrigger>
            <TabsTrigger value="ponentes" className="text-base">
              Ponentes
            </TabsTrigger>
          </TabsList>

          {["virtual", "presencial", "ponentes"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              <Card className="p-6">
                <div className="mb-6">
                  <AdvancedSearch onSearch={handleSearch} onClear={handleClearSearch} />
                </div>

                <div className="flex flex-col gap-4 mb-6">
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

                {activeTab === "presencial" && (
                  <div className="mb-6 flex gap-2">
                    <Button onClick={() => setShowQRScanner(true)} className="gap-2 bg-orange-500 hover:bg-orange-600">
                      <QrCode className="h-4 w-4" />
                      Escanear QR
                    </Button>
                  </div>
                )}

                <AttendanceTable
                  attendees={filteredAttendees}
                  onToggleAttendance={toggleAttendance}
                  onViewDetails={handleViewDetails}
                />

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
