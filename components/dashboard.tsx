"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Scissors, Calendar, CalendarDays, User, ShoppingBag, DollarSign, Clock } from "lucide-react"
import StatsCards from "@/components/stats-cards"
import ProfessionalsTab from "@/components/tabs/professionals-tab"
import TreatmentsTab from "@/components/tabs/treatments-tab"
import AppointmentsTab from "@/components/tabs/appointments-tab"
import AgendaTab from "@/components/tabs/agenda-tab"
import ClientsTab from "@/components/tabs/clients-tab"
import ProductsTab from "@/components/tabs/products-tab"
import SalesTab from "@/components/tabs/sales-tab"
import { formatDateArgentina, getCurrentTimeArgentina, getCurrentDateArgentina } from "@/lib/date-utils"

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "agenda")
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
    seconds: "00"
  })

  // Actualizar la fecha y hora cada segundo
  useEffect(() => {
    const updateDateTime = () => {
      // Usar las funciones específicas para Argentina
      const now = new Date()
      
      // Ajustar la fecha a la zona horaria de Argentina (GMT-3)
      // Crear una fecha con el offset correcto para Argentina
      const argentinaDate = new Date(now.getTime() - (3 * 60 * 60 * 1000))
      const formattedDate = formatDateArgentina(argentinaDate)
      
      // Obtener la hora actual de Argentina con segundos
      const argentinaHours = (now.getUTCHours() - 3 + 24) % 24
      const argentinaMinutes = now.getUTCMinutes()
      const argentinaSeconds = now.getUTCSeconds()
      
      const formattedTime = `${String(argentinaHours).padStart(2, '0')}:${String(argentinaMinutes).padStart(2, '0')}`
      const formattedSeconds = String(argentinaSeconds).padStart(2, '0')
      
      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
        seconds: formattedSeconds
      })
    }

    // Actualizar inmediatamente
    updateDateTime()
    
    // Configurar intervalo para actualizar cada segundo
    const interval = setInterval(updateDateTime, 1000)
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">RESET-SOFT</h1>
            <span className="ml-4 text-sm text-muted-foreground">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm bg-slate-100 px-3 py-1 rounded-md shadow-sm">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">{currentDateTime.date}</span>
              <span className="mx-2 text-slate-400">|</span>
              <span className="font-medium">{currentDateTime.time}</span>
              <span className="text-xs text-slate-400 ml-1">{currentDateTime.seconds}</span>
              <span className="ml-1 text-xs text-slate-500">ARG</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <StatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-7 mb-6">
            <TabsTrigger value="professionals" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Profesionales</span>
            </TabsTrigger>
            <TabsTrigger value="treatments" className="flex items-center">
              <Scissors className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Tratamientos</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Turnos</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Ventas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            <ProfessionalsTab />
          </TabsContent>
          <TabsContent value="treatments">
            <TreatmentsTab />
          </TabsContent>
          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>
          <TabsContent value="agenda">
            <AgendaTab />
          </TabsContent>
          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="sales">
            <SalesTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RESET-SOFT - Sistema de Gestión de Centro de Estética
        </div>
      </footer>
    </div>
  )
}

