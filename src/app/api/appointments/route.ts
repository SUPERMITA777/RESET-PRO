import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, addMinutes } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
<<<<<<< HEAD
    console.log('Datos recibidos para crear cita:', data);
    
    // Validar datos requeridos
    if (!data.treatmentId || !data.date || !data.time || !data.clientId) {
=======
    
    // Validar datos requeridos
    if (!data.serviceId || !data.date || !data.time || !data.clientName) {
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
      return NextResponse.json(
        { error: 'Faltan datos requeridos para la cita' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Obtener el tratamiento para conocer su duración
    const treatment = await prisma.treatment.findUnique({
      where: { id: data.treatmentId }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamiento no encontrado' },
=======
    // Obtener el servicio para conocer su duración
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
        { status: 404 }
      );
    }

    // Calcular hora de inicio y fin
    const startDateTime = parse(`${data.date} ${data.time}`, 'yyyy-MM-dd HH:mm', new Date());
<<<<<<< HEAD
    const endDateTime = addMinutes(startDateTime, treatment.duration || 60);
=======
    const endDateTime = addMinutes(startDateTime, service.duration);
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb

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
<<<<<<< HEAD
        treatmentId: data.treatmentId,
        clientId: data.clientId,
        professionalId: data.professionalId,
=======
        serviceId: data.serviceId,
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'PENDIENTE',
        paymentStatus: 'PENDIENTE',
<<<<<<< HEAD
        box: data.box || null,
        deposit: data.deposit || 0,
        notes: data.notes || null
      },
      include: {
        professional: true,
        treatment: true,
        client: true
      }
    });

    console.log('Cita creada:', appointment);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear cita:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'El tratamiento o cliente no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al crear la cita', 
        details: error.message || String(error),
        code: error.code
      },
=======
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
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
=======
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

>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
// GET - Obtener todas las citas
export async function GET() {
  try {
    console.log('Obteniendo citas...');
<<<<<<< HEAD
    
    // Verificar la conexión a la base de datos
    try {
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');
    } catch (dbError) {
      console.error('Error al conectar con la base de datos:', dbError);
      return NextResponse.json(
        { 
          error: 'Error de conexión con la base de datos', 
          details: String(dbError)
        },
        { status: 500 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      include: {
        professional: true,
        treatment: true,
        client: true,
      },
      orderBy: {
        date: 'asc',
        startTime: 'asc'
      }
    });

    // Formatear las fechas y mapear las relaciones para la respuesta
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      professionalName: appointment.professional?.name || null,
      treatmentName: appointment.treatment?.name || null,
      clientName: appointment.client?.name || null,
      clientPhone: appointment.client?.phone || null
    }));

    console.log(`Obtenidas ${formattedAppointments.length} citas exitosamente`);
    return NextResponse.json(formattedAppointments);
  } catch (error: any) {
    console.error('Error al obtener citas:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Error de conexión con la base de datos',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al obtener citas', 
        details: error.message || String(error),
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Conexión a la base de datos cerrada');
    } catch (disconnectError) {
      console.error('Error al cerrar la conexión:', disconnectError);
    }
=======
    return NextResponse.json(mockAppointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
  }
} 