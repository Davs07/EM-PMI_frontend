"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Camera } from "lucide-react"
import { attendanceService } from "@/services/attendance-service"

interface QRScannerProps {
  onClose: () => void
  onScan: (participanteId: number, success: boolean) => void
  attendees: Array<{ id: number; fullName: string; dni: string }>
}

export function QRScanner({ onClose, onScan, attendees }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{
    asistenciaId: number
    participanteId: number
    nombre: string
    dni: string
    timestamp: string
    showUntil: number
  }>>([])

  // Limpiar automáticamente los registros antiguos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setScanHistory(prev => prev.filter(scan => scan.showUntil > now))
    }, 1000) // Revisar cada segundo

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!cameraActive) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setMessage({ type: "error", text: "No se pudo acceder a la cámara" })
        setCameraActive(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [cameraActive])

  /**
   * Captura una imagen del video y la envía al backend para validar el QR
   */
  const captureAndScanQR = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setMessage({ type: "error", text: "Cámara no disponible" })
      return
    }

    setScanning(true)
    setMessage(null)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("No se pudo obtener el contexto del canvas")
      }

      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Capturar el frame actual del video
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir el canvas a Blob (archivo de imagen)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      })

      if (!blob) {
        throw new Error("No se pudo capturar la imagen")
      }

      // Crear un archivo desde el blob
      const imageFile = new File([blob], "qr-scan.jpg", { type: "image/jpeg" })

      // Enviar al backend para decodificar y registrar asistencia
      const asistenciaRegistrada = await attendanceService.registerAttendanceByQR(imageFile)

      // Buscar información del participante
      const participante = attendees.find(a => a.id === asistenciaRegistrada.participanteId)
      const nombreParticipante = participante?.fullName || "Nombre no disponible"
      const dniParticipante = participante?.dni || "DNI no disponible"

      // Agregar al historial de escaneos (se mostrará por 3 segundos)
      const nuevoScaneo = {
        asistenciaId: asistenciaRegistrada.id,
        participanteId: asistenciaRegistrada.participanteId,
        nombre: nombreParticipante,
        dni: dniParticipante,
        timestamp: new Date().toLocaleTimeString("es-ES", { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit" 
        }),
        showUntil: Date.now() + 3000 // Desaparecerá después de 3 segundos
      }

      setScanHistory(prev => [nuevoScaneo, ...prev])

      // Éxito: mostrar mensaje
      setMessage({
        type: "success",
        text: "¡Asistencia registrada correctamente!",
      })

      // Notificar al componente padre para que actualice la lista
      onScan(asistenciaRegistrada.participanteId, true)

      console.log(`✅ Asistencia registrada:`, nuevoScaneo)
    } catch (error: any) {
      console.error("Error al escanear QR:", error)
      
      let errorMessage = "Error al procesar el código QR"
      if (error.message.includes("ya fue registrada")) {
        errorMessage = "⚠️ Esta asistencia ya fue registrada previamente"
      } else if (error.message.includes("No se encontró")) {
        errorMessage = "❌ Código QR no válido o no encontrado"
      }

      setMessage({ type: "error", text: errorMessage })
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } finally {
      setScanning(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <span>Escanear Código QR</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Historial de escaneos exitosos */}
          {scanHistory.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700">Asistencias Registradas:</h3>
              {scanHistory.map((scan, index) => (
                <div
                  key={`${scan.asistenciaId}-${index}`}
                  className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">
                      {scan.nombre}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-green-700">
                      <span>DNI: {scan.dni}</span>
                      <span>•</span>
                      <span>Hora: {scan.timestamp}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-green-600">
                      <span>ID Asistencia: {scan.asistenciaId}</span>
                      <span>•</span>
                      <span>ID Participante: {scan.participanteId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje de error temporal */}
          {message && message.type === "error" && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-red-50 border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{message.text}</p>
              </div>
            </div>
          )}

          {/* Vista de la cámara */}
          {cameraActive ? (
            <div className="space-y-3">
              <div className="bg-black rounded-lg overflow-hidden aspect-square relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Marco de guía para el QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-orange-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Apunta la cámara al código QR del participante
              </p>

              {/* Canvas oculto para capturar frames */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-orange-500" />
              <p>No se pudo acceder a la cámara</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={captureAndScanQR}
              disabled={!cameraActive || scanning}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {scanning ? "Procesando..." : "Escanear QR"}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cerrar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Presiona "Escanear QR" cuando el código esté visible en el marco
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
