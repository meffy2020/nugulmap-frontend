"use client"

import { useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CurrentLocationButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCurrentLocation = async () => {
    setIsLoading(true)

    try {
      if (!navigator.geolocation) {
        alert("위치 서비스가 지원되지 않습니다.")
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log("[v0] Current location:", { latitude, longitude })
          // Here you would typically update the map center
          setIsLoading(false)
        },
        (error) => {
          console.error("[v0] Location error:", error)
          alert("현재 위치를 가져올 수 없습니다.")
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    } catch (error) {
      console.error("[v0] Location error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCurrentLocation}
      disabled={isLoading}
      size="icon"
      className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/90 hover:scale-105 transition-all duration-200 hover:shadow-xl"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-foreground" />
      ) : (
        <MapPin className="h-5 w-5 text-foreground" />
      )}
    </Button>
  )
}
