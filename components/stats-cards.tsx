import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, DollarSign } from "lucide-react"

export default function StatsCards() {
  // In a real application, these would be fetched from the API
  const todayAppointments = 12
  const totalIncome = 45600

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Turnos del Día</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalIncome.toLocaleString("es-AR")}</div>
          <p className="text-xs text-muted-foreground">Actualizado al {new Date().toLocaleDateString("es-AR")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

