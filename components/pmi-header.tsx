"use client"

export function PMIHeader() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {/* P Letter */}
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            {/* Orange circles */}
            <div className="flex gap-0.5">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            {/* Cyan and Purple */}
            <div className="flex gap-0.5">
              <div className="w-4 h-4 bg-cyan-500"></div>
              <div className="w-4 h-4 bg-purple-600 transform -skew-x-12"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-black">Project Management</span>
            <span className="text-lg font-bold text-black">Institute</span>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Sistema de Control de Asistencia</p>
        </div>
      </div>
    </header>
  )
}
