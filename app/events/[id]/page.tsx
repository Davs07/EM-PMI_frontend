"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Users, Edit2, ArrowRight, PlayCircle, FileText } from "lucide-react"
import { EventDashboard } from "@/components/event-dashboard"
import { EventFormModal } from "@/components/event-form-modal"
import { eventService } from "@/services/event-service"
import type { Event } from "@/types/event"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/header"

export default function EventPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        if (id) {
            loadEvent()
        }
    }, [id])

    const loadEvent = async () => {
        try {
            setLoading(true)
            const data = await eventService.getById(id)
            setEvent(data)
        } catch (err) {
            setError("Error al cargar el evento")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateEvent = async (updatedEvent: Event) => {
        try {
            await eventService.update(updatedEvent.id, updatedEvent)
            await loadEvent()
            setShowEditModal(false)
        } catch (err) {
            console.error("Error al actualizar evento:", err)
            alert("Error al guardar los cambios")
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary/30 border-t-primary"></div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-muted-foreground">{error || "Evento no encontrado"}</p>
                <Button onClick={() => router.push("/")} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                </Button>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Header />

            {/* Hero Section - Purple Banner */}
            <section className="bg-gradient-to-r from-[#2A0A55] via-[#3d1471] to-[#2A0A55] text-white py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex-1 max-w-4xl">
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                                {event.nombre}
                            </h1>

                            {/* Description */}
                            <p className="text-white/80 text-lg mb-6 leading-relaxed max-w-2xl">
                                {event.descripcion}
                            </p>

                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white uppercase tracking-wide">
                                    {event.tipo}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white uppercase tracking-wide">
                                    {event.estadoEvento}
                                </span>
                                {event.brindaCertificado && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white uppercase tracking-wide">
                                        Con Certificado
                                    </span>
                                )}
                            </div>

                            {/* Key Details Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                {/* Start Date */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-white/60 font-medium uppercase tracking-wide text-xs mb-0.5">Inicio</p>
                                        <p className="text-white font-semibold">{formatDate(event.fechaInicio)}</p>
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-white/60 font-medium uppercase tracking-wide text-xs mb-0.5">Fin</p>
                                        <p className="text-white font-semibold">{formatDate(event.fechaFin)}</p>
                                    </div>
                                </div>

                                {/* Capacity */}
                                {event.capacidadMaxima && (
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-white/60 font-medium uppercase tracking-wide text-xs mb-0.5">Capacidad</p>
                                            <p className="text-white font-semibold">{event.capacidadMaxima} personas</p>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                {event.ubicacion && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-white/60 font-medium uppercase tracking-wide text-xs mb-0.5">Ubicación</p>
                                            <p className="text-white font-semibold truncate max-w-[150px]" title={event.ubicacion}>{event.ubicacion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Button (Top Right in Hero) */}
                        <Button
                            onClick={() => setShowEditModal(true)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                </div>
            </section>

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Main Content: Dashboard */}
                <EventDashboard eventId={event.id} />
            </main >

            <EventFormModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdateEvent}
                initialEvent={event}
            />
        </div >
    )
}
