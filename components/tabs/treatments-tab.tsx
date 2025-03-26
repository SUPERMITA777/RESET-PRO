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

interface FormData {
  id: number | null;
  name: string;
  description: string;
  duration: string;
  price: string;
  isSubtreatment: boolean;
  parentId: number | null;
  alwaysAvailable: boolean;
  availability: Availability[];
}

export default function TreatmentsTab() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTreatment, setCurrentTreatment] = useState<Treatment | null>(null)
  const [expandedTreatments, setExpandedTreatments] = useState<number[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    id: null,
    name: "",
    description: "",
    duration: "0",
    price: "0",
    isSubtreatment: false,
    parentId: null,
    alwaysAvailable: false,
    availability: []
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    try {
      setIsLoading(true)
      console.log("Obteniendo tratamientos...");
      const response = await fetch("/api/treatments")
      
      if (!response.ok) {
        throw new Error(`Error al obtener tratamientos: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Obtenidos ${data.length} tratamientos`);
      setTreatments(data)
    } catch (error) {
      console.error("Error al cargar tratamientos:", error)
      toast.error("Error al cargar los tratamientos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (type: "tratamiento" | "subtratamiento") => {
    const isSubtreatment = type === "subtratamiento";
    setFormData(prev => ({
      ...prev,
      isSubtreatment,
      parentId: null,
      duration: isSubtreatment ? prev.duration : "0",
      price: isSubtreatment ? prev.price : "0",
      alwaysAvailable: isSubtreatment ? false : prev.alwaysAvailable,
      availability: isSubtreatment ? [] : prev.availability
    }));
  };

  const handleBooleanChange = (field: "isSubtreatment" | "alwaysAvailable", value: boolean) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      switch (field) {
        case "isSubtreatment": {
          newData.isSubtreatment = value;
          if (!value) {
            newData.parentId = null;
            newData.duration = "0";
            newData.price = "0";
          } else {
            newData.alwaysAvailable = false;
            newData.availability = [];
          }
          break;
        }
        case "alwaysAvailable": {
          newData.alwaysAvailable = value;
          if (value) {
            newData.availability = [];
          }
          break;
        }
      }
      
      return newData;
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      switch (field) {
        case "parentId":
          newData.parentId = value ? Number(value) : null;
          break;
        case "name":
        case "description":
          newData[field] = value;
          break;
        case "duration":
          const durationNum = Number(value);
          if (durationNum >= 0) {
            newData.duration = value;
          }
          break;
        case "price":
          const priceNum = Number(value);
          if (priceNum >= 0) {
            newData.price = value;
          }
          break;
        default:
          console.warn(`Campo no manejado: ${field}`);
      }
      
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
      duration: '0',
      price: '0',
      isSubtreatment: false,
      parentId: null,
      alwaysAvailable: false,
      availability: []
    });
    setAvailabilities([])
  }

  const handleOpenDialog = (treatment: Treatment | null = null, type: "tratamiento" | "subtratamiento" = "tratamiento") => {
    if (treatment) {
      setCurrentTreatment(treatment)
      setFormData({
        id: treatment.id,
        name: treatment.name,
        description: treatment.description,
        duration: treatment.duration.toString(),
        price: treatment.price.toString(),
        isSubtreatment: treatment.isSubtreatment,
        parentId: treatment.parentId || null,
        alwaysAvailable: treatment.alwaysAvailable || false,
        availability: treatment.availability || []
      })
      setAvailabilities(treatment.availability || [])
    } else {
      setCurrentTreatment(null)
      resetForm()
      setFormData(prev => ({ 
        ...prev, 
        isSubtreatment: type === "subtratamiento",
        duration: type === "subtratamiento" ? "" : "0",
        price: type === "subtratamiento" ? "" : "0",
      }))
    }
    setIsDialogOpen(true)
  }

  const handleAddAvailability = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      availability: [
        ...prev.availability,
        {
          startDate: today,
          endDate: today,
          startTime: '09:00',
          endTime: '18:00',
          box: ''
        }
      ]
    }));
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      alwaysAvailable: checked,
      availability: checked ? [] : prev.availability
    }));
  };

  const handleAvailabilityFieldChange = (index: number, field: keyof Availability, value: string) => {
    setFormData(prev => {
      const newAvailability = [...prev.availability];
      const updatedItem = { ...newAvailability[index] };

      switch (field) {
        case 'startDate': {
          updatedItem.startDate = value;
          if (updatedItem.endDate && value > updatedItem.endDate) {
            updatedItem.endDate = value;
          }
          if (isDateBeforeToday(value)) {
            toast.error('La fecha de inicio no puede ser anterior a hoy');
            return prev;
          }
          break;
        }
        case 'endDate': {
          updatedItem.endDate = value;
          if (updatedItem.startDate && value < updatedItem.startDate) {
            updatedItem.startDate = value;
          }
          if (isDateBeforeToday(value)) {
            toast.error('La fecha de fin no puede ser anterior a hoy');
            return prev;
          }
          break;
        }
        case 'startTime': {
          updatedItem.startTime = value;
          if (updatedItem.endTime && value > updatedItem.endTime) {
            updatedItem.endTime = value;
          }
          break;
        }
        case 'endTime': {
          updatedItem.endTime = value;
          if (updatedItem.startTime && value < updatedItem.startTime) {
            updatedItem.startTime = value;
          }
          break;
        }
        case 'box': {
          if (!value.trim()) {
            toast.error('El box no puede estar vacío');
            return prev;
          }
          updatedItem.box = value;
          break;
        }
      }

      newAvailability[index] = updatedItem;
      return {
        ...prev,
        availability: newAvailability
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }

      if (!formData.description.trim()) {
        throw new Error('La descripción es obligatoria');
      }

      // Validaciones para subtratamientos
      if (formData.isSubtreatment) {
        if (!formData.parentId) {
          throw new Error('Debe seleccionar un tratamiento principal');
        }
        if (!formData.duration || Number(formData.duration) <= 0) {
          throw new Error('La duración debe ser mayor a 0');
        }
        if (!formData.price || Number(formData.price) < 0) {
          throw new Error('El precio no puede ser negativo');
        }
      }

      console.log('Iniciando envío de formulario...');
      console.log('Datos del formulario:', formData);

      // Validar fechas y horas si no es siempre disponible
      if (!formData.alwaysAvailable && formData.availability.length > 0) {
        const invalidAvailability = formData.availability.some(avail => {
          const startDate = new Date(avail.startDate);
          const endDate = new Date(avail.endDate);
          const startTime = avail.startTime.split(':').map(Number);
          const endTime = avail.endTime.split(':').map(Number);

          return (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime()) ||
            startDate > endDate ||
            startTime[0] > endTime[0] ||
            (startTime[0] === endTime[0] && startTime[1] >= endTime[1])
          );
        });

        if (invalidAvailability) {
          throw new Error('Hay fechas u horas inválidas en las disponibilidades');
        }
      }

      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        duration: Number(formData.duration),
        price: Number(formData.price),
        parentId: formData.parentId ? Number(formData.parentId) : null,
        availability: formData.alwaysAvailable ? [] : formData.availability.map(avail => ({
          ...avail,
          startDate: new Date(avail.startDate).toISOString(),
          endDate: new Date(avail.endDate).toISOString()
        }))
      };

      console.log('Datos preparados para enviar:', JSON.stringify(dataToSend, null, 2));

      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Estado de la respuesta:', response.status);
      const responseText = await response.text();
      console.log('Texto de respuesta:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error al parsear la respuesta:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        console.error('Error en la respuesta:', responseData);
        throw new Error(responseData.error || 'Error al crear el tratamiento');
      }

      console.log('Tratamiento creado exitosamente:', responseData);
      setTreatments(prev => [...prev, responseData]);
      resetForm();
      setIsDialogOpen(false);
      toast.success('Tratamiento creado exitosamente');
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      setError(error.message || 'Error al crear el tratamiento');
      toast.error(error.message || 'Error al crear el tratamiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Iniciando eliminación del tratamiento:', id);

      const response = await fetch(`/api/treatments/${id}`, {
        method: 'DELETE',
      });

      console.log('Estado de la respuesta:', response.status);
      const responseText = await response.text();
      console.log('Texto de respuesta:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error al parsear la respuesta:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok || !responseData.success) {
        console.error('Error en la respuesta:', responseData);
        throw new Error(responseData.error || 'Error al eliminar el tratamiento');
      }

      console.log('Tratamiento eliminado exitosamente');
      setTreatments(treatments.filter((t) => t.id !== id));
      toast.success('Tratamiento eliminado exitosamente');
    } catch (error: any) {
      console.error('Error en handleDelete:', error);
      setError(error.message || 'Error al eliminar el tratamiento');
      toast.error(error.message || 'Error al eliminar el tratamiento');
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderAvailabilitySection = () => {
    if (formData.isSubtreatment) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="alwaysAvailable" 
            checked={formData.alwaysAvailable}
            onCheckedChange={handleAvailabilityToggle}
          />
          <Label htmlFor="alwaysAvailable">Siempre disponible</Label>
        </div>
        {!formData.alwaysAvailable && (
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Disponibilidad</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAvailability}
              >
                Agregar disponibilidad
              </Button>
            </div>
            {formData.availability.map((avail, index) => (
              <div key={index} className="grid grid-cols-5 gap-4">
                <div>
                  <Label>Fecha inicio</Label>
                  <Input
                    type="date"
                    value={avail.startDate}
                    onChange={(e) => handleAvailabilityFieldChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fecha fin</Label>
                  <Input
                    type="date"
                    value={avail.endDate}
                    onChange={(e) => handleAvailabilityFieldChange(index, 'endDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hora inicio</Label>
                  <Input
                    type="time"
                    value={avail.startTime}
                    onChange={(e) => handleAvailabilityFieldChange(index, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hora fin</Label>
                  <Input
                    type="time"
                    value={avail.endTime}
                    onChange={(e) => handleAvailabilityFieldChange(index, 'endTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Box</Label>
                  <Input
                    type="text"
                    value={avail.box}
                    onChange={(e) => handleAvailabilityFieldChange(index, 'box', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
                    : formData.isSubtreatment
                      ? "Nuevo Subtratamiento"
                      : "Nuevo Tratamiento"}
                </DialogTitle>
                <DialogDescription>Complete los datos del tratamiento.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Campos específicos para subtratamientos */}
                  {formData.isSubtreatment && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duración (minutos)</Label>
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => handleInputChange("duration", e.target.value)}
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
                            onChange={(e) => handleInputChange("price", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="parentId">Tratamiento Principal</Label>
                        <Select
                          value={formData.parentId?.toString() || ""}
                          onValueChange={(value) => handleInputChange("parentId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tratamiento principal" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatments
                              .filter(t => !t.isSubtreatment)
                              .map(treatment => (
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
                  {!formData.isSubtreatment && renderAvailabilitySection()}
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
                        {treatment.alwaysAvailable 
                          ? "Siempre disponible" 
                          : treatment.availability?.map((avail, index) => (
                              <div key={index} className="text-xs mb-1">
                                {new Date(avail.startDate).toLocaleDateString()} - {new Date(avail.endDate).toLocaleDateString()}, {avail.startTime} - {avail.endTime}, {avail.box}
                              </div>
                            ))
                        }
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

