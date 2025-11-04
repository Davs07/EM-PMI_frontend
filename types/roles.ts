/**
 * Tipos de roles que puede tener un participante en un evento
 * Deben coincidir con el enum RolParticipante del backend
 */
export type RolParticipante = "PONENTE" | "APOYADOR" | "ASISTENTE"

export const ROLES: { value: RolParticipante; label: string; description: string }[] = [
  {
    value: "ASISTENTE",
    label: "Asistente",
    description: "Participante regular del evento",
  },
  {
    value: "PONENTE",
    label: "Ponente",
    description: "Expositor o conferencista del evento",
  },
  {
    value: "APOYADOR",
    label: "Apoyador",
    description: "Personal de apoyo o staff del evento",
  },
]

export const getRolLabel = (rol: string): string => {
  const rolItem = ROLES.find((r) => r.value === rol)
  return rolItem?.label || rol
}

export const getRolDescription = (rol: string): string => {
  const rolItem = ROLES.find((r) => r.value === rol)
  return rolItem?.description || ""
}
