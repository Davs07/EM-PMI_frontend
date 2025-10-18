"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  onClose: () => void
  onScan: (email: string) => void
}

export function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scannedData, setScannedData] = useState<string>("")
  const [cameraActive, setCameraActive] = useState(true)
  const [lastScanned, setLastScanned] = useState<{ email: string; time: number } | null>(null)
  const [manualMode, setManualMode] = useState(false)

  useEffect(() => {
    if (!cameraActive || manualMode) return

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
  }, [cameraActive, manualMode])

  const handleManualEntry = () => {
    if (scannedData.trim()) {
      const now = Date.now()
      setLastScanned({ email: scannedData, time: now })
      onScan(scannedData)
      setScannedData("")

      // Auto-close after 2 seconds if successful
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualEntry()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Escanear QR</span>
            {lastScanned && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {lastScanned && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Asistencia marcada</p>
                <p className="text-xs text-green-700">{lastScanned.email}</p>
              </div>
            </div>
          )}

          {cameraActive && !manualMode ? (
            <div className="space-y-3">
              <div className="bg-black rounded-lg overflow-hidden aspect-square relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-orange-500 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500"></div>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">Apunta la cámara al código QR</p>
              <Button onClick={() => setManualMode(true)} variant="outline" className="w-full bg-transparent">
                Ingresar manualmente
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ingresa el email del asistente:</label>
                <input
                  type="email"
                  value={scannedData}
                  onChange={(e) => setScannedData(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="correo@ejemplo.com"
                  autoFocus
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {cameraActive && (
                <Button onClick={() => setManualMode(false)} variant="outline" className="w-full bg-transparent">
                  Volver a escanear
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleManualEntry}
              disabled={!scannedData.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Marcar Asistencia
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
