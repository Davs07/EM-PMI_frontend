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
import { Footer } from "@/components/layout/footer"

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

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Left Column: Featured Card (Beige Gradient) */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FDF6E3] min-h-[500px] flex flex-col p-8 md:p-12 transition-all hover:shadow-xl">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />

                        {/* Badges */}
                        <div className="flex flex-wrap gap-3 mb-8 relative z-10">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-800/20 text-gray-800 uppercase tracking-wide">
                                {event.tipo}
                            </span>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-800/20 text-gray-800 uppercase tracking-wide">
                                {event.estadoEvento}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative z-10">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                                {event.nombre}
                            </h1>
                            <p className="text-lg text-gray-700 leading-relaxed max-w-lg mb-8">
                                {event.descripcion}
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="relative z-10 pt-8 mt-auto">
                            <Button
                                onClick={() => setShowEditModal(true)}
                                className="bg-[#2A0A55] hover:bg-[#1A0535] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-transform hover:scale-105"
                            >
                                <Edit2 className="w-5 h-5 mr-2" />
                                Editar Evento
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Sidebar & Details */}
                    <div className="flex flex-col gap-8">
                        {/* Secondary Card (White) */}
                        <div className="rounded-[2.5rem] border border-gray-200 bg-white p-8 md:p-10 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 uppercase tracking-wide">
                                    Detalles del Evento
                                </span>
                                {event.brindaCertificado && (
                                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                                        <PlayCircle className="w-3 h-3" />
                                        Certificado
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                                Información Clave
                            </h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-gray-50">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Fecha y Hora</p>
                                        <p className="text-gray-600 mt-1">{formatDate(event.fechaInicio)}</p>
                                    </div>
                                </div>

                                {event.ubicacion && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-2xl bg-gray-50">
                                            <MapPin className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Ubicación</p>
                                            <p className="text-gray-600 mt-1">{event.ubicacion}</p>
                                        </div>
                                    </div>
                                )}

                                {event.capacidadMaxima && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-2xl bg-gray-50">
                                            <Users className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Capacidad</p>
                                            <p className="text-gray-600 mt-1">{event.capacidadMaxima} Asistentes</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full py-6 text-lg font-bold"
                            >
                                Gestionar Asistencia
                            </Button>
                        </div>

                        {/* Related Items List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 px-2">Recursos Relacionados</h3>

                            <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 text-gray-500 uppercase tracking-wide">
                                        Documento
                                    </span>
                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">Guía del Participante</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="w-full h-px bg-gray-100" />

                            <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 text-gray-500 uppercase tracking-wide">
                                        Reporte
                                    </span>
                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">Estadísticas del Evento Anterior</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Section (Below Split Layout) */}
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Gestión</h2>
                        <div className="h-px flex-1 bg-gray-200 ml-8"></div>
                    </div>
                    <EventDashboard eventId={event.id} />
                </div>
            </main>

            <Footer />

            <EventFormModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdateEvent}
                initialEvent={event}
            />
        </div>
    )
}
