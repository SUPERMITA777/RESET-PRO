"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Scissors, Calendar, CalendarDays, User, ShoppingBag, DollarSign, Settings, Clock, BarChart } from "lucide-react"
import ProfessionalsTab from "@/components/tabs/professionals-tab"
import TreatmentsTab from "@/components/tabs/treatments-tab"
import AppointmentsTab from "@/components/tabs/appointments-tab"
import AgendaTab from "@/components/tabs/agenda-tab"
import ClientsTab from "@/components/tabs/clients-tab"
import ProductsTab from "@/components/tabs/products-tab"
import AdminTab from "@/components/tabs/sales-tab"
import SettingsTab from "@/components/tabs/settings-tab"
import ReportsTab from "@/components/tabs/reports-tab"
import { formatDateArgentina, getCurrentTimeArgentina, getCurrentDateArgentina } from "@/lib/date-utils"
import { toast } from 'sonner'

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "agenda")
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
    seconds: "00"
  })
  const [logo, setLogo] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Actualizar la fecha y hora cada segundo
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const argentinaDate = new Date(now.getTime() - (3 * 60 * 60 * 1000)) // Ajustar a UTC-3
      const formattedDate = formatDateArgentina(argentinaDate)
      const argentinaHours = (argentinaDate.getUTCHours() + 24) % 24
      const argentinaMinutes = argentinaDate.getUTCMinutes()
      const formattedTime = `${String(argentinaHours).padStart(2, '0')}:${String(argentinaMinutes).padStart(2, '0')}`

      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
        seconds: String(argentinaDate.getUTCSeconds()).padStart(2, '0')
      })
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedLogo = localStorage.getItem("logo");
    if (savedLogo) {
        setLogo(savedLogo);
    }

    const savedBackgroundColor = localStorage.getItem("backgroundColor");
    if (savedBackgroundColor) {
        // Aplicar el color directamente al body como respaldo
        document.body.style.backgroundColor = savedBackgroundColor;
        
        // Convertir el color hexadecimal a HSL para Tailwind
        const r = parseInt(savedBackgroundColor.slice(1, 3), 16);
        const g = parseInt(savedBackgroundColor.slice(3, 5), 16);
        const b = parseInt(savedBackgroundColor.slice(5, 7), 16);
        
        // Aplicar el color directamente al elemento :root
        document.documentElement.style.setProperty('--background', `${r} ${g} ${b}`);
    }
  }, []);

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      if (response.ok) {
        // Limpiar localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Redirigir al login
        router.push('/login')
        
        toast.success('Sesión cerrada exitosamente')
      } else {
        toast.error('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Error de logout:', error)
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {logo && <img src={logo} alt="Logo" className="h-10 mr-2" />}
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-9 mb-6">
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
              <span className="hidden md:inline">ADMINISTRACION</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Configuración</span>
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
            <AdminTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab logo={logo} setLogo={setLogo} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RESET-SOFT - Sistema de Gestión de Centro de Estética - Vers. 0.1
        </div>
      </footer>
    </div>
  )
}

