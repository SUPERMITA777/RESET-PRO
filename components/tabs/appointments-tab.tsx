"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Calendar, ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Appointment {
  id: number
  date: string
  time: string
  status: "available" | "reserved" | "confirmed" | "completed" | "cancelled"
  professionalId: number | null
  professionalName: string | null
  treatmentId: number | null
  treatmentName: string | null
  clientId: number | null
  clientName: string | null
  clientPhone?: string | null
  box: string
  deposit: number
  price: number
  notes: string
  duration?: number
}

interface Professional {
  id: number
  name: string
  specialty: string
}

interface Treatment {
  id: number
  name: string
  duration: number
  price: number
}

interface Client {
  id: number
  name: string
  phone: string | null
  email: string | null
}

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    status: "",
    professionalId: "",
    treatmentId: "",
    clientId: "",
    box: "",
    deposit: "",
    price: "",
    notes: "",
    duration: "",
  })
  const [filterDate, setFilterDate] = useState<string>("")

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/appointments")
        if (appointmentsResponse.ok) {
          const data = await appointmentsResponse.json()
          setAppointments(data)
        }

        // Fetch professionals
        const professionalsResponse = await fetch("/api/professionals")
        if (professionalsResponse.ok) {
          const data = await professionalsResponse.json()
          setProfessionals(data)
        }

        // Fetch treatments
        const treatmentsResponse = await fetch("/api/treatments")
        if (treatmentsResponse.ok) {
          const data = await treatmentsResponse.json()
          setTreatments(data)
        }

        // Fetch clients
        const clientsResponse = await fetch("/api/clients")
        if (clientsResponse.ok) {
          const data = await clientsResponse.json()
          setClients(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0]
    setFormData({
      date: today,
      time: "09:00",
      status: "reserved",
      professionalId: "",
      treatmentId: "",
      clientId: "",
      box: "Box 1",
      deposit: "0",
      price: "0",
      notes: "",
      duration: "0",
    })
  }

  const handleOpenDialog = (appointment: Appointment | null = null) => {
    if (appointment) {
      setCurrentAppointment(appointment)
      setFormData({
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        professionalId: appointment.professionalId?.toString() || "",
        treatmentId: appointment.treatmentId?.toString() || "",
        clientId: appointment.clientId?.toString() || "",
        box: appointment.box,
        deposit: appointment.deposit.toString(),
        price: appointment.price.toString(),
        notes: appointment.notes,
        duration: appointment.duration?.toString() || "",
      })
    } else {
      setCurrentAppointment(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const appointmentData = {
      id: currentAppointment?.id,
      date: formData.date,
      time: formData.time,
      status: formData.status as Appointment["status"],
      professionalId: formData.professionalId ? Number.parseInt(formData.professionalId) : null,
      treatmentId: formData.treatmentId ? Number.parseInt(formData.treatmentId) : null,
      clientId: formData.clientId ? Number.parseInt(formData.clientId) : null,
      box: formData.box,
      deposit: Number.parseInt(formData.deposit) || 0,
      price: Number.parseInt(formData.price) || 0,
      notes: formData.notes,
      duration: Number.parseInt(formData.duration) || 0,
    }

    try {
      let response
      if (currentAppointment) {
        // Update existing appointment
        response = await fetch("/api/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        })
      } else {
        // Create new appointment
        response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        })
      }

      if (response.ok) {
        const updatedAppointment = await response.json()
        setAppointments(appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a))
        if (!currentAppointment) {
          setAppointments([...appointments, updatedAppointment])
        }
        setIsDialogOpen(false)
        resetForm()
      } else {
        console.error("Error saving appointment:", await response.text())
      }
    } catch (error) {
      console.error("Error saving appointment:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este turno?")) {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setAppointments(appointments.filter((a) => a.id !== id))
        } else {
          console.error("Error deleting appointment:", await response.text())
        }
      } catch (error) {
        console.error("Error deleting appointment:", error)
      }
    }
  }

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Disponible
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Reservado
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Confirmado
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Completado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return null
    }
  }

  const handleOpenCart = (appointment: Appointment) => {
    // Verificar que el turno tenga un tratamiento y cliente asignado
    if (!appointment.treatmentId || !appointment.clientId) {
      toast({
        title: "Error",
        description: "El turno debe tener un tratamiento y cliente asignado para agregar al carrito.",
        variant: "destructive",
      })
      return
    }

    // Redirigir a la pestaña de agenda con el carrito abierto
    window.location.href = `/?tab=agenda&appointmentId=${appointment.id}&openCart=true`
  }

  // Filtrar los turnos por fecha
  const filteredAppointments = filterDate 
    ? appointments.filter(appointment => appointment.date === filterDate)
    : appointments;

  // Ordenar los turnos por fecha y hora
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.time.localeCompare(b.time)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Turnos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Turno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentAppointment ? "Editar Turno" : "Nuevo Turno"}</DialogTitle>
              <DialogDescription>Complete los datos del turno.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="reserved">Reservado</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professionalId">Profesional</Label>
                  <Select
                    value={formData.professionalId}
                    onValueChange={(value) => handleSelectChange("professionalId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id.toString()}>
                          {professional.name} - {professional.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="treatmentId">Tratamiento</Label>
                  <Select
                    value={formData.treatmentId}
                    onValueChange={(value) => handleSelectChange("treatmentId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id.toString()}>
                          {treatment.name} - ${treatment.price} - {treatment.duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} {client.phone ? `- ${client.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="box">Box</Label>
                  <Select value={formData.box} onValueChange={(value) => handleSelectChange("box", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione box" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"].map((box) => (
                        <SelectItem key={box} value={box}>
                          {box}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deposit">Seña</Label>
                    <Input
                      id="deposit"
                      name="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Label htmlFor="filterDate">Filtrar por fecha:</Label>
        </div>
        <Input
          id="filterDate"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-auto"
        />
        {filterDate && (
          <Button variant="outline" size="sm" onClick={() => setFilterDate("")}>
            Limpiar filtro
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Profesional</TableHead>
              <TableHead className="hidden md:table-cell">Tratamiento</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead>Box</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell className="hidden md:table-cell">{appointment.professionalName || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{appointment.treatmentName || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{appointment.clientName || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{appointment.clientPhone || "-"}</TableCell>
                <TableCell>{appointment.box}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(appointment)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(appointment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {(appointment.status === "confirmed" || appointment.status === "completed") && (
                    <Button variant="ghost" size="icon" onClick={() => handleOpenCart(appointment)}>
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sortedAppointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No hay turnos registrados para esta fecha
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

