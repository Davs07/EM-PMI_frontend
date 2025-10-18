"use client"
import { CheckCircle2, Circle } from "lucide-react"

interface Attendee {
  id: number
  name: string
  email: string
  status: "present" | "absent"
  type: string
}

interface AttendanceTableProps {
  attendees: Attendee[]
  onToggleAttendance: (id: number) => void
}

export function AttendanceTable({ attendees, onToggleAttendance }: AttendanceTableProps) {
  const presentCount = attendees.filter((a) => a.status === "present").length
  const absentCount = attendees.filter((a) => a.status === "absent").length
  const attendanceRate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700 font-medium">Presentes</div>
          <div className="text-2xl font-bold text-green-900">{presentCount}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-700 font-medium">Ausentes</div>
          <div className="text-2xl font-bold text-red-900">{absentCount}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">Tasa de Asistencia</div>
          <div className="text-2xl font-bold text-blue-900">{attendanceRate}%</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold">Apellidos y nombres</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Correo de google</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {attendees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  No hay asistentes que coincidan con los filtros
                </td>
              </tr>
            ) : (
              attendees.map((attendee) => (
                <tr
                  key={attendee.id}
                  className={`border-b transition-colors ${
                    attendee.status === "present" ? "bg-green-50 hover:bg-green-100" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium">{attendee.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{attendee.email}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleAttendance(attendee.id)}
                      className="inline-flex items-center justify-center transition-transform hover:scale-110"
                      title={attendee.status === "present" ? "Marcar como ausente" : "Marcar como presente"}
                    >
                      {attendee.status === "present" ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
