"use client"

import React from "react"
import type { FormEvent, ChangeEvent } from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ChevronLeft, ChevronRight, ShoppingCart, Trash2 } from "lucide-react"
import { 
  formatDateArgentina, 
  formatTimeArgentina, 
  getCurrentDateArgentina,
  getCurrentTimeArgentina,
  createArgentinaDate,
  normalizeArgentinaDate,
  formatDateToISO,
  compareDatesOnly,
  compareTimesOnly,
  isDateBeforeToday,
  isDateTimeBeforeNow
} from "@/lib/date-utils"
import { useSearchParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CalendarView from './CalendarView'

// Mock data for appointments
const initialAppointments = [
  {
    id: 1,
    date: "2025-03-03",
    time: "10:00",
    status: "reserved",
    professionalId: 1,
    professionalName: "María López",
    treatmentId: 1,
    treatmentName: "Limpieza Facial",
    clientId: 1,
    clientName: "Ana García",
    box: "Box 1",
    deposit: 2000,
    price: 5000,
    notes: "Primera sesión",
  },
  {
    id: 2,
    date: "2025-03-03",
    time: "11:30",
    status: "completed",
    professionalId: 2,
    professionalName: "Carlos Rodríguez",
    treatmentId: 3,
    treatmentName: "Masaje Relajante",
    clientId: 2,
    clientName: "Juan Pérez",
    box: "Box 2",
    deposit: 3000,
    price: 6000,
    notes: "",
  },
  {
    id: 3,
    date: "2025-03-03",
    time: "09:00",
    status: "available",
    professionalId: 3,
    professionalName: "Laura Fernández",
    treatmentId: null,
    treatmentName: null,
    clientId: null,
    clientName: null,
    box: "Box 3",
    deposit: 0,
    price: 0,
    notes: "",
  },
  {
    id: 4,
    date: "2025-03-03",
    time: "15:00",
    status: "cancelled",
    professionalId: 1,
    professionalName: "María López",
    treatmentId: 2,
    treatmentName: "Limpieza Facial Profunda",
    clientId: 3,
    clientName: "Sofía Martínez",
    box: "Box 1",
    deposit: 1000,
    price: 7500,
    notes: "Cancelado por el cliente",
  },
]

// Mock data for dropdowns
const professionals = [
  { id: 1, name: "María López" },
  { id: 2, name: "Carlos Rodríguez" },
  { id: 3, name: "Laura Fernández" },
]

// Definir clients como un array estático inicialmente
const clientsData = [
  { id: 1, name: "Ana García" },
  { id: 2, name: "Juan Pérez" },
  { id: 3, name: "Sofía Martínez" },
]

const boxes = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"]
const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00"
]

export interface Appointment {
  id: number;
  date: string;
  time: string;
  status: "available" | "reserved" | "confirmed" | "completed" | "cancelled";
  professionalId: number | null;
  professionalName: string | null;
  treatmentId: number | null;
  treatmentName: string | null;
  clientId: number | null;
  clientName: string | null;
  box: string;
  deposit: number;
  price: number;
  notes: string;
  duration?: number;
}

// Definir la interfaz para los tratamientos
interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  isSubtreatment: boolean;
  parentId: number | null;
  availability: Array<{
    id?: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    box: string;
  }> | null;
  alwaysAvailable?: boolean;
}

// Añadir después de las importaciones
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

// Agregar después de las interfaces existentes
interface PaymentMethod {
  id: number
  name: string
  isActive: boolean
}

interface CartItem {
  productId?: number
  treatmentId?: number
  quantity: number
  price: number
  subtotal: number
  name: string
  type: 'product' | 'treatment' | 'subtreatment'
  parentId?: number
}

interface Payment {
  paymentMethodId: number
  amount: number
  reference?: string
}

interface Product {
  id: number
  name: string
  price: number
}

const initialSpecialAppointment: Appointment = {
  id: Date.now(),
  date: getCurrentDateArgentina(),
  time: "09:00",
  status: "reserved",
  professionalId: null,
  professionalName: null,
  treatmentId: null,
  treatmentName: null,
  clientId: null,
  clientName: null,
  box: "Box 1",
  deposit: 0,
  price: 0,
  notes: "",
  duration: 30,
};

interface SpecialAppointmentForm extends Appointment {
  newClientName?: string;
  newClientPhone?: string;
}

