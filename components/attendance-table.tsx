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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-4 border border-green-700/50">
          <div className="text-sm text-green-400 font-medium">Presentes</div>
          <div className="text-2xl font-bold text-green-300">{presentCount}</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-4 border border-red-700/50">
          <div className="text-sm text-red-400 font-medium">Ausentes</div>
          <div className="text-2xl font-bold text-red-300">{absentCount}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-4 border border-blue-700/50">
          <div className="text-sm text-blue-400 font-medium">Tasa de Asistencia</div>
          <div className="text-2xl font-bold text-blue-300">{attendanceRate}%</div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Apellidos y nombres</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Correo de google</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-200">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {attendees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                  No hay asistentes que coincidan con los filtros
                </td>
              </tr>
            ) : (
              attendees.map((attendee) => (
                <tr
                  key={attendee.id}
                  className={`border-b border-slate-700 transition-colors ${
                    attendee.status === "present" ? "bg-green-900/20 hover:bg-green-900/30" : "hover:bg-slate-700/30"
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">{attendee.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{attendee.email}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleAttendance(attendee.id)}
                      className="inline-flex items-center justify-center transition-transform hover:scale-110"
                      title={attendee.status === "present" ? "Marcar como ausente" : "Marcar como presente"}
                    >
                      {attendee.status === "present" ? (
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-600" />
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
