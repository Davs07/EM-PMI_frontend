"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import type { Event } from "@/types/event"

interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
  onClick: (event: Event) => void
}

export function EventCard({ event, onEdit, onDelete, onClick }: EventCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "PRESENCIAL":
        return "bg-blue-100 text-blue-800"
      case "VIRTUAL":
        return "bg-purple-100 text-purple-800"
      case "HIBRIDO":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return "bg-green-100 text-green-800"
      case "EN_CURSO":
        return "bg-blue-100 text-blue-800"
      case "FINALIZADO":
        return "bg-gray-100 text-gray-800"
      case "CANCELADO":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => onClick(event)}
    >
      {event.plantillaImagen && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={event.plantillaImagen || "/placeholder.svg"}
            alt={event.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg text-purple-700">{event.nombre}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {formatDate(event.fechaInicio)} - {formatDate(event.fechaFin)}
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(event.tipo)}`}>{event.tipo}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(event.estadoEvento)}`}>
            {event.estadoEvento}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{event.descripcion}</p>
        {event.ubicacion && <p className="text-xs text-gray-500 mt-2">📍 {event.ubicacion}</p>}
      </CardContent>
      <div className="px-6 pb-4 pt-2 border-t flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(event)
          }}
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(event.id)
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </Card>
  )
}