export default function AgendaTab() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments.map(app => ({
    ...app,
    status: app.status as "available" | "reserved" | "completed" | "cancelled"
  })))
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateArgentina())
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
    newClientName: "",
    newClientPhone: "",
    duration: "",
  })

  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([])
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([])
  const [subTreatments, setSubTreatments] = useState<Treatment[]>([])
  // Agregar el estado de clients aquí dentro del componente
  const [clients, setClients] = useState<{id: number, name: string, phone?: string, email?: string}[]>([])

  // Añadir el estado para los profesionales
  const [professionals, setProfessionals] = useState<Professional[]>([])

  // Agregar dentro del componente AgendaTab, después de los estados existentes
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentReference, setPaymentReference] = useState("")

  // Agregar el estado de productos
  const [products, setProducts] = useState<Product[]>([])

  const searchParams = useSearchParams()

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'agenda2'>('daily');

  // Agregar un nuevo estado para el turno especial
  const [specialAppointment, setSpecialAppointment] = useState<SpecialAppointmentForm>(
    {
      ...initialSpecialAppointment,
      newClientName: '',
      newClientPhone: ''
    }
  );
  const [isSpecialDialogOpen, setIsSpecialDialogOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      console.log('Obteniendo turnos desde la API...');
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error(`Error al obtener turnos: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Turnos obtenidos:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      toast({
        title: "Error",
        description: "Error al obtener turnos. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const fetchClients = async () => {
    try {
      console.log("Obteniendo clientes desde la API...");
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Error al obtener clientes");
      }
      const data = await response.json();
      console.log("Clientes obtenidos:", data);
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Error al obtener clientes. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const fetchTreatments = async () => {
    try {
      console.log("Iniciando fetchTreatments...");
      const response = await fetch("/api/treatments");
      if (!response.ok) {
        throw new Error("Error al obtener tratamientos");
      }
      const data = await response.json();
      console.log(`Obtenidos ${data.length} tratamientos`);
      setTreatments(data);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      toast({
        title: "Error",
        description: "Error al obtener tratamientos. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/professionals");
      if (!response.ok) {
        throw new Error("Error al obtener profesionales");
      }
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast({
        title: "Error",
        description: "Error al obtener profesionales. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchClients();
    fetchTreatments();
    fetchProfessionals();
  }, []);

  const updateAvailability = useCallback(() => {
    // Asegurarse de que la fecha seleccionada esté en formato YYYY-MM-DD
    const normalizedSelectedDate = selectedDate.split('T')[0];
    const time = formData.time;
    const box = formData.box;

    console.log("Fecha seleccionada normalizada:", normalizedSelectedDate);
    console.log("Total de tratamientos:", treatments.length);

    // Filtrar profesionales disponibles
    const availableProfs = professionals.filter((prof) => {
      if (!prof.availability) return false;
      
      // Normalizar las fechas de disponibilidad
      const profStartDate = prof.availability.startDate.split('T')[0];
      const profEndDate = prof.availability.endDate.split('T')[0];
      
      // Comparar fechas directamente como strings
      const isAfterStartDate = normalizedSelectedDate >= profStartDate;
      const isBeforeEndDate = normalizedSelectedDate <= profEndDate;
      const isAfterStartTime = time >= prof.availability.startTime;
      const isBeforeEndTime = time <= prof.availability.endTime;
      
      return isAfterStartDate && isBeforeEndDate && isAfterStartTime && isBeforeEndTime;
    });

    // Obtener tratamientos disponibles según disponibilidad o alwaysAvailable
    const availableMainTreats = treatments.filter((treat) => {
      // Filtrar solo tratamientos principales (no subtratamientos)
      if (treat.isSubtreatment) return false;
      
      // Si el tratamiento está marcado como siempre disponible, incluirlo
      if (treat.alwaysAvailable) return true;
      
      // Verificar disponibilidad normal
      return treat.availability?.some((avail) => {
        const availStartDate = avail.startDate.split('T')[0];
        const availEndDate = avail.endDate.split('T')[0];
        
        const isDateInRange = normalizedSelectedDate >= availStartDate && normalizedSelectedDate <= availEndDate;
        const isTimeInRange = time >= avail.startTime && time <= avail.endTime;
        const isBoxMatch = box === avail.box;
        
        return isDateInRange && isTimeInRange && isBoxMatch;
      });
    });

    // Obtener subtratamientos disponibles
    const availableSubTreats = treatments.filter((treat) => {
      // Mostrar solo subtratamientos
      if (!treat.isSubtreatment) return false;
      
      // Verificar si el tratamiento padre está disponible
      const parentTreatment = availableMainTreats.find(t => t.id === treat.parentId);
      return !!parentTreatment;
    });

    setAvailableProfessionals(availableProfs);
    setAvailableTreatments([...availableMainTreats, ...availableSubTreats]);
  }, [selectedDate, formData.time, formData.box, treatments, professionals]);

  useEffect(() => {
    updateAvailability()
  }, [updateAvailability])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "treatmentId" && value) {
      const selectedTreatment = treatments.find((t) => t.id.toString() === value)
      if (selectedTreatment) {
        // Actualizar precio y duración automáticamente
        setFormData({
          ...formData,
          [name]: value,
          price: selectedTreatment.price.toString(),
          duration: selectedTreatment.duration.toString(),
        })
        return
      }
    }
    
    // Convertir "none" a cadena vacía para mantener la lógica existente
    const finalValue = value === "none" ? "" : value;
    setFormData({ ...formData, [name]: finalValue });
  }

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      time: "09:00",
      status: "available",
      professionalId: "",
      treatmentId: "",
      clientId: "",
      box: "Box 1",
      deposit: "0",
      price: "0",
      notes: "",
      newClientName: "",
      newClientPhone: "",
      duration: "0",
    })
    setSubTreatments([])
  }

  const handleOpenDialog = (appointment: Appointment | null = null, time?: string, box?: string) => {
    // Si se está creando un nuevo turno, verificar que la fecha no sea pasada
    if (!appointment && isDateBeforeToday(selectedDate)) {
      alert("No se pueden crear turnos en fechas pasadas. Por favor, seleccione una fecha futura.");
      return;
    }
    
    // Si se está creando un nuevo turno en la fecha actual, verificar que la hora no sea pasada
    if (!appointment && 
        compareDatesOnly(selectedDate, getCurrentDateArgentina()) === 0 && 
        time && 
        compareTimesOnly(time, getCurrentTimeArgentina()) < 0) {
      alert("No se pueden crear turnos en horarios pasados. Por favor, seleccione un horario futuro.");
      return;
    }

    if (appointment) {
      setCurrentAppointment(appointment)
      setFormData({
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        professionalId: appointment.professionalId ? appointment.professionalId.toString() : "",
        treatmentId: appointment.treatmentId ? appointment.treatmentId.toString() : "",
        clientId: appointment.clientId ? appointment.clientId.toString() : "",
        box: appointment.box,
        deposit: appointment.deposit.toString(),
        price: appointment.price.toString(),
        notes: appointment.notes,
        newClientName: "",
        newClientPhone: "",
        duration: appointment.duration?.toString() || "",
      })
    } else {
      setCurrentAppointment(null)
      setFormData({
        date: selectedDate,
        time: time || "09:00",
        status: "reserved",
        professionalId: "",
        treatmentId: "",
        clientId: "",
        box: box || "Box 1",
        deposit: "0",
        price: "0",
        notes: "",
        newClientName: "",
        newClientPhone: "",
        duration: "0",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validar que la fecha no sea pasada
    if (isDateBeforeToday(formData.date)) {
      alert("No se pueden crear turnos en fechas pasadas. Por favor, seleccione una fecha futura.");
      return;
    }
    
    // Si es la fecha actual, validar que la hora no sea pasada
    if (compareDatesOnly(formData.date, getCurrentDateArgentina()) === 0 && 
        compareTimesOnly(formData.time, getCurrentTimeArgentina()) < 0) {
      alert("No se pueden crear turnos en horarios pasados. Por favor, seleccione un horario futuro.");
      return;
    }

    // Verificar si el tratamiento está disponible
    const isTreatmentAvailable = availableTreatments.some((t) => t.id.toString() === formData.treatmentId);

    if (!isTreatmentAvailable) {
      alert("El tratamiento seleccionado no está disponible en este horario.");
      return;
    }

    // Validar que se haya ingresado un teléfono si se está creando un nuevo cliente
    if (formData.newClientName && !formData.newClientPhone) {
      alert("Por favor, ingrese un teléfono para el nuevo cliente.");
      return;
    }

    // Función para continuar con la creación de la cita después de manejar el cliente
    const continueWithAppointment = async (clientId: string, clientName: string) => {
      const selectedProfessional = formData.professionalId && formData.professionalId !== "none"
        ? professionals.find((p) => p.id.toString() === formData.professionalId) 
        : null;
      const selectedTreatment = formData.treatmentId
        ? treatments.find((t) => t.id.toString() === formData.treatmentId)
        : null;

      // SOLUCIÓN JAVASCRIPT PURO: Usar fechas ISO sin manipulación de zona horaria
      // Asegurarse de que la fecha esté en formato YYYY-MM-DD sin componente de tiempo
      const dateParts = formData.date.split('T')[0].split('-');
      const normalizedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
      
      // Crear un nuevo appointment con la fecha normalizada
      const appointmentData = {
        id: currentAppointment?.id,
        date: normalizedDate,
        time: formData.time,
        status: formData.status as "available" | "reserved" | "confirmed" | "completed" | "cancelled",
        professionalId: formData.professionalId && formData.professionalId !== "none" 
          ? Number.parseInt(formData.professionalId) 
          : null,
        treatmentId: formData.treatmentId ? Number.parseInt(formData.treatmentId) : null,
        clientId: clientId ? Number.parseInt(clientId) : null,
        box: formData.box,
        deposit: Number.parseInt(formData.deposit) || 0,
        price: Number.parseInt(formData.price) || 0,
        notes: formData.notes,
        duration: selectedTreatment?.duration || Number.parseInt(formData.duration) || 0,
      };

      console.log("Creando/actualizando cita:", JSON.stringify(appointmentData, null, 2));

      try {
        let response;
        
        if (currentAppointment) {
          // Actualizar appointment existente
          response = await fetch("/api/appointments", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentData),
          });
        } else {
          // Crear nuevo appointment
          response = await fetch("/api/appointments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentData),
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error al ${currentAppointment ? 'actualizar' : 'crear'} la cita: ${errorData.error || 'Error desconocido'}`);
        }

        const savedAppointment = await response.json();
        console.log(`Cita ${currentAppointment ? 'actualizada' : 'creada'} con éxito:`, savedAppointment);

        // Actualizar la lista de appointments en el estado local
        if (currentAppointment) {
          setAppointments(
            appointments.map((a) => (a.id === currentAppointment.id ? savedAppointment : a))
          );
        } else {
          setAppointments([...appointments, savedAppointment]);
        }

        setIsDialogOpen(false);
        resetForm();
        
        // Recargar los appointments para asegurar sincronización con la base de datos
        fetchAppointments();
        
      } catch (error: any) {
        console.error(`Error al ${currentAppointment ? 'actualizar' : 'crear'} la cita:`, error);
        alert(`Error al ${currentAppointment ? 'actualizar' : 'crear'} la cita: ${error.message || 'Error desconocido'}`);
      }
    };

    // Manejar la creación de un nuevo cliente si es necesario
    if (formData.newClientName && !formData.clientId) {
      // Crear un nuevo cliente en la base de datos
      const createClient = async () => {
        try {
          console.log("Creando nuevo cliente:", {
            name: formData.newClientName,
            phone: formData.newClientPhone,
            email: "", // Campo opcional
          });
          
          const response = await fetch("/api/clients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.newClientName,
              phone: formData.newClientPhone,
              email: "", // Campo opcional
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al crear el cliente: ${errorData.error || 'Error desconocido'}`);
          }

          const newClient = await response.json();
          console.log("Nuevo cliente creado:", newClient);
          
          // Actualizar la lista de clientes
          setClients(prevClients => [...prevClients, newClient]);
          
          // Continuar con la creación de la cita
          continueWithAppointment(newClient.id.toString(), newClient.name);
          
          // Recargar la lista de clientes para asegurar sincronización con la base de datos
          setTimeout(() => {
            fetchClients();
          }, 500);
        } catch (error: any) {
          console.error("Error al crear el cliente:", error);
          alert(`Error al crear el cliente: ${error.message || 'Error desconocido'}`);
        }
      };

      createClient();
    } else if (formData.clientId) {
      // Usar cliente existente
      const selectedClient = clients.find((c) => c.id.toString() === formData.clientId);
      continueWithAppointment(formData.clientId, selectedClient?.name || "");
    } else {
      // No hay cliente seleccionado ni nuevo cliente
      continueWithAppointment("", "");
    }
  };

  const handleDateChange = (direction: "prev" | "next") => {
    const date = new Date(selectedDate)
    if (direction === "prev") {
      date.setDate(date.getDate() - 1)
    } else {
      date.setDate(date.getDate() + 1)
    }
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const getAppointmentByTimeAndBox = (time: string, box: string) => {
    // SOLUCIÓN JAVASCRIPT PURO: Comparar fechas como strings sin manipulación
    // Esto evita cualquier problema de zona horaria
    const normalizedSelectedDate = selectedDate.split('T')[0];
    
    return appointments.find(
      (appointment) => {
        const appointmentDate = appointment.date.split('T')[0];
        return appointmentDate === normalizedSelectedDate && 
               appointment.time === time && 
               appointment.box === box;
      }
    );
  };

  const getAvailableTreatments = useCallback(
    (date: string, time: string, box: string) => {
      return treatments.filter((treatment) => {
        if (treatment.isSubtreatment) return false
        return treatment.availability?.some((avail) => {
          const availStart = createArgentinaDate(avail.startDate, avail.startTime)
          const availEnd = createArgentinaDate(avail.endDate, avail.endTime)
          const currentDate = createArgentinaDate(date, time)
          return (
            currentDate >= availStart &&
            currentDate <= availEnd &&
            time >= avail.startTime &&
            time <= avail.endTime &&
            avail.box === box
          )
        })
      })
    },
    [treatments],
  )

  const getCellContent = (time: string, box: string) => {
    const appointment = getAppointmentByTimeAndBox(time, box);
    const availableTreatments = getAvailableTreatments(selectedDate, time, box);

    // Si hay una cita, devolver un div con el color correspondiente
    if (appointment) {
        const duration = appointment.duration || 30; // Duración en minutos
        const endTime = new Date(new Date(`${selectedDate}T${time}`)).getTime() + duration * 60000; // Calcular el tiempo de finalización
        const endTimeStr = formatTimeArgentina(new Date(endTime)); // Formatear el tiempo de finalización

        return (
            <div
                className={getCellClass(time, box)} // Aplicar la clase de color
                style={{ height: '100%' }} // Asegurarse de que ocupe toda la celda
                onClick={() => handleOpenDialog(appointment)} // Mantener la funcionalidad
            >
                <div>{appointment.treatmentName} ({appointment.clientName})</div>
                <div>{time} - {endTimeStr}</div> {/* Mostrar el rango de tiempo */}
            </div>
        );
    }

    // Si hay tratamientos disponibles, devolver un div con el color correspondiente
    if (availableTreatments.length > 0) {
        return (
            <div
                className={getCellClass(time, box)} // Aplicar la clase de color
                style={{ height: '100%' }} // Asegurarse de que ocupe toda la celda
                onClick={() => handleOpenDialog(null, time, box)} // Mantener la funcionalidad
            >
                <div className="font-medium">DISPONIBLE</div>
                {availableTreatments.map((treatment) => (
                    <div key={treatment.id}>{treatment.name}</div>
                ))}
            </div>
        );
    }

    // Si no hay citas ni tratamientos disponibles, devolver un div vacío
    return (
        <div
            className={getCellClass(time, box)} // Aplicar la clase de color
            style={{ height: '100%' }} // Asegurarse de que ocupe toda la celda
            onClick={() => handleOpenDialog(null, time, box)} // Mantener la funcionalidad
        />
    );
  };

  const getCellClass = (time: string, box: string) => {
    const appointment = getAppointmentByTimeAndBox(time, box);
    if (!appointment) {
      const availableTreatments = getAvailableTreatments(selectedDate, time, box);
      if (availableTreatments.length > 0) {
        return "bg-emerald-100 text-emerald-900";
      }
      return "";
    }

    switch (appointment.status) {
      case "available":
        return "bg-emerald-100 text-emerald-900";
      case "reserved":
        return "bg-blue-100 text-blue-900";
      case "confirmed":
        return "bg-amber-100 text-amber-900";
      case "completed":
        return "bg-purple-100 text-purple-900";
      case "cancelled":
        return "bg-red-100 text-red-900";
      default:
        return "";
    }
  }

  const getAppointmentContent = (appointment: Appointment | undefined) => {
    if (!appointment || appointment.status === "available") {
      return <span className="text-xs text-gray-500">Disponible</span>
    }

    const endTime = getEndTime(appointment.time, appointment.duration || 30);

    return (
      <div className="text-xs">
        <div className="font-medium">{appointment.treatmentName}</div>
        <div>{appointment.clientName}</div>
        <div className="text-gray-500">{appointment.professionalName}</div>
        <div className="mt-1 text-gray-600">{appointment.time} - {endTime}</div>
        <div className="mt-1">
          <span className={`px-1 py-0.5 rounded text-xs ${
            appointment.status === "reserved" ? "bg-yellow-100 text-yellow-800" :
            appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
            appointment.status === "completed" ? "bg-green-100 text-green-800" :
            "bg-red-100 text-red-800"
          }`}>
            {appointment.status === "reserved" ? "Reservado" :
             appointment.status === "confirmed" ? "Confirmado" :
             appointment.status === "completed" ? "Completado" :
             "Cancelado"}
          </span>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = createArgentinaDate(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    
    return new Intl.DateTimeFormat('es-AR', options).format(date);
  }

  const changeDate = (direction: 'prev' | 'next') => {
    // SOLUCIÓN JAVASCRIPT PURO: Manipular fechas sin crear objetos Date
    // Esto evita cualquier problema de zona horaria
    const dateParts = selectedDate.split('T')[0].split('-').map(Number);
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    
    // Crear una nueva fecha usando Date solo para calcular el día anterior/siguiente
    // pero sin depender de la representación de la fecha
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    
    if (direction === 'prev') {
      date.setUTCDate(date.getUTCDate() - 1);
    } else {
      date.setUTCDate(date.getUTCDate() + 1);
    }
    
    // Convertir de nuevo a formato ISO YYYY-MM-DD usando UTC
    const newYear = date.getUTCFullYear();
    const newMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const newDay = String(date.getUTCDate()).padStart(2, '0');
    const newDate = `${newYear}-${newMonth}-${newDay}`;
    
    console.log("Nueva fecha seleccionada:", newDate);
    
    setSelectedDate(newDate);
  }

  const getSubTreatments = useCallback(
    (parentId: string) => {
      if (!parentId) return [];
      return treatments.filter(
        (treatment) => treatment.isSubtreatment && treatment.parentId === parseInt(parentId)
      );
    },
    [treatments]
  );

  const handleDeleteAppointment = () => {
    if (!currentAppointment) return;
    
    if (confirm("¿Está seguro que desea eliminar este turno?")) {
      setAppointments(appointments.filter(a => a.id !== currentAppointment.id));
      setIsDialogOpen(false);
      resetForm();
    }
  };

  // Agregar después de los useEffect existentes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch("/api/payment-methods")
        if (response.ok) {
          const data = await response.json()
          setPaymentMethods(data)
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error)
      }
    }

    fetchPaymentMethods()
  }, [])

  // Agregar el useEffect para cargar los productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  // Agregar las funciones de manejo del carrito
  const handleOpenCart = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    // Agregar el tratamiento al carrito
    if (appointment.treatmentId && appointment.treatmentName) {
      setCartItems([{
        treatmentId: appointment.treatmentId,
        quantity: 1,
        price: appointment.price,
        subtotal: appointment.price,
        name: appointment.treatmentName,
        type: 'treatment'
      }])
    }
    setIsCartOpen(true)
  }

  const handleAddProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const product = await response.json()
        setCartItems([
          ...cartItems,
          {
            productId,
            quantity: 1,
            price: product.price,
            subtotal: product.price,
            name: product.name,
            type: 'product'
          }
        ])
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    }
  }

  const handleAddSubtreatment = async (treatmentId: number) => {
    try {
      const treatment = treatments.find(t => t.id === treatmentId);
      if (treatment) {
        setCartItems([
          ...cartItems,
          {
            treatmentId,
            quantity: 1,
            price: treatment.price,
            subtotal: treatment.price,
            name: treatment.name,
            type: 'subtreatment',
            parentId: currentAppointment?.treatmentId || undefined
          }
        ]);
      }
    } catch (error) {
      console.error("Error adding subtreatment:", error);
    }
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const newCartItems = [...cartItems]
    newCartItems[index].quantity = quantity
    newCartItems[index].subtotal = quantity * newCartItems[index].price
    setCartItems(newCartItems)
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleAddPayment = () => {
    if (selectedPaymentMethod && paymentAmount) {
      setPayments([
        ...payments,
        {
          paymentMethodId: selectedPaymentMethod,
          amount: parseFloat(paymentAmount),
          reference: paymentReference,
        }
      ])
      setSelectedPaymentMethod(null)
      setPaymentAmount("")
      setPaymentReference("")
    }
  }

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const getPaymentsTotal = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const handleCompleteSale = async () => {
    if (!currentAppointment?.clientId) return;

    try {
        // Crear la venta
        const response = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientId: currentAppointment.clientId,
                appointmentId: currentAppointment.id,
                total: getCartTotal(),
                items: cartItems.map(item => ({
                    productId: item.productId,
                    treatmentId: item.treatmentId,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal
                })),
                payments: payments.map(payment => ({
                    paymentMethodId: payment.paymentMethodId,
                    amount: payment.amount,
                    reference: payment.reference
                })),
                deposit: parseFloat(formData.deposit) // Guardar el registro de SEÑA
            })
        });

        if (response.ok) {
            // Actualizar el estado del turno a "completed"
            const appointmentResponse = await fetch("/api/appointments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentAppointment.id,
                    date: currentAppointment.date,
                    time: currentAppointment.time,
                    status: "completed",
                    professionalId: currentAppointment.professionalId,
                    treatmentId: currentAppointment.treatmentId,
                    clientId: currentAppointment.clientId,
                    box: currentAppointment.box,
                    deposit: currentAppointment.deposit,
                    price: currentAppointment.price,
                    notes: currentAppointment.notes,
                    duration: currentAppointment.duration
                })
            });

            if (appointmentResponse.ok) {
                toast({
                    title: "Venta completada",
                    description: "La venta se ha registrado correctamente.",
                });
                setIsCartOpen(false);
                setCartItems([]);
                setPayments([]);
                setSelectedPaymentMethod(null);
                setPaymentAmount("");
                setPaymentReference("");
                // Actualizar la lista de turnos
                fetchAppointments();
            }
        }
    } catch (error) {
        console.error("Error completing sale:", error);
        toast({
            title: "Error",
            description: "Ha ocurrido un error al procesar la venta.",
            variant: "destructive",
        });
    }
  };

  // Agregar después de los useEffect existentes
  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId")
    const openCart = searchParams.get("openCart")

    if (appointmentId && openCart === "true") {
      const appointment = appointments.find(a => a.id === parseInt(appointmentId))
      if (appointment) {
        handleOpenCart(appointment)
      }
    }
  }, [searchParams, appointments])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Actualiza cada segundo
    return () => clearInterval(interval);
  }, []);

  const currentHour = currentDateTime.getHours();
  const currentMinute = currentDateTime.getMinutes();

  // Agregar después de las funciones existentes
  const getWeekDates = () => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date.setDate(diff + i));
      weekDates.push(newDate.toISOString().split('T')[0]);
    }
    
    return weekDates;
  };

  const getMonthDates = () => {
    const date = new Date(selectedDate);
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthDates = [];
    
    // Retroceder hasta el domingo anterior al primer día
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Avanzar hasta el sábado posterior al último día
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
      monthDates.push(currentDate.toISOString().split('T')[0]);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    return monthDates;
  };

  const WeeklyView = () => {
    const weekDates = getWeekDates();
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Hora</TableHead>
                    {weekDates.map((date) => (
                        <TableHead key={date} className="text-center">
                            {formatDate(date)}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {timeSlots.map((time) => (
                    <TableRow key={time}>
                        <TableCell>{time}</TableCell>
                        {weekDates.map((date) => (
                            <TableCell key={`${date}-${time}`} className="p-0 h-10">
                                <div className="grid grid-cols-5 gap-0">
                                    {boxes.map((box) => (
                                        <div key={`${date}-${time}-${box}`} className="border-r last:border-r-0">
                                            {getCellContent(time, box)} {/* Solo colores, sin texto */}
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
  };

  const MonthlyView = () => {
    const monthDates = getMonthDates();
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeks = [];
    
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {daysOfWeek.map((day) => (
              <TableHead key={day} className="text-center">{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((week, weekIndex) => (
            <TableRow key={weekIndex} className="h-32">
              {week.map((date) => {
                const dayAppointments = appointments.filter(
                  app => app.date === date
                );
                const isCurrentMonth = new Date(date).getMonth() === new Date(selectedDate).getMonth();
                
                return (
                  <TableCell 
                    key={date} 
                    className={`align-top p-1 ${isCurrentMonth ? '' : 'bg-gray-50'}`}
                  >
                    <div className="font-bold mb-1">
                      {new Date(date).getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => handleOpenDialog(app)}
                          className={`text-xs p-1 rounded ${getCellClass(app.time, app.box)}`}
                        >
                          <div className="font-medium">{app.time}</div>
                          <div>{app.treatmentName}</div>
                          <div className="text-xs">{app.box}</div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const DailyView = () => {
    return (
      <div className="flex flex-col h-[calc(100vh-250px)]">
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b sticky top-0 bg-white z-10">
          <div className="p-4 font-semibold">Hora</div>
          {boxes.map((box) => (
            <div key={box} className="p-4 font-semibold text-center border-l">
              {box}
            </div>
          ))}
        </div>
        
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <div className="grid grid-cols-[100px_repeat(5,1fr)]">
            {timeSlots.map((time) => (
              <div key={time} className="contents">
                <div className="p-4 border-b text-sm text-gray-500 sticky left-0 bg-white">
                  {time}
                </div>
                {boxes.map((box) => {
                  const appointment = getAppointmentByTimeAndBox(time, box);
                  const availableTreatments = getAvailableTreatments(selectedDate, time, box);
                  const hasAvailableTreatments = availableTreatments.length > 0;
                  
                  return (
                    <div 
                      key={`${time}-${box}`} 
                      className={`relative border-l border-b min-h-[100px] group ${hasAvailableTreatments && !appointment ? 'bg-green-50' : ''}`}
                      onClick={() => !appointment && handleOpenDialog(null, time, box)}
                    >
                      {appointment ? (
                        <div 
                          className={`
                            absolute inset-1 rounded-lg p-2 
                            ${getCellClass(time, box)}
                            transition-transform group-hover:scale-[1.02]
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(appointment);
                          }}
                        >
                          {getAppointmentContent(appointment)}
                        </div>
                      ) : hasAvailableTreatments ? (
                        <div className="absolute inset-1 rounded-lg p-2 bg-green-100 transition-transform group-hover:scale-[1.02]">
                          <div className="font-medium">DISPONIBLE</div>
                          {availableTreatments.slice(0, 3).map((treatment) => (
                            <div key={treatment.id} className="text-sm truncate">{treatment.name}</div>
                          ))}
                          {availableTreatments.length > 3 && (
                            <div className="text-xs text-gray-500">+{availableTreatments.length - 3} más</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AGENDA2 = () => {
    const timeSlots = Array.from({ length: 25 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8; // Horas de 08:00 a 20:00
        const minutes = (i % 2) * 30; // 0 o 30 minutos
        return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Hora</TableHead>
                        {boxes.map((box) => (
                            <TableHead key={box}>{box}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {timeSlots.map((time) => (
                        <TableRow key={time}>
                            <TableCell>{time}</TableCell>
                            {boxes.map((box) => (
                                <TableCell key={`${time}-${box}`} style={{ position: 'relative', height: '60px' }}>
                                    {/* Aquí se renderizarán los sub-tratamientos */}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
  };

  const handleDrop = (time: string, box: string, treatment: Treatment) => {
    // Lógica para manejar el arrastre y soltar el tratamiento en la celda correspondiente
    // Ajustar el tamaño de la celda según la duración del tratamiento
    console.log(`Dropped treatment ${treatment.name} at ${time} in ${box}`);
  };

  const renderTreatmentCell = (treatment: Treatment) => {
    const durationInMinutes = treatment.duration || 30; // Duración en minutos
    const height = (durationInMinutes / 30) * 60; // Ajustar la altura de la celda

    return (
        <div
            style={{ height: `${height}px`, cursor: 'move' }}
            draggable
            onDragEnd={() => handleDrop(treatment.availability?.[0]?.startTime || '09:00', treatment.availability?.[0]?.box || 'Box 1', treatment)}
        >
            {treatment.name}
        </div>
    );
  };

  // Función para abrir el diálogo del turno especial
  const openSpecialAppointmentDialog = () => {
    setSpecialAppointment(
      {
        ...initialSpecialAppointment,
        newClientName: '',
        newClientPhone: ''
      }
    );
    setIsSpecialDialogOpen(true);
  };

  // Función para resetear el formulario del turno especial
  const resetSpecialForm = () => {
    setSpecialAppointment(
      {
        ...initialSpecialAppointment,
        newClientName: '',
        newClientPhone: ''
      }
    );
  };

  // Función para manejar la creación del turno especial
  const handleCreateSpecialAppointment = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!specialAppointment || !specialAppointment.treatmentId || !specialAppointment.box) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }

    try {
        // Omitir los campos adicionales al enviar al API
        const { newClientName, newClientPhone, ...appointmentData } = specialAppointment;
        
        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error de la API:", errorData);
            throw new Error(`Error al crear el turno especial: ${errorData.message || 'Error desconocido'}`);
        }

        const savedAppointment = await response.json();
        setAppointments((prev) => [...prev, savedAppointment]);
        setIsSpecialDialogOpen(false);
        resetSpecialForm();
    } catch (error) {
        console.error("Error creando el turno especial:", error);
        alert(`Error al crear el turno especial: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-100px)] bg-white">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Agenda</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openSpecialAppointmentDialog}
              className="text-blue-600 hover:text-blue-700"
            >
              + Nuevo Turno
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => changeDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-lg font-medium">
                {formatDate(selectedDate)}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => changeDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => setView('daily')} 
              variant={view === 'daily' ? 'default' : 'ghost'}
              size="sm"
            >
              Día
            </Button>
            <Button 
              onClick={() => setView('weekly')} 
              variant={view === 'weekly' ? 'default' : 'ghost'}
              size="sm"
            >
              Semana
            </Button>
            <Button 
              onClick={() => setView('monthly')} 
              variant={view === 'monthly' ? 'default' : 'ghost'}
              size="sm"
            >
              Mes
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {view === 'daily' && <DailyView />}
              {view === 'weekly' && <WeeklyView />}
              {view === 'monthly' && <MonthlyView />}
              {view === 'agenda2' && <AGENDA2 />}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentAppointment ? "Editar Turno" : "Nuevo Turno"}</DialogTitle>
            <DialogDescription>Complete los datos del turno.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[calc(80vh-180px)] overflow-y-auto pr-2">
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
                  <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className={`
                    ${formData.status === "available" ? "bg-green-500 text-white" : ""}
                    ${formData.status === "reserved" ? "bg-blue-300 text-black" : ""}
                    ${formData.status === "confirmed" ? "bg-orange-400 text-black" : ""}
                    ${formData.status === "completed" ? "bg-pink-400 text-black" : ""}
                    ${formData.status === "cancelled" ? "bg-red-500 text-white" : ""}
                  `}>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available" className="bg-green-500 text-white">Disponible</SelectItem>
                    <SelectItem value="reserved" className="bg-blue-300 text-black">Reservado</SelectItem>
                    <SelectItem value="confirmed" className="bg-orange-400 text-black">Confirmado</SelectItem>
                    <SelectItem value="completed" className="bg-pink-400 text-black">Completado</SelectItem>
                    <SelectItem value="cancelled" className="bg-red-500 text-white">Cancelado</SelectItem>
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
                    {boxes.map((box) => (
                      <SelectItem key={box} value={box}>
                        {box}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="professionalId">Profesional (Opcional)</Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) => handleSelectChange("professionalId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin profesional asignado</SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id.toString()}>
                        {professional.name} - {professional.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="treatmentId">Sub-tratamiento</Label>
                <Select
                  value={formData.treatmentId}
                  onValueChange={(value) => handleSelectChange("treatmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione sub-tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTreatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id.toString()}>
                        {treatment.name} - ${treatment.price} - {treatment.duration} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientId">Cliente</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Crear nuevo cliente</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {!formData.clientId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newClientName">Nombre del cliente</Label>
                    <Input
                      id="newClientName"
                      name="newClientName"
                      placeholder="Nombre completo"
                      value={formData.newClientName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newClientPhone">Teléfono</Label>
                    <Input
                      id="newClientPhone"
                      name="newClientPhone"
                      placeholder="Número de teléfono"
                      value={formData.newClientPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Seña ($)</Label>
                  <Input
                    id="deposit"
                    name="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio Total ($)</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {currentAppointment && (
                <>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDeleteAppointment}
                  >
                    Eliminar Turno
                  </Button>
                  {(currentAppointment.status === "confirmed" || currentAppointment.status === "completed") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenCart(currentAppointment)}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {currentAppointment.status === "completed" ? "PAGADO" : "PAGAR"}
                    </Button>
                  )}
                </>
              )}
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Carrito de Compras</DialogTitle>
            <DialogDescription>
              Agregue productos y complete el pago.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Agregar Producto</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => handleAddProduct(parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="px-3" 
                    onClick={() => {
                      const productSelect = document.querySelector('[name="product"]') as HTMLSelectElement;
                      if (productSelect && productSelect.value) {
                        handleAddProduct(parseInt(productSelect.value));
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Agregar Sub-tratamiento</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => handleAddSubtreatment(parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccione un sub-tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments
                        .filter(t => t.isSubtreatment)
                        .map((treatment) => (
                          <SelectItem key={treatment.id} value={treatment.id.toString()}>
                            {treatment.name} - ${treatment.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="px-3" 
                    onClick={() => {
                      const treatmentSelect = document.querySelector('[name="subtreatment"]') as HTMLSelectElement;
                      if (treatmentSelect && treatmentSelect.value) {
                        handleAddSubtreatment(parseInt(treatmentSelect.value));
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="grid gap-1">
                      <div className="font-medium">
                        {item.name}
                        {item.type === 'subtreatment' && <span className="text-sm text-muted-foreground ml-2">(Sub-tratamiento)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price} x {item.quantity} = ${item.subtotal}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Total del Carrito:</div>
                <div>${getCartTotal()}</div>
              </div>

              <div className="grid gap-2">
                <Label>Método de Pago</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedPaymentMethod?.toString()}
                    onValueChange={(value) => setSelectedPaymentMethod(parseInt(value))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Monto"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-32"
                  />
                  <Input
                    placeholder="Referencia"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddPayment}>Agregar</Button>
                </div>
              </div>

              <ScrollArea className="h-[100px] rounded-md border p-4">
                <div className="space-y-4">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="grid gap-1">
                        <div className="font-medium">
                          {paymentMethods.find(m => m.id === payment.paymentMethodId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${payment.amount} {payment.reference && `- Ref: ${payment.reference}`}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between font-medium">
                <div>Total Pagado:</div>
                <div>${getPaymentsTotal()}</div>
              </div>

              <div className="flex items-center justify-between font-medium text-lg">
                <div>Saldo:</div>
                <div>${getCartTotal() - getPaymentsTotal()}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompleteSale} disabled={getCartTotal() !== getPaymentsTotal()}>
              Completar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear el TURNO ESPECIAL */}
      <Dialog open={isSpecialDialogOpen} onOpenChange={setIsSpecialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear TURNO ESPECIAL</DialogTitle>
            <DialogDescription>Complete los datos del turno especial.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSpecialAppointment}>
            <div className="grid gap-4">
              <Label htmlFor="clientId">Cliente</Label>
              <Select 
                value={specialAppointment.clientId?.toString() || ""} 
                onValueChange={(value) => 
                  setSpecialAppointment({ 
                    ...specialAppointment, 
                    clientId: value ? parseInt(value) : null 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Crear nuevo cliente</SelectItem>
                  {clients.sort((a, b) => a.name.localeCompare(b.name)).map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!specialAppointment.clientId && (
                <div className="grid gap-2">
                  <Label htmlFor="newClientName">Nombre del cliente</Label>
                  <Input
                    id="newClientName"
                    name="newClientName"
                    placeholder="Nombre completo"
                    value={specialAppointment.newClientName || ''}
                    onChange={(e) => 
                      setSpecialAppointment({ 
                        ...specialAppointment, 
                        newClientName: e.target.value 
                      })
                    }
                  />
                </div>
              )}

              <Label htmlFor="treatmentId">Tratamiento</Label>
              <Select 
                value={specialAppointment.treatmentId?.toString() || ""} 
                onValueChange={(value) => 
                  setSpecialAppointment({ 
                    ...specialAppointment, 
                    treatmentId: value ? parseInt(value) : null 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tratamiento" />
                </SelectTrigger>
                <SelectContent>
                  {treatments
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id.toString()}>
                        {treatment.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>

              <Label htmlFor="box">Box</Label>
              <Select value={specialAppointment.box} onValueChange={(value) => setSpecialAppointment({ ...specialAppointment, box: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione box" />
                </SelectTrigger>
                <SelectContent>
                  {boxes.sort().map((box) => (
                    <SelectItem key={box} value={box}>
                      {box}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={specialAppointment.date}
                onChange={(e) => setSpecialAppointment({ ...specialAppointment, date: e.target.value })}
                required
              />

              <Label htmlFor="time">Hora</Label>
              <Select value={specialAppointment.time} onValueChange={(value) => setSpecialAppointment({ ...specialAppointment, time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsSpecialDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

