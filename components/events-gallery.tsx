"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventCard } from "./event-card"
import type { Event } from "@/types/event"

interface EventsGalleryProps {
  events: Event[]
  onCreateEvent: () => void
  onEditEvent: (event: Event) => void
  onDeleteEvent: (eventId: string) => void
  onSelectEvent: (event: Event) => void
}

export function EventsGallery({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onSelectEvent,
}: EventsGalleryProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1">Crea y administra tus eventos</p>
        </div>
        <Button onClick={onCreateEvent} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay eventos creados aún</p>
          <Button onClick={onCreateEvent} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Crear tu primer evento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onClick={onSelectEvent}
            />
          ))}
        </div>
      )}
    </div>
  )
}
