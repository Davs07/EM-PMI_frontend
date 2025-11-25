"use client"

import { EventsManager } from "@/components/events-manager"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, Activity, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Hola, Administrador</h1>
              <p className="text-muted-foreground">Bienvenido al panel de gestión de eventos del PMI.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-card px-4 py-2 rounded-full border shadow-sm">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString("es-PE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-card border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Activos</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">+2 desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-card border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Asistentes</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground mt-1">+180 nuevos registros</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-card border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Evento</CardTitle>
                <CalendarDays className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">PMI Global Summit</div>
                <p className="text-xs text-muted-foreground mt-1">En 3 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
            <EventsManager />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
