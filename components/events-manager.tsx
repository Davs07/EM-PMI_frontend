"use client"

import { useState, useEffect } from "react"
import { EventsGallery } from "./events-gallery"
import { EventFormModal } from "./event-form-modal"
import type { Event } from "@/types/event"
import { eventService } from "@/services/event-service"
import { useRouter } from "next/navigation"

export function EventsManager() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Cargar eventos al montar el componente
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventService.getAll()
      setEvents(data)
    } catch (err) {
      setError("Error al cargar los eventos. Por favor, intenta de nuevo.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowFormModal(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowFormModal(true)
  }

  const handleSaveEvent = async (event: Event) => {
    try {
      if (editingEvent) {
        // Actualizar evento existente
        await eventService.update(event.id, event)
      } else {
        // Crear nuevo evento
        await eventService.create(event)
      }
      // Recargar la lista de eventos desde el backend
      await loadEvents()
      setShowFormModal(false)
      setEditingEvent(null)
    } catch (err) {
      console.error("Error al guardar evento:", err)
      alert("Error al guardar el evento. Por favor, intenta de nuevo.")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        await eventService.delete(eventId)
        // Recargar la lista de eventos desde el backend
        await loadEvents()
      } catch (err) {
        console.error("Error al eliminar evento:", err)
        alert("Error al eliminar el evento. Por favor, intenta de nuevo.")
      }
    }
  }

  const handleSelectEvent = (event: Event) => {
    router.push(`/events/${event.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary/30 border-t-primary"></div>
        <p className="text-muted-foreground animate-pulse">Cargando eventos...</p>
      </div>
    )

  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EventsGallery
          events={events}
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <EventFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent || undefined}
      />
    </div>
  )
}

