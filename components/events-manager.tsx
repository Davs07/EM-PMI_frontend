"use client"

import { useState } from "react"
import { EventsGallery } from "./events-gallery"
import { EventFormModal } from "./event-form-modal"
import { EventDetailView } from "./event-detail-view"
import type { Event } from "@/types/event"

export function EventsManager() {
  const [view, setView] = useState<"gallery" | "detail">("gallery")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      nombre: "VI Congreso Internacional de Dirección de Proyectos",
      descripcion: "Congreso internacional enfocado en las mejores prácticas de dirección de proyectos",
      fechaInicio: "2025-11-07T09:00",
      fechaFin: "2025-11-08T18:00",
      tipo: "HIBRIDO",
      ubicacion: "Trujillo, Perú",
      capacidadMaxima: 500,
      brindaCertificado: true,
      plantillaImagen: "/congreso-internacional-proyectos.jpg",
      estadoEvento: "PROGRAMADO",
    },
    {
      id: "2",
      nombre: "Webinar: Gestión Ágil de Proyectos",
      descripcion: "Sesión virtual sobre metodologías ágiles en la gestión de proyectos",
      fechaInicio: "2025-11-15T14:00",
      fechaFin: "2025-11-15T16:00",
      tipo: "VIRTUAL",
      ubicacion: "",
      capacidadMaxima: 1000,
      brindaCertificado: true,
      plantillaImagen: "/webinar-agil.jpg",
      estadoEvento: "PROGRAMADO",
    },
    {
      id: "3",
      nombre: "Taller Presencial: Liderazgo en Proyectos",
      descripcion: "Taller práctico sobre liderazgo y gestión de equipos en proyectos",
      fechaInicio: "2025-11-20T09:00",
      fechaFin: "2025-11-20T17:00",
      tipo: "PRESENCIAL",
      ubicacion: "Lima, Perú",
      capacidadMaxima: 100,
      brindaCertificado: true,
      plantillaImagen: "/taller-liderazgo.jpg",
      estadoEvento: "PROGRAMADO",
    },
  ])

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowFormModal(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowFormModal(true)
  }

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === event.id ? event : e)))
    } else {
      setEvents([...events, event])
    }
    setShowFormModal(false)
    setEditingEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      setEvents(events.filter((e) => e.id !== eventId))
    }
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setView("detail")
  }

  const handleBackToGallery = () => {
    setView("gallery")
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {view === "gallery" ? (
        <div className="container mx-auto px-4 py-8">
          <EventsGallery
            events={events}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      ) : selectedEvent ? (
        <div className="container mx-auto px-4 py-8">
          <EventDetailView event={selectedEvent} onBack={handleBackToGallery} onEdit={handleEditEvent} />
        </div>
      ) : null}

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
