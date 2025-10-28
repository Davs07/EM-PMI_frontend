"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Upload, Download, QrCode, FileText, Menu, X } from "lucide-react"
import { AttendanceTable } from "./attendance-table"
import { QRScanner } from "./qr-scanner"
import { ImportDialog } from "./import-dialog"
import Image from "next/image"
import { Participante } from "./ui/data/model"
import { fetchParticipantes } from "./ui/data/api"

// Interface para la tabla de asistencia
interface Attendee {
  id: number
  dni: string
  fullName: string
  email: string
  registrationDate: string
  status: "present" | "absent"
  type: string
  participante: Participante // Referencia al participante original
}

export function EventLanding() {
  const [activeTab, setActiveTab] = useState("presencial")
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "absent">("all")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [attendees, setAttendees] = useState<Attendee[]>([])

  // Cargar participantes desde la API
  useEffect(() => {
    loadParticipantes()
  }, [])

  const loadParticipantes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const participantes = await fetchParticipantes()
      
      // Transformar Participante a Attendee
      const transformedAttendees: Attendee[] = participantes.map((p) => ({
        id: p.id,
        dni: p.dni,
        fullName: `${p.apellidoPaterno} ${p.apellidoMaterno} ${p.nombres}`.trim(),
        email: p.email,
        registrationDate: new Date().toLocaleDateString("es-ES"), // Ajustar si tienes fecha de registro
        status: "absent", // Por defecto ausente
        type: determineType(p), // Función para determinar el tipo
        participante: p,
      }))
      
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
    if (rol.includes("ponente") || rol.includes("speaker")) return "ponentes"
    if (rol.includes("virtual") || rol.includes("online")) return "virtual"
    return "presencial" // Por defecto presencial
  }

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesTab = attendee.type === activeTab
    const matchesSearch =
      attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.dni.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      attendanceFilter === "all" || attendee.status === (attendanceFilter === "present" ? "present" : "absent")
    return matchesTab && matchesSearch && matchesFilter
  })

  const toggleAttendance = (id: number) => {
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, status: a.status === "present" ? "absent" : "present" } : a)),
    )
  }

  const handleViewDetails = (attendee: Attendee) => {
    // TODO: Implementar modal de detalles
    console.log("Ver detalles de:", attendee.participante)
    alert(`Detalles de ${attendee.fullName}\n\nDNI: ${attendee.dni}\nEmail: ${attendee.email}\nCiudad: ${attendee.participante.ciudad}\nRol: ${attendee.participante.rol}`)
  }

  const handleExportCSV = () => {
    const csv = ["Apellidos y nombres,Correo de google,Estado"]
    filteredAttendees.forEach((a) => {
      csv.push(`"${a.fullName}","${a.email}","${a.status === "present" ? "Presente" : "Ausente"}"`)
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
${filteredAttendees.map((a) => `${a.fullName} | ${a.email} | ${a.status === "present" ? "Presente" : "Ausente"}`).join("\n")}
    `

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-${activeTab}-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">

      <header className="border-b border-slate-800 bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src={"/public/PMI_logo.png"}
                alt="Logo"
                height={"96"}
                width={"96"}
              />

              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold text-white">Project </span>
                <span className="text-xl text-white">Management</span>
                <span className="text-xl text-white">Institute</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
                Eventos
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
                Ponentes
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
                Entradas
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
                Sede
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
                FAQ
              </a>
              
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-3 pb-4">
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Resumen
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Ponentes
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Entradas
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Sede
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                FAQ
              </a>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                Compra tu entrada
              </Button>
            </nav>
          )}
        </div>
      </header>

      <section className="py-12 md:py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">Control de Asistencia</h2>

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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800">
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
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input
                          placeholder="Buscar aquí por Apellidos y nombres"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
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
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Búsqueda: "{searchTerm}"</span>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-orange-500 hover:text-orange-400 font-medium"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === "presencial" && (
                    <div className="mb-6 flex gap-2">
                      <Button
                        onClick={() => setShowQRScanner(true)}
                        className="gap-2 bg-orange-500 hover:bg-orange-600"
                      >
                        <QrCode className="h-4 w-4" />
                        Escanear QR
                      </Button>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="text-center py-8 text-slate-400">Cargando participantes...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-400">{error}</div>
                  ) : (
                    <AttendanceTable 
                      attendees={filteredAttendees} 
                      onToggleAttendance={toggleAttendance}
                      onViewDetails={handleViewDetails}
                    />
                  )}

                  <div className="flex gap-2 mt-6 flex-wrap">
                    <Button
                      onClick={() => setShowImportDialog(true)}
                      variant="outline"
                      className="gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                    <Button onClick={handleExportCSV} className="gap-2 bg-orange-500 hover:bg-orange-600">
                      <Download className="h-4 w-4" />
                      Exportar CSV
                    </Button>
                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      className="gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <FileText className="h-4 w-4" />
                      Exportar Reporte
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      Crear Recordatorio
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  )
}
