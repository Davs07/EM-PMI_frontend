"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Edit2, Trash2 } from "lucide-react"
import type { Event } from "@/types/event"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
  onClick?: (event: Event) => void
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {


  return (
    <Link href={`/events/${event.id}`}>
      <Card className={cn(
        "group relative overflow-hidden border-0 cursor-pointer h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-[2rem]",
        // Dynamic backgrounds based on event type
        event.tipo === 'PRESENCIAL' && "bg-[#001f3f] text-white", // Deep Navy
        event.tipo === 'VIRTUAL' && "bg-[#2a0a55] text-white", // Deep Purple
        event.tipo === 'HIBRIDO' && "bg-[#fdf6e3] text-foreground", // Beige/Cream
        !['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'].includes(event.tipo) && "bg-white dark:bg-card text-foreground" // Default
      )}>
        {/* Background Gradients/Decorations */}
        {event.tipo === 'PRESENCIAL' && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        )}
        {event.tipo === 'VIRTUAL' && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        )}
        {event.tipo === 'HIBRIDO' && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        )}

        <CardContent className="flex-1 p-8 flex flex-col relative z-10">
          {/* Top Badge */}
          <div className="mb-6">
            <span className={cn(
              "inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold border tracking-wide uppercase",
              event.tipo === 'HIBRIDO' ? "border-gray-800 text-gray-800" : "border-white/30 text-white"
            )}>
              {event.tipo}
            </span>
          </div>

          {/* Title */}
          <h3 className={cn(
            "text-3xl font-extrabold leading-tight mb-4 tracking-tight",
            event.tipo === 'HIBRIDO' ? "text-gray-900" : "text-white"
          )}>
            {event.nombre}
          </h3>

          {/* Description */}
          <p className={cn(
            "text-sm leading-relaxed line-clamp-3 mb-8 flex-1",
            event.tipo === 'HIBRIDO' ? "text-gray-600" : "text-gray-300"
          )}>
            {event.descripcion}
          </p>

          {/* Footer / Action */}
          <div className="mt-auto flex items-center justify-between gap-4">
            <Button
              className={cn(
                "rounded-full px-6 font-bold transition-all",
                event.tipo === 'HIBRIDO' ? "bg-[#1A1A1A] text-white hover:bg-black" : "bg-white text-black hover:bg-gray-100"
              )}
            >
              Ver Detalles
            </Button>

            {/* Edit/Delete Actions (Hover only) */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full h-10 w-10",
                  event.tipo === 'HIBRIDO' ? "hover:bg-black/5 text-gray-700" : "hover:bg-white/10 text-white"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(event)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full h-10 w-10",
                  event.tipo === 'HIBRIDO' ? "hover:bg-red-50 text-red-600" : "hover:bg-red-900/20 text-red-400"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(event.id)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

