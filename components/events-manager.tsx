"use client"

import { useState, useEffect } from "react"
import { EventsGallery } from "./events-gallery"
import { EventFormModal } from "./event-form-modal"
import type { Event } from "@/types/event"
import { eventService, type PaginatedResponse } from "@/services/event-service"
import { useRouter } from "next/navigation"
import { Pagination } from "./ui/pagination"

export function EventsManager() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(9) // 9 eventos por página (3x3 grid)
  const router = useRouter()

  // Cargar eventos al montar el componente y cuando cambia la página
  useEffect(() => {
    loadEvents()
  }, [currentPage])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading events with pagination:', { currentPage, pageSize })
      const data = await eventService.getAll(currentPage, pageSize)

      console.log('Received data from API:', data)
      console.log('Has content property?', 'content' in data)

      // Verificar si es una respuesta paginada
      if ('content' in data) {
        const paginatedData = data as PaginatedResponse<Event>
        console.log('Paginated response detected:', {
          totalPages: paginatedData.totalPages,
          totalElements: paginatedData.totalElements,
          contentLength: paginatedData.content.length
        })
        setEvents(paginatedData.content)
        setTotalPages(paginatedData.totalPages)
        setTotalElements(paginatedData.totalElements)
      } else {
        // Respuesta sin paginación (backward compatibility)
        console.log('Non-paginated response, array length:', (data as Event[]).length)
        setEvents(data as Event[])
        setTotalPages(1)
        setTotalElements((data as Event[]).length)
      }
    } catch (err) {
      setError("Error al cargar los eventos. Por favor, intenta de nuevo.")
      console.error('Error loading events:', err)
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalElements={totalElements}
            />
          </div>
        )}
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
