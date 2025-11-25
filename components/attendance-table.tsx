"use client"

import { CheckCircle2, Circle, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Participante } from "./ui/data/model"
import { cn } from "@/lib/utils"

interface Attendee {
  id: number
  dni: string
  fullName: string
  email: string
  registrationDate: string
  status: "present" | "absent"
  type: string
  participante: Participante
  [key: string]: any
}

interface AttendanceTableProps {
  attendees: Attendee[]
  onToggleAttendance: (id: number) => void
  onViewDetails: (attendee: Attendee) => void
}

export function AttendanceTable({ attendees, onToggleAttendance, onViewDetails }: AttendanceTableProps) {
  const presentCount = attendees.filter((a) => a.status === "present").length
  const absentCount = attendees.filter((a) => a.status === "absent").length
  const attendanceRate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800 backdrop-blur-sm">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Presentes</div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{presentCount}</div>
        </div>
        <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800 backdrop-blur-sm">
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Ausentes</div>
          <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{absentCount}</div>
        </div>
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800 backdrop-blur-sm">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Tasa de Asistencia</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{attendanceRate}%</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">DNI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participante</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registro</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <MoreHorizontal className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p>No se encontraron participantes</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendees.map((attendee) => (
                  <tr
                    key={attendee.id}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      attendee.status === "present" ? "bg-emerald-50/30 dark:bg-emerald-900/5" : ""
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-medium font-mono text-foreground/80">{attendee.dni}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{attendee.fullName}</span>
                        <span className="text-xs text-muted-foreground">{attendee.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{attendee.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{attendee.registrationDate}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggleAttendance(attendee.id)}
                        className={cn(
                          "inline-flex items-center justify-center p-1 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          attendee.status === "present"
                            ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={attendee.status === "present" ? "Marcar como ausente" : "Marcar como presente"}
                      >
                        {attendee.status === "present" ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => onViewDetails(attendee)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

