"use client"

import React, { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { 
  formatDateArgentina, 
  formatTimeArgentina, 
  getCurrentDateArgentina,
  createArgentinaDate,
  normalizeArgentinaDate,
  formatDateToISO,
  compareDatesOnly,
  compareTimesOnly,
  isDateBeforeToday
} from "@/lib/date-utils"
import { Checkbox } from "@/components/ui/checkbox"

interface Availability {
  id?: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  box: string
}

interface Treatment {
  id: number
  name: string
  description: string
  duration: number
  price: number
  isSubtreatment: boolean
  parentId: number | null
  availability: Availability[] | null
  subTreatments?: Treatment[]
  alwaysAvailable?: boolean
}

export default function TreatmentsTab() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTreatment, setCurrentTreatment] = useState<Treatment | null>(null)
  const [expandedTreatments, setExpandedTreatments] = useState<number[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    isSubtreatment: "false",
    parentId: "",
    alwaysAvailable: "false",
  })

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    try {
      setIsLoading(true)
      console.log("Iniciando fetchTreatments...");
      const response = await fetch("/api/treatments")
      
      if (!response.ok) {
        throw new Error(`Error al obtener tratamientos: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Obtenidos ${data.length} tratamientos`);
      setTreatments(data)

      // Contar subtratamientos
      const subtreatments = data.filter((t: Treatment) => t.isSubtreatment);
      console.log(`Subtratamientos: ${subtreatments.length}`);

      // Mostrar algunos ejemplos de subtratamientos
      if (subtreatments.length > 0) {
        console.log("Ejemplo de subtratamiento:", JSON.stringify(subtreatments[0], null, 2));
      }
    } catch (error) {
      console.error("Error fetching treatments:", error)
      toast.error("Error al cargar los tratamientos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
    
    // Manejo especial al cambiar el tipo de tratamiento
    if (name === "isSubtreatment") {
      if (value === "false") {
        // Si cambiamos a tratamiento principal:
        // - Eliminar el parentId (no aplica)
        // - Mantener alwaysAvailable
        setFormData(prev => ({ 
          ...prev, 
          parentId: "",
          // Inicializar duración y precio a 0 para tratamientos principales
          duration: "0",
          price: "0" 
        }))
      } else {
        // Si cambiamos a subtratamiento:
        // - Necesitamos un parentId
        // - No necesitamos disponibilidad ni alwaysAvailable
        setFormData(prev => ({ 
          ...prev, 
          alwaysAvailable: "false" 
        }))
        // Limpiar las disponibilidades (no aplican a subtratamientos)
        setAvailabilities([])
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      // Inicializar con valores vacíos, se configurarán según el tipo en handleOpenDialog
      duration: "",
      price: "",
      isSubtreatment: "false",
      parentId: "",
      alwaysAvailable: "false",
    })
    setAvailabilities([])
  }

  const handleOpenDialog = (treatment: Treatment | null = null, type: "tratamiento" | "subtratamiento" = "tratamiento") => {
    if (treatment) {
      setCurrentTreatment(treatment)
      setFormData({
        name: treatment.name,
        description: treatment.description,
        duration: treatment.duration.toString(),
        price: treatment.price.toString(),
        isSubtreatment: treatment.isSubtreatment.toString(),
        parentId: treatment.parentId ? treatment.parentId.toString() : "",
        alwaysAvailable: treatment.alwaysAvailable ? "true" : "false",
      })
      setAvailabilities(treatment.availability || [])
    } else {
      setCurrentTreatment(null)
      resetForm()
      // Preseleccionar el tipo según el botón que se presionó
      setFormData(prev => ({ 
        ...prev, 
        isSubtreatment: type === "subtratamiento" ? "true" : "false",
        duration: type === "subtratamiento" ? "" : "0",
        price: type === "subtratamiento" ? "" : "0",
      }))
    }
    setIsDialogOpen(true)
  }

  const handleAddAvailability = () => {
    // Usar fechas fijas para evitar problemas
    const currentYear = new Date().getFullYear();
    
    setAvailabilities([
      ...availabilities,
      {
        startDate: `${currentYear}-01-01`, // Fecha fija de inicio de año
        endDate: `${currentYear}-12-31`, // Fecha fija de fin de año
        startTime: "09:00",
        endTime: "17:00",
        box: "Box 1",
      },
    ]);
  }

  const handleAvailabilityChange = (index: number, field: keyof Availability, value: string) => {
    const newAvailabilities = [...availabilities];
    
    // Crear un objeto temporal para la actualización
    const updatedAvailability = { ...newAvailabilities[index] };
    
    // Actualizar el campo específico
    if (field === 'startDate') updatedAvailability.startDate = value;
    else if (field === 'endDate') updatedAvailability.endDate = value;
    else if (field === 'startTime') updatedAvailability.startTime = value;
    else if (field === 'endTime') updatedAvailability.endTime = value;
    else if (field === 'box') updatedAvailability.box = value;
    
    // Reemplazar el objeto en el array
    newAvailabilities[index] = updatedAvailability;
    
    setAvailabilities(newAvailabilities);
  }

  const handleRemoveAvailability = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validación básica para todos los tratamientos
      if (!formData.name.trim()) {
        toast.error("El nombre del tratamiento es obligatorio.");
        setIsSubmitting(false);
        return;
      }

      // Validaciones específicas para tratamientos principales
      if (formData.isSubtreatment === "false") {
        // Solo los tratamientos principales pueden ser siempre disponibles o tener disponibilidad
        if (formData.alwaysAvailable === "false" && availabilities.length === 0) {
          toast.error("Los tratamientos principales deben tener al menos una disponibilidad o ser marcados como siempre disponibles.");
          setIsSubmitting(false);
          return;
        }

        // Validar las fechas de disponibilidad solo si no es siempre disponible
        if (formData.alwaysAvailable === "false") {
          for (const avail of availabilities) {
            if (avail.endDate < avail.startDate) {
              toast.error("La fecha de fin no puede ser anterior a la fecha de inicio.");
              setIsSubmitting(false);
              return;
            }
            
            if (avail.endTime <= avail.startTime) {
              toast.error("La hora de fin debe ser posterior a la hora de inicio.");
              setIsSubmitting(false);
              return;
            }
          }
        }
      }

      // Validaciones específicas para sub-tratamientos
      if (formData.isSubtreatment === "true") {
        // Solo los subtratamientos necesitan un tratamiento principal
        if (!formData.parentId) {
          toast.error("Debe seleccionar un tratamiento principal.");
          setIsSubmitting(false);
          return;
        }
        
        // Solo los subtratamientos necesitan duración y precio
        if (!formData.duration || Number(formData.duration) <= 0) {
          toast.error("La duración debe ser mayor a 0 minutos.");
          setIsSubmitting(false);
          return;
        }
        
        if (!formData.price || Number(formData.price) < 0) {
          toast.error("El precio no puede ser negativo.");
          setIsSubmitting(false);
          return;
        }
      }

      const treatmentData = {
        name: formData.name,
        description: formData.description,
        // Duración y precio solo para subtratamientos, 0 para tratamientos principales
        duration: formData.isSubtreatment === "true" ? Number.parseInt(formData.duration) || 0 : 0,
        price: formData.isSubtreatment === "true" ? Number.parseFloat(formData.price) || 0 : 0,
        isSubtreatment: formData.isSubtreatment === "true",
        // AlwaysAvailable solo para tratamientos principales
        alwaysAvailable: formData.isSubtreatment === "false" ? formData.alwaysAvailable === "true" : false,
        // ParentId solo para subtratamientos
        parentId: formData.isSubtreatment === "true" && formData.parentId ? Number.parseInt(formData.parentId) : null,
        // Availability solo para tratamientos principales que no son siempre disponibles
        availability: formData.isSubtreatment === "false" && formData.alwaysAvailable === "false" ? availabilities.map(avail => ({
          ...avail,
          startDate: new Date(avail.startDate).toISOString(),
          endDate: new Date(avail.endDate).toISOString()
        })) : [],
      };
      
      console.log("Enviando datos de tratamiento:", JSON.stringify(treatmentData, null, 2));

      let response;
      
      if (currentTreatment) {
        // Actualizar tratamiento existente
        response = await fetch("/api/treatments", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentTreatment.id,
            ...treatmentData,
          }),
        });
      } else {
        // Crear nuevo tratamiento
        response = await fetch("/api/treatments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(treatmentData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el tratamiento");
      }

      const savedTreatment = await response.json();
      console.log("Tratamiento guardado:", savedTreatment);
      
      // Actualizar la lista de tratamientos
      if (currentTreatment) {
        setTreatments(
          treatments.map((t) => (t.id === currentTreatment.id ? savedTreatment : t))
        );
      } else {
        setTreatments([...treatments, savedTreatment]);
      }

      setIsDialogOpen(false);
      resetForm();
      
      toast.success(
        currentTreatment 
          ? "Tratamiento actualizado correctamente" 
          : "Tratamiento creado correctamente"
      );
      
      // Recargar los tratamientos para asegurar sincronización
      setTimeout(() => {
        fetchTreatments();
      }, 500);
    } catch (error: any) {
      console.error("Error al guardar el tratamiento:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el tratamiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este tratamiento? Esta acción también eliminará todos los subtratamientos asociados.")) {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/treatments/${id}`, { method: "DELETE" });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar el tratamiento");
        }
        
        await fetchTreatments();
        toast.success("Tratamiento eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar el tratamiento:", error);
        toast.error(error instanceof Error ? error.message : "Error al eliminar el tratamiento");
      } finally {
        setIsLoading(false);
      }
    }
  }

  const toggleExpand = (id: number) => {
    if (expandedTreatments.includes(id)) {
      setExpandedTreatments(expandedTreatments.filter((t) => t !== id))
    } else {
      setExpandedTreatments([...expandedTreatments, id])
    }
  }

  // Get main treatments (not subtratments)
  const mainTreatments = treatments.filter((t) => !t.isSubtreatment)

  // Get parent treatments for select dropdown
  const parentTreatmentOptions = treatments.filter((t) => !t.isSubtreatment)

  const boxes = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tratamientos</h2>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null, "tratamiento")} className="flex items-center" disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Tratamiento
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null, "subtratamiento")} className="flex items-center" disabled={isLoading} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Subtratamiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {currentTreatment
                    ? currentTreatment.isSubtreatment
                      ? "Editar Subtratamiento"
                      : "Editar Tratamiento"
                    : formData.isSubtreatment === "true"
                      ? "Nuevo Subtratamiento"
                      : "Nuevo Tratamiento"}
                </DialogTitle>
                <DialogDescription>Complete los datos del tratamiento.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Campos específicos para subtratamientos */}
                  {formData.isSubtreatment === "true" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duración (minutos)</Label>
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Precio ($)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="parentId">Tratamiento Principal</Label>
                        <Select
                          value={formData.parentId}
                          onValueChange={(value) => handleSelectChange("parentId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tratamiento principal" />
                          </SelectTrigger>
                          <SelectContent>
                            {parentTreatmentOptions.map((treatment) => (
                              <SelectItem key={treatment.id} value={treatment.id.toString()}>
                                {treatment.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Campos específicos para tratamientos principales */}
                  {formData.isSubtreatment === "false" && (
                    <>
                      <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="alwaysAvailable" 
                            checked={formData.alwaysAvailable === "true"}
                            onCheckedChange={(checked) => 
                              handleSelectChange("alwaysAvailable", checked ? "true" : "false")
                            }
                          />
                          <Label htmlFor="alwaysAvailable">Siempre Disponible</Label>
                        </div>
                        <div className="text-xs text-gray-500">
                          Si está marcado, este tratamiento estará disponible en cualquier horario y box.
                        </div>
                      </div>
                      
                      {formData.alwaysAvailable === "false" && (
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center">
                            <Label>Disponibilidad</Label>
                            <Button type="button" onClick={handleAddAvailability} size="sm" variant="outline">
                              Agregar disponibilidad
                            </Button>
                          </div>
                          {availabilities.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              No hay disponibilidad configurada. Haga clic en "Agregar disponibilidad" para comenzar.
                            </div>
                          )}
                          {availabilities.map((availability, index) => (
                            <div key={index} className="grid gap-2 p-3 border rounded-md relative">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveAvailability(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                  <Label htmlFor={`startDate-${index}`}>Fecha Inicio</Label>
                                  <Input
                                    id={`startDate-${index}`}
                                    type="date"
                                    value={availability.startDate}
                                    onChange={(e) => handleAvailabilityChange(index, "startDate", e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`endDate-${index}`}>Fecha Fin</Label>
                                  <Input
                                    id={`endDate-${index}`}
                                    type="date"
                                    value={availability.endDate}
                                    onChange={(e) => handleAvailabilityChange(index, "endDate", e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                  <Label htmlFor={`startTime-${index}`}>Hora Inicio</Label>
                                  <Input
                                    id={`startTime-${index}`}
                                    type="time"
                                    value={availability.startTime}
                                    onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`endTime-${index}`}>Hora Fin</Label>
                                  <Input
                                    id={`endTime-${index}`}
                                    type="time"
                                    value={availability.endTime}
                                    onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`box-${index}`}>Box</Label>
                                <Select
                                  value={availability.box}
                                  onValueChange={(value) => handleAvailabilityChange(index, "box", value)}
                                >
                                  <SelectTrigger id={`box-${index}`}>
                                    <SelectValue placeholder="Seleccione box" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {boxes.map((box) => (
                                      <SelectItem key={box} value={box}>
                                        {box}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
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
      </div>

      <div className="rounded-md border">
        {isLoading && treatments.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Cargando tratamientos...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="hidden md:table-cell">Disponibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mainTreatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No hay tratamientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                mainTreatments.map((treatment) => (
                  <React.Fragment key={treatment.id}>
                    <TableRow className="bg-muted/30">
                      <TableCell>
                        {treatments.some((t) => t.parentId === treatment.id) && (
                          <Button variant="ghost" size="icon" onClick={() => toggleExpand(treatment.id)}>
                            {expandedTreatments.includes(treatment.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{treatment.description}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {treatment.availability?.map((avail, index) => (
                          <div key={index} className="text-xs">
                            {avail.startDate} - {avail.endDate}, {avail.startTime} - {avail.endTime}, {avail.box}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(treatment)} disabled={isLoading}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(treatment.id)} disabled={isLoading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTreatments.includes(treatment.id) &&
                      treatments
                        .filter((t) => t.parentId === treatment.id)
                        .map((subtreatment) => (
                          <TableRow key={subtreatment.id} className="bg-white">
                            <TableCell></TableCell>
                            <TableCell className="pl-8">└ {subtreatment.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{subtreatment.description}</TableCell>
                            <TableCell>{subtreatment.duration} min</TableCell>
                            <TableCell>${subtreatment.price.toLocaleString("es-AR")}</TableCell>
                            <TableCell className="hidden md:table-cell">-</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subtreatment)} disabled={isLoading}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(subtreatment.id)} disabled={isLoading}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

