"use client"

import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Sparkles } from "lucide-react"
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
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Section - Clean & Corporate */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Listado de Eventos</h3>
          <p className="text-muted-foreground text-sm">
            Explora y gestiona las próximas actividades programadas.
          </p>
        </div>
        <Button
          onClick={onCreateEvent}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-full px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay eventos creados aún</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Comienza creando tu primer evento para gestionar asistentes, ponentes y certificados.
          </p>
          <Button onClick={onCreateEvent} variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Plus className="w-4 h-4 mr-2" />
            Crear mi primer evento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="animate-scale-in">
              <EventCard
                event={event}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onClick={onSelectEvent}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

