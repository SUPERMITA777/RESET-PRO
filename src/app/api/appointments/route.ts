import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, addMinutes } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.serviceId || !data.date || !data.time || !data.clientName) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para la cita' },
        { status: 400 }
      );
    }

    // Obtener el servicio para conocer su duración
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Calcular hora de inicio y fin
    const startDateTime = parse(`${data.date} ${data.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = addMinutes(startDateTime, service.duration);

    // Verificar si el horario está disponible
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: new Date(data.date),
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ],
        status: {
          in: ['CONFIRMADO', 'PENDIENTE']
        }
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'El horario seleccionado ya no está disponible' },
        { status: 409 }
      );
    }

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        serviceId: data.serviceId,
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'PENDIENTE',
        paymentStatus: 'PENDIENTE',
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        clientPhone: data.clientPhone || null,
        notes: data.notes || null
      }
    });

    return NextResponse.json(
      { 
        message: 'Cita creada exitosamente', 
        appointmentId: appointment.id 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear cita:', error);
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    );
  }
}

// Datos de ejemplo para citas
const mockAppointments = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    professional: { name: 'María López' },
    service: { name: 'Limpieza Facial', price: 45000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PENDIENTE',
    clientName: 'Juan Pérez',
    duration: 60
  },
  {
    id: 2,
    date: new Date().toISOString().split('T')[0],
    startTime: '10:30',
    professional: { name: 'Carlos Rodríguez' },
    service: { name: 'Masaje Relajante', price: 60000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PAGADO',
    clientName: 'Ana Gómez',
    duration: 90
  },
  {
    id: 3,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    startTime: '11:45',
    professional: { name: 'Sandra Gómez' },
    service: { name: 'Manicure', price: 25000 },
    status: 'PENDIENTE',
    paymentStatus: 'PENDIENTE',
    clientName: 'Laura Martínez',
    duration: 45
  },
  {
    id: 4,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    startTime: '14:00',
    professional: { name: 'María López' },
    service: { name: 'Hidratación Facial', price: 55000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PENDIENTE',
    clientName: 'Roberto Sánchez',
    duration: 60
  },
  {
    id: 5,
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Pasado mañana
    startTime: '16:30',
    professional: { name: 'Sandra Gómez' },
    service: { name: 'Depilación Piernas', price: 35000 },
    status: 'CONFIRMADO',
    paymentStatus: 'PENDIENTE',
    clientName: 'Carmen Díaz',
    duration: 75
  }
];

// GET - Obtener todas las citas
export async function GET() {
  try {
    console.log('Obteniendo citas...');
    return NextResponse.json(mockAppointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
  }
} 