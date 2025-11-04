"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, X } from "lucide-react"
import { participantService } from "@/services/participant-service"
import { attendanceService } from "@/services/attendance-service"
import type { Participante } from "./ui/data/model"
import { ROLES, type RolParticipante } from "@/types/roles"

interface AddAttendeeModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onSuccess: () => void
  existingParticipantIds: number[]
}

export function AddAttendeeModal({ isOpen, onClose, eventId, onSuccess, existingParticipantIds }: AddAttendeeModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "create">("search")
  const [searchTerm, setSearchTerm] = useState("")
  const [allParticipants, setAllParticipants] = useState<Participante[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participante[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(null)
  const [adding, setAdding] = useState(false)
  
  // Rol para la asistencia (independiente del rol del participante)
  const [rolAsistencia, setRolAsistencia] = useState<RolParticipante>("ASISTENTE")
  
  // Formulario para nuevo participante
  const [newParticipant, setNewParticipant] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    dni: "",
    email: "",
    numeroWhatsapp: "",
    ciudad: "",
    rol: "Asistente",
    gradoEstudio: "",
    capituloPmi: "",
    idMiembroPmi: "",
    cuentaConCertificadoPmi: false,
  })

  useEffect(() => {
    if (isOpen) {
      loadAllParticipants()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParticipants([])
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = allParticipants.filter(
        (p) =>
          !existingParticipantIds.includes(p.id) &&
          (p.nombres.toLowerCase().includes(term) ||
            p.apellidoPaterno.toLowerCase().includes(term) ||
            p.apellidoMaterno.toLowerCase().includes(term) ||
            p.dni.includes(term) ||
            p.email.toLowerCase().includes(term))
      )
      setFilteredParticipants(filtered.slice(0, 10)) // Limitar a 10 resultados
    }
  }, [searchTerm, allParticipants, existingParticipantIds])

  const loadAllParticipants = async () => {
    try {
      setLoading(true)
      const participants = await participantService.getAll()
      setAllParticipants(participants)
    } catch (error) {
      console.error("Error al cargar participantes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddParticipant = async () => {
    if (!selectedParticipant) return

    try {
      setAdding(true)
      // Pasar el rol de asistencia seleccionado
      await attendanceService.create(selectedParticipant.id, Number(eventId), rolAsistencia)
      
      // Éxito
      onSuccess()
      setSearchTerm("")
      setSelectedParticipant(null)
      setRolAsistencia("ASISTENTE") // Resetear rol
      onClose()
    } catch (error: any) {
      console.error("Error al agregar participante:", error)
      alert(error.message || "Error al agregar el participante al evento")
    } finally {
      setAdding(false)
    }
  }

  const handleCreateAndAddParticipant = async () => {
    // Validar campos requeridos
    if (!newParticipant.nombres || !newParticipant.apellidoPaterno || !newParticipant.dni || !newParticipant.email) {
      alert("Por favor completa todos los campos obligatorios (Nombres, Apellidos, DNI y Email)")
      return
    }

    try {
      setAdding(true)
      
      console.log("Datos a enviar:", newParticipant)
      
      // Crear el participante
      const createdParticipant = await participantService.create({
        ...newParticipant,
        evidenciaEstudio: null,
      })
      
      console.log("Participante creado:", createdParticipant)
      
      // Crear la asistencia para el evento con el rol seleccionado
      const attendance = await attendanceService.create(createdParticipant.id, Number(eventId), rolAsistencia)
      console.log("Asistencia creada:", attendance)
      
      // Éxito
      alert("Participante creado y agregado exitosamente")
      onSuccess()
      resetForm()
      setRolAsistencia("ASISTENTE") // Resetear rol
      onClose()
    } catch (error: any) {
      console.error("Error al crear y agregar participante:", error)
      
      // Manejar diferentes tipos de error
      let errorMessage = "Error desconocido al crear el participante"
      
      if (error.message) {
        if (error.message.includes("email")) {
          errorMessage = "Error: El email ya está registrado en el sistema"
        } else if (error.message.includes("dni")) {
          errorMessage = "Error: El DNI ya está registrado en el sistema"
        } else if (error.message.includes("duplicado") || error.message.includes("duplicate")) {
          errorMessage = "Error: Ya existe un participante con estos datos"
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setAdding(false)
    }
  }

  const resetForm = () => {
    setNewParticipant({
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      dni: "",
      email: "",
      numeroWhatsapp: "",
      ciudad: "",
      rol: "Asistente",
      gradoEstudio: "",
      capituloPmi: "",
      idMiembroPmi: "",
      cuentaConCertificadoPmi: false,
    })
  }

  const handleClose = () => {
    setSearchTerm("")
    setSelectedParticipant(null)
    setFilteredParticipants([])
    resetForm()
    setRolAsistencia("ASISTENTE") // Resetear rol de asistencia
    setActiveTab("search")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-500" />
            Agregar Participante al Evento
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "search" | "create")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Buscar Existente</TabsTrigger>
            <TabsTrigger value="create">Crear Nuevo</TabsTrigger>
          </TabsList>

          {/* Pestaña: Buscar Participante Existente */}
          <TabsContent value="search" className="space-y-4">
          {/* Buscador */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar participante</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre, DNI o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            {loading && <p className="text-sm text-gray-500">Cargando participantes...</p>}
          </div>

          {/* Selector de Rol de Asistencia */}
          <div className="space-y-2">
            <Label htmlFor="rol-asistencia">Rol en el Evento</Label>
            <Select value={rolAsistencia} onValueChange={(value) => setRolAsistencia(value as RolParticipante)}>
              <SelectTrigger id="rol-asistencia" className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Este rol se asignará al participante para este evento específico</p>
          </div>

          {/* Participante seleccionado */}
          {selectedParticipant && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-green-900">
                    {selectedParticipant.apellidoPaterno} {selectedParticipant.apellidoMaterno}{" "}
                    {selectedParticipant.nombres}
                  </p>
                  <p className="text-sm text-green-700">DNI: {selectedParticipant.dni}</p>
                  <p className="text-sm text-green-700">Email: {selectedParticipant.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedParticipant(null)}
                  className="text-green-700 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {!selectedParticipant && searchTerm.trim() !== "" && (
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredParticipants.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {allParticipants.length === 0
                    ? "No hay participantes disponibles"
                    : "No se encontraron participantes con ese criterio"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredParticipants.map((participant) => (
                    <button
                      key={participant.id}
                      onClick={() => setSelectedParticipant(participant)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium">
                        {participant.apellidoPaterno} {participant.apellidoMaterno} {participant.nombres}
                      </p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>DNI: {participant.dni}</span>
                        <span>•</span>
                        <span className="truncate">{participant.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleAddParticipant}
              disabled={!selectedParticipant || adding}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {adding ? "Agregando..." : "Agregar al Evento"}
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </TabsContent>

        {/* Pestaña: Crear Nuevo Participante */}
        <TabsContent value="create" className="space-y-4">
          {/* Selector de Rol de Asistencia */}
          <div className="space-y-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <Label htmlFor="rol-asistencia-crear">Rol en el Evento *</Label>
            <Select value={rolAsistencia} onValueChange={(value) => setRolAsistencia(value as RolParticipante)}>
              <SelectTrigger id="rol-asistencia-crear" className="w-full bg-white">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-orange-700">Este rol se asignará al participante para este evento específico</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                value={newParticipant.nombres}
                onChange={(e) => setNewParticipant({ ...newParticipant, nombres: e.target.value })}
                placeholder="Juan Carlos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
              <Input
                id="apellidoPaterno"
                value={newParticipant.apellidoPaterno}
                onChange={(e) => setNewParticipant({ ...newParticipant, apellidoPaterno: e.target.value })}
                placeholder="Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
              <Input
                id="apellidoMaterno"
                value={newParticipant.apellidoMaterno}
                onChange={(e) => setNewParticipant({ ...newParticipant, apellidoMaterno: e.target.value })}
                placeholder="García"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                value={newParticipant.dni}
                onChange={(e) => setNewParticipant({ ...newParticipant, dni: e.target.value })}
                placeholder="12345678"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroWhatsapp">WhatsApp</Label>
              <Input
                id="numeroWhatsapp"
                value={newParticipant.numeroWhatsapp}
                onChange={(e) => setNewParticipant({ ...newParticipant, numeroWhatsapp: e.target.value })}
                placeholder="+51 999 999 999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={newParticipant.ciudad}
                onChange={(e) => setNewParticipant({ ...newParticipant, ciudad: e.target.value })}
                placeholder="Lima"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Input
                id="rol"
                disabled
                value={newParticipant.rol}
                onChange={(e) => setNewParticipant({ ...newParticipant, rol: e.target.value })}
                placeholder="Asistente"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="gradoEstudio">Grado de Estudio</Label>
              <Input
                id="gradoEstudio"
                value={newParticipant.gradoEstudio}
                onChange={(e) => setNewParticipant({ ...newParticipant, gradoEstudio: e.target.value })}
                placeholder="Universitario, Maestría, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capituloPmi">Capítulo PMI</Label>
              <Input
                id="capituloPmi"
                value={newParticipant.capituloPmi}
                onChange={(e) => setNewParticipant({ ...newParticipant, capituloPmi: e.target.value })}
                placeholder="Lima, Perú"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idMiembroPmi">ID Miembro PMI</Label>
              <Input
                id="idMiembroPmi"
                value={newParticipant.idMiembroPmi}
                onChange={(e) => setNewParticipant({ ...newParticipant, idMiembroPmi: e.target.value })}
                placeholder="123456"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cuentaConCertificadoPmi"
                  checked={newParticipant.cuentaConCertificadoPmi}
                  onChange={(e) => setNewParticipant({ ...newParticipant, cuentaConCertificadoPmi: e.target.checked })}
                  className="cursor-pointer"
                />
                <Label htmlFor="cuentaConCertificadoPmi" className="cursor-pointer">
                  Cuenta con certificación PMI
                </Label>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">* Campos obligatorios</p>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreateAndAddParticipant}
              disabled={adding}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {adding ? "Creando..." : "Crear y Agregar al Evento"}
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </DialogContent>
    </Dialog>
  )
}
