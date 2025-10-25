"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttendeeDetailsModalProps {
  attendee: any
  isOpen: boolean
  onClose: () => void
}

export function AttendeeDetailsModal({ attendee, isOpen, onClose }: AttendeeDetailsModalProps) {
  if (!isOpen || !attendee) return null

  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return (
        <div key={label} className="grid grid-cols-3 gap-4 py-2 border-b">
          <span className="font-medium text-gray-700">{label}:</span>
          <span className="col-span-2 text-gray-400 italic">No especificado</span>
        </div>
      )
    }
    return (
      <div key={label} className="grid grid-cols-3 gap-4 py-2 border-b">
        <span className="font-medium text-gray-700">{label}:</span>
        <span className="col-span-2 text-gray-900">{String(value)}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Detalles del Asistente</h2>
          <button onClick={onClose} className="text-white hover:bg-purple-700 p-2 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">Información Personal</h3>
            <div className="space-y-2">
              {renderField("DNI", attendee.dni)}
              {renderField("Nombre y Apellidos", attendee.fullName)}
              {renderField("Email", attendee.email)}
              {renderField("Teléfono", attendee.phone)}
              {renderField("Marca Temporal (Registro)", attendee.registrationDate)}
              {renderField("Ciudad", attendee.city)}
            </div>
          </div>

          {/* Información de Registro */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">Información de Registro</h3>
            <div className="space-y-2">
              {renderField("Rol", attendee.role)}
              {renderField("Modalidad", attendee.modality)}
              {renderField("Programa de Estudios", attendee.studyProgram)}
              {renderField("Institución Educativa", attendee.educationalInstitution)}
              {renderField("Link de Carnet de Estudiante", attendee.studentCardLink)}
            </div>
          </div>

          {/* Información PMI */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">Información PMI</h3>
            <div className="space-y-2">
              {renderField("Capítulo de PMI en Perú", attendee.pmiChapter)}
              {renderField("ID de Miembro PMI", attendee.pmiMemberId)}
              {renderField("Certificación Internacional PMI", attendee.pmiCertification ? "Sí" : "No")}
            </div>
          </div>

          {/* Información de Pago */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">Información de Pago</h3>
            <div className="space-y-2">
              {renderField("Comprobante de Pago", attendee.paymentVoucher)}
              {renderField("RUC", attendee.ruc)}
              {renderField("Link del Comprobante", attendee.paymentVoucherLink)}
            </div>
          </div>

          {/* Preferencias */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">Preferencias</h3>
            <div className="space-y-2">
              {renderField("Desea Recibir Información de Eventos", attendee.receiveEventInfo ? "Sí" : "No")}
              {renderField("Autoriza el Uso de sus Datos", attendee.authorizeDataUsage ? "Sí" : "No")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t flex justify-end gap-2">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
