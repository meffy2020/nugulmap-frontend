"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiService, type ZoneResponse } from "@/lib/api"

interface LocationMarker {
  id: number
  lat: number
  lng: number
  address: string
  description: string
  type: string
  region: string
  subtype: string
  size: string
  date: string
  user: string
}

export function MapContainer() {
  const [selectedMarker, setSelectedMarker] = useState<LocationMarker | null>(null)
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  const loadZones = async () => {
    try {
      setLoading(true)
      const zonesData = await apiService.getAllZones()
      console.log("[v0] Loaded zones from API:", zonesData)
      setZones(zonesData)
      setError(null)
    } catch (err) {
      console.error("[v0] Error loading zones:", err)
      setError("흡연구역 데이터를 불러오는데 실패했습니다.")
      // Fallback to sample data for demo
      setZones([
        {
          id: 1,
          region: "서울특별시 중구",
          type: "지정구역",
          subtype: "흡연부스",
          description: "명동역 근처 지정 흡연구역입니다. 실외 공간으로 환기가 잘 됩니다.",
          latitude: 37.5665,
          longitude: 126.978,
          size: "중형",
          date: "2024-01-15",
          address: "서울특별시 중구 명동길 26",
          user: "관리자",
          image: "",
        },
        {
          id: 2,
          region: "서울특별시 중구",
          type: "일반구역",
          subtype: "야외공간",
          description: "동대문디자인플라자 인근 흡연 공간입니다.",
          latitude: 37.57,
          longitude: 126.985,
          size: "대형",
          date: "2024-01-16",
          address: "서울특별시 중구 을지로 281",
          user: "사용자1",
          image: "",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadZones()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      const loadLeafletCSS = () => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          link.integrity =
            "sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }
      }

      loadLeafletCSS()

      // Dynamically import Leaflet to avoid SSR issues
      import("leaflet").then((L) => {
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        const mapInstance = L.map(mapRef.current!).setView([37.5665, 126.978], 13)

        mapInstance.zoomControl.remove()

        // Add OpenStreetMap tiles with dark theme
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(mapInstance)

        setMap(mapInstance)
      })
    }
  }, [map])

  useEffect(() => {
    if (map && zones.length > 0) {
      // Clear existing markers
      markers.forEach((marker) => marker.remove())

      // Add new markers from zones data
      const newMarkers = zones.map((zone) => {
        const customIcon = (window as any).L?.divIcon({
          html: `<div class="custom-marker">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#D97742" stroke="#2C2C2C" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
          className: "custom-div-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })

        const locationMarker: LocationMarker = {
          id: zone.id,
          lat: Number(zone.latitude),
          lng: Number(zone.longitude),
          address: zone.address,
          description: zone.description,
          type: zone.type,
          region: zone.region,
          subtype: zone.subtype,
          size: zone.size,
          date: zone.date,
          user: zone.user,
        }

        const marker = (window as any).L?.marker([zone.latitude, zone.longitude], { icon: customIcon })
          .addTo(map)
          .on("click", () => setSelectedMarker(locationMarker))

        return marker
      })

      setMarkers(newMarkers)
    }
  }, [map, zones])

  const handleZoneCreated = (newZone: ZoneResponse) => {
    setZones((prev) => [...prev, newZone])
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full z-10"
        style={{
          filter: "hue-rotate(20deg) saturate(0.8)",
        }}
      />

      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-foreground">지도 데이터를 불러오는 중...</div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md z-20">
          {error}
        </div>
      )}

      {/* Custom marker styles */}
      <style jsx>{`
        .custom-marker {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .custom-marker:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 0 8px rgba(217, 119, 66, 0.6));
        }
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>

      {/* Selected marker popup overlay */}
      {selectedMarker && (
        <div className="absolute bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Card className="mx-4 mb-4 bg-card/95 backdrop-blur-sm border-border shadow-xl transition-all duration-300 hover:shadow-2xl rounded-t-xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-card-foreground mb-1">주소</div>
                  <div className="text-sm text-muted-foreground mb-3">{selectedMarker.address}</div>
                  <div className="text-sm font-medium text-card-foreground mb-1">상세 설명</div>
                  <div className="text-sm text-muted-foreground mb-3">{selectedMarker.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>지역: {selectedMarker.region}</div>
                    <div>크기: {selectedMarker.size}</div>
                    <div>등록자: {selectedMarker.user}</div>
                    <div>등록일: {selectedMarker.date}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 hover:scale-110"
                  onClick={() => setSelectedMarker(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full transition-all duration-200 hover:bg-primary/30">
                  {selectedMarker.type}
                </span>
                <span className="text-xs px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full">
                  {selectedMarker.subtype}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
