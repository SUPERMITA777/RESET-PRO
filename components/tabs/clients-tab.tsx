"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Definir la interfaz del cliente según el esquema de Prisma
interface Client {
  id: number
  name: string
  phone: string | null
  email: string | null
  medicalHistory?: string
  createdAt?: Date
  updatedAt?: Date
}

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    medicalHistory: "",
  })

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      console.log("Obteniendo clientes desde la API...")
      const response = await fetch("/api/clients")
      
      if (!response.ok) {
        throw new Error(`Error al obtener clientes: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Obtenidos ${data.length} clientes de la base de datos`)
      setClients(data)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      toast.error("Error al cargar los clientes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      medicalHistory: "",
    })
  }

  const handleOpenDialog = (client: Client | null = null) => {
    if (client) {
      setCurrentClient(client)
      setFormData({
        name: client.name,
        phone: client.phone || "",
        email: client.email || "",
        medicalHistory: client.medicalHistory || "",
      })
    } else {
      setCurrentClient(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clientData = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        medicalHistory: formData.medicalHistory || null,
      }

      if (currentClient) {
        // Actualizar cliente existente
        const response = await fetch(`/api/clients`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentClient.id,
            ...clientData,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al actualizar el cliente")
        }

        const updatedClient = await response.json()
        
        // Actualizar el estado local
        setClients(prevClients => 
          prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
        )
        
        toast.success("Cliente actualizado correctamente")
      } else {
        // Crear nuevo cliente
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al crear el cliente")
        }

        const newClient = await response.json()
        
        // Actualizar el estado local
        setClients(prevClients => [...prevClients, newClient])
        
        toast.success("Cliente creado correctamente")
      }

      setIsDialogOpen(false)
      resetForm()
      
      // Recargar la lista de clientes para asegurar sincronización
      setTimeout(() => {
        fetchClients()
      }, 500)
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este cliente?")) {
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/clients/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al eliminar el cliente")
        }

        // Actualizar el estado local
        setClients(clients.filter((c) => c.id !== id))
        toast.success("Cliente eliminado correctamente")
      } catch (error) {
        console.error("Error al eliminar cliente:", error)
        toast.error(error instanceof Error ? error.message : "Error al eliminar el cliente")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="flex items-center" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription>Complete los datos del cliente.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medicalHistory">Historial Clínico</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Historial Clínico</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Cargando clientes...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.phone || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.email || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">{client.medicalHistory || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)} disabled={isLoading}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

