export interface Event {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  tipo: "PRESENCIAL" | "VIRTUAL" | "HIBRIDO"
  ubicacion?: string
  capacidadMaxima?: number
  brindaCertificado: boolean
  plantillaImagen?: string
  estadoEvento: "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO"
  createdAt?: string
  updatedAt?: string
}
