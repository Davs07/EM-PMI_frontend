"use client"

import { EventsManager } from "@/components/events-manager"
import { Header } from "@/components/layout/header"
import { CalendarDays, Users, Activity, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Hola, Administrador</h1>
              <p className="text-muted-foreground">Bienvenido al panel de gestión de eventos del PMI.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-full border shadow-sm">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString("es-PE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Eventos Activos */}
            <div className="group relative flex flex-col justify-between p-6 rounded-[2rem] border border-gray-200 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 uppercase tracking-wide group-hover:text-primary group-hover:border-primary/20 transition-colors">
                    Eventos Activos
                  </span>
                  <div className="p-2 border border-primary rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 tracking-tight">12</div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    +2 eventos registrados desde el mes pasado
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Total Asistentes */}
            <div className="group relative flex flex-col justify-between p-6 rounded-[2rem] border border-gray-200 hover:border-secondary/20 transition-all duration-300 hover:shadow-lg">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 uppercase tracking-wide group-hover:text-secondary group-hover:border-secondary/20 transition-colors">
                    Total Asistentes
                  </span>
                  <div className="p-2 border border-secondary rounded-full text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 tracking-tight">2,350</div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    +180 nuevos registros esta semana
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Próximo Evento */}
            <div className="group relative flex flex-col justify-between p-6 rounded-[2rem] border border-gray-200 hover:border-orange-500/20 transition-all duration-300 hover:shadow-lg">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 uppercase tracking-wide group-hover:text-orange-600 group-hover:border-orange-200 transition-colors">
                    Próximo Evento
                  </span>
                  <div className="p-2 border border-orange-500 rounded-full text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900 tracking-tight line-clamp-2">
                    PMI Global Summit 2024
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En 3 días
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
            <EventsManager />
        </div>
      </main>

    </div>
  )
}
