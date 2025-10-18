"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Upload, Download, QrCode, FileText } from "lucide-react"
import { AttendanceTable } from "./attendance-table"
import { PMIHeader } from "./pmi-header"
import { QRScanner } from "./qr-scanner"
import { ImportDialog } from "./import-dialog"

export function EventDashboard() {
  const [activeTab, setActiveTab] = useState("presencial")
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [attendees, setAttendees] = useState([
    { id: 1, name: "Fernando Becerra", email: "Fernando@gmail.com", status: "present" as const, type: "presencial" },
    { id: 2, name: "Marcio Alvarez", email: "Marcio@gmail.com", status: "absent" as const, type: "presencial" },
    { id: 3, name: "Fabricio Marín", email: "Fabricio@gmail.com", status: "absent" as const, type: "presencial" },
    { id: 4, name: "Davy Rodriguez", email: "Davy@gmail.com", status: "absent" as const, type: "presencial" },
    { id: 5, name: "Juan García", email: "Juan@gmail.com", status: "present" as const, type: "virtual" },
    { id: 6, name: "María López", email: "Maria@gmail.com", status: "present" as const, type: "virtual" },
    { id: 7, name: "Carlos Ruiz", email: "Carlos@gmail.com", status: "absent" as const, type: "ponentes" },
  ])

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesTab = attendee.type === activeTab
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      attendanceFilter === "all" || attendee.status === (attendanceFilter === "present" ? "present" : "absent")
    return matchesTab && matchesSearch && matchesFilter
  })

  const toggleAttendance = (id: number) => {
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, status: a.status === "present" ? "absent" : "present" } : a)),
    )
  }

  const handleExportCSV = () => {
    const csv = ["Apellidos y nombres,Correo de google,Estado"]
    filteredAttendees.forEach((a) => {
      csv.push(`"${a.name}","${a.email}","${a.status === "present" ? "Presente" : "Ausente"}"`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `asistentes-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
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
${filteredAttendees.map((a) => `${a.name} | ${a.email} | ${a.status === "present" ? "Presente" : "Ausente"}`).join("\n")}
    `

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-${activeTab}-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
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
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar aquí por Apellidos y nombres"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

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
                  </div>

                  {searchTerm && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Búsqueda: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-orange-500 hover:text-orange-600 font-medium"
                      >
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

                <AttendanceTable attendees={filteredAttendees} onToggleAttendance={toggleAttendance} />

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
                  <Button variant="outline" className="gap-2 bg-transparent">
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
