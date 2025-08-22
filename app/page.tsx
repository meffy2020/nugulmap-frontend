"use client"

import { useState, useRef } from "react"
import { MapContainer } from "@/components/map-container"
import { FloatingActionButton } from "@/components/floating-action-button"
import { AddLocationModal } from "@/components/add-location-modal"
import { FloatingUserProfile } from "@/components/floating-user-profile"
import { CurrentLocationButton } from "@/components/current-location-button"

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const mapRef = useRef<{ handleZoneCreated: (zone: any) => void }>(null)

  const handleZoneCreated = (newZone: any) => {
    console.log("[v0] New zone created, updating map:", newZone)
    if (mapRef.current?.handleZoneCreated) {
      mapRef.current.handleZoneCreated(newZone)
    }
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden relative">
      <MapContainer ref={mapRef} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 pointer-events-auto">
          <FloatingUserProfile />
        </div>

        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <CurrentLocationButton />
        </div>

        <div className="absolute bottom-6 right-6 pointer-events-auto">
          <FloatingActionButton onClick={() => setIsModalOpen(true)} />
        </div>
      </div>

      <AddLocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onZoneCreated={handleZoneCreated} />
    </div>
  )
}
