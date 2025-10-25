"use client"

import Image from "next/image"

export function PMIHeader() {
  return (
    <header className="border-b bg-white shadow-sm bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={"PMI_logo.png"}
            alt="Logo"
            height={"96"}
            width={"96"}
          />
        
          <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-white">Project </span>
              <span className="text-xl text-white">Management</span>
              <span className="text-xl text-white">Institute</span>
          </div>
        </div>
      </div>
    </header>
  )
}
