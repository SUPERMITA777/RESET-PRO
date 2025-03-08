"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfessionalAvailability {
  id?: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

interface Professional {
  id: number
  name: string
  specialty: string
  availability?: ProfessionalAvailability | null
  createdAt: string
  updatedAt: string
}

export default function ProfessionalsTab() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    availability: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    },
  })

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/professionals")
      if (!response.ok) {
        throw new Error("Error al obtener profesionales")
      }
      const data = await response.json()
      setProfessionals(data)
    } catch (error) {
      console.error("Error fetching professionals:", error)
      toast.error("Error al cargar los profesionales")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("availability.")) {
      const availabilityField = name.split(".")[1]
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [availabilityField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      specialty: "",
      availability: {
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
      },
    })
  }

  const handleOpenDialog = (professional: Professional | null = null) => {
    if (professional) {
      setCurrentProfessional(professional)
      setFormData({
        name: professional.name,
        specialty: professional.specialty,
        availability: professional.availability || {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        },
      })
    } else {
      setCurrentProfessional(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const professionalData = {
        ...formData,
        availability: formData.availability.startDate ? {
          ...formData.availability,
          startDate: new Date(formData.availability.startDate).toISOString(),
          endDate: new Date(formData.availability.endDate).toISOString(),
        } : null,
      }

      let response
      
      if (currentProfessional) {
        response = await fetch("/api/professionals", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentProfessional.id,
            ...professionalData,
          }),
        })
      } else {
        response = await fetch("/api/professionals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(professionalData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el profesional")
      }

      const savedProfessional = await response.json()
      
      if (currentProfessional) {
        setProfessionals(professionals.map((p) => 
          p.id === currentProfessional.id ? savedProfessional : p
        ))
      } else {
        setProfessionals([...professionals, savedProfessional])
      }

      setIsDialogOpen(false)
      resetForm()
      
      toast.success(
        currentProfessional 
          ? "Profesional actualizado correctamente" 
          : "Profesional creado correctamente"
      )
    } catch (error: any) {
      console.error("Error al guardar el profesional:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el profesional")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este profesional?")) {
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/professionals/${id}`, { method: "DELETE" })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al eliminar el profesional")
        }
        
        setProfessionals(professionals.filter(p => p.id !== id))
        toast.success("Profesional eliminado correctamente")
      } catch (error) {
        console.error("Error al eliminar el profesional:", error)
        toast.error(error instanceof Error ? error.message : "Error al eliminar el profesional")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profesionales</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="flex items-center" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Profesional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentProfessional ? "Editar Profesional" : "Nuevo Profesional"}
              </DialogTitle>
              <DialogDescription>Complete los datos del profesional.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-4">
                  <Label>Disponibilidad</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="availability.startDate">Fecha Inicio</Label>
                      <Input
                        id="availability.startDate"
                        name="availability.startDate"
                        type="date"
                        value={formData.availability.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="availability.endDate">Fecha Fin</Label>
                      <Input
                        id="availability.endDate"
                        name="availability.endDate"
                        type="date"
                        value={formData.availability.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="availability.startTime">Hora Inicio</Label>
                      <Input
                        id="availability.startTime"
                        name="availability.startTime"
                        type="time"
                        value={formData.availability.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="availability.endTime">Hora Fin</Label>
                      <Input
                        id="availability.endTime"
                        name="availability.endTime"
                        type="time"
                        value={formData.availability.endTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        {isLoading && professionals.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Cargando profesionales...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead className="hidden md:table-cell">Disponibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No hay profesionales registrados
                  </TableCell>
                </TableRow>
              ) : (
                professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell>{professional.specialty}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {professional.availability ? (
                        <div className="text-xs">
                          {professional.availability.startDate} - {professional.availability.endDate}
                          <br />
                          {professional.availability.startTime} - {professional.availability.endTime}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(professional)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(professional.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

