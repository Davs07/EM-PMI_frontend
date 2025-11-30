"use client"
import { EventsManager } from "@/components/events-manager"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <EventsManager />
      </main>
    </ProtectedRoute>
  )
}
