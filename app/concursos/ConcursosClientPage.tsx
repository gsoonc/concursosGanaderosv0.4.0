"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Trophy, ArrowRight, Mountain } from "lucide-react"
import Link from "next/link"
import ContestCard from "@/components/ContestCard"
import { Logo } from "@/components/shared/logo"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ContestFilters } from "@/components/shared/contest-filters"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string | null
  fechaInicio: string
  fechaFin?: string
  fechaInicioRegistro?: string
  fechaFinRegistro?: string
  ubicacion?: string
  cuotaInscripcion?: number
  tipoGanado?: string[]
  isActive: boolean
  participantCount: number
  company: {
    id: string
    nombre: string
    logo?: string
    descripcion?: string
    ubicacion?: string
  }
  createdAt: string
}

async function getContests(): Promise<Contest[]> {
  try {
    const response = await fetch("/api/concursos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch contests:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.contests || []
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}

export default function ConcursosClientPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContests = async () => {
      const contestsData = await getContests()
      setContests(contestsData)
      setFilteredContests(contestsData)
      setLoading(false)
    }

    fetchContests()
  }, [])

  const handleFiltersChange = (filters: any) => {
    let filtered = [...contests]

    if (filters.animalType) {
      filtered = filtered.filter((contest) =>
        contest.tipoGanado?.some((tipo) => tipo.toLowerCase().includes(filters.animalType.toLowerCase())),
      )
    }

    if (filters.location) {
      filtered = filtered.filter((contest) => contest.ubicacion?.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.status) {
      const now = new Date()
      filtered = filtered.filter((contest) => {
        const startDate = new Date(contest.fechaInicio)
        const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null

        switch (filters.status) {
          case "próximos":
            return startDate > now
          case "en curso":
            return startDate <= now && (!endDate || endDate >= now)
          case "finalizados":
            return endDate && endDate < now
          case "inscripciones abiertas":
            return (
              contest.fechaInicioRegistro &&
              contest.fechaFinRegistro &&
              new Date() >= new Date(contest.fechaInicioRegistro) &&
              new Date() <= new Date(contest.fechaFinRegistro)
            )
          default:
            return true
        }
      })
    }

    setFilteredContests(filtered)
  }

  // Separar concursos por estado
  const activeContests = filteredContests.filter((contest) => {
    const now = new Date()
    const startDate = new Date(contest.fechaInicio)
    const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null

    return !endDate || endDate >= now
  })

  const finishedContests = filteredContests.filter((contest) => {
    const now = new Date()
    const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null

    return endDate && endDate < now
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-green-600 mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-gray-600">Cargando concursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Optimizado para móvil */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 text-white relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo centrado */}
            <div className="flex justify-center mb-6">
              <Logo className="text-white" size="lg" href={null} />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Concursos Ganaderos
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed px-4">
              Los mejores concursos ganaderos de Cajamarca y la región norte del Perú
            </p>

            {/* Información específica de Cajamarca */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mountain className="h-6 w-6" />
                <span className="text-lg font-semibold">Cajamarca - 2,750 msnm</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span>{contests.length} Concursos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{contests.reduce((acc, c) => acc + c.participantCount, 0)} Participantes</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span>{new Set(contests.map((c) => c.company.id)).size} Organizadores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />

        {/* Banner del clima */}
        {/* <WeatherBanner /> */}

        {contests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay concursos disponibles</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Actualmente no hay concursos ganaderos programados en Cajamarca. ¡Vuelve pronto para ver las próximas
              competencias!
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Filtros */}
            <ContestFilters
              onFiltersChange={handleFiltersChange}
              totalContests={contests.length}
              filteredCount={filteredContests.length}
            />

            {/* Concursos Activos */}
            {activeContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-1 h-8 bg-green-600 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Concursos Activos y Próximos</h2>
                  <Badge className="bg-green-600 text-white ml-2 px-3 py-1 text-sm font-bold">
                    {activeContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {activeContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}

            {/* Concursos Finalizados */}
            {finishedContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-1 h-8 bg-gray-400 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Concursos Finalizados</h2>
                  <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm font-bold">
                    {finishedContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {finishedContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}

            {/* Mensaje cuando no hay resultados filtrados */}
            {filteredContests.length === 0 && contests.length > 0 && (
              <div className="text-center py-16">
                <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">No se encontraron concursos</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  No hay concursos que coincidan con los filtros seleccionados. Intenta ajustar los criterios de
                  búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
