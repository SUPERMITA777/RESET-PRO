'use client';

import { useState, useEffect, useCallback } from 'react';

// Definir la interfaz para las citas
interface Appointment {
  id: number;
  date: string;
  startTime: string;
  professional: { name: string };
  service: { name: string; price: number };
  status: string;
  paymentStatus: string;
  clientName: string;
}

// Datos de ejemplo para citas
const mockAppointments: Appointment[] = [
  {
    id: 1,
    date: new Date().toLocaleDateString(),
    startTime: '09:00',
    professional: { name: 'María López' },
    service: { name: 'Limpieza Facial', price: 45000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PENDIENTE',
    clientName: 'Juan Pérez'
  },
  {
    id: 2,
    date: new Date().toLocaleDateString(),
    startTime: '10:30',
    professional: { name: 'Carlos Rodríguez' },
    service: { name: 'Masaje Relajante', price: 60000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PAGADO',
    clientName: 'Ana Gómez'
  },
  {
    id: 3,
    date: new Date(Date.now() + 86400000).toLocaleDateString(), // Mañana
    startTime: '11:45',
    professional: { name: 'Sandra Gómez' },
    service: { name: 'Manicure', price: 25000 },
    status: 'PENDIENTE',
    paymentStatus: 'PENDIENTE',
    clientName: 'Laura Martínez'
  }
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las citas
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError('Error al cargar las citas. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para pagar una cita
  const payAppointment = useCallback(async (appointmentId: number) => {
    try {
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizamos el estado local
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, paymentStatus: 'PAGADO' } 
            : appointment
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      throw err;
    }
  }, []);

  // Cargar citas al montar el componente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Función para recargar las citas
  const refetch = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    payAppointment,
    refetch,
  };
} 