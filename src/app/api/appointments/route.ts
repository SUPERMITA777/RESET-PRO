import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, addMinutes } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Datos recibidos para crear cita:', data);
    
    // Validar datos requeridos
    if (!data.treatmentId || !data.date || !data.time || !data.clientId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para la cita' },
        { status: 400 }
      );
    }

    // Obtener el tratamiento para conocer su duración
    const treatment = await prisma.treatment.findUnique({
      where: { id: data.treatmentId }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamiento no encontrado' },
        { status: 404 }
      );
    }

    // Calcular hora de inicio y fin
    const startDateTime = parse(`${data.date} ${data.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = addMinutes(startDateTime, treatment.duration || 60);

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
        treatmentId: data.treatmentId,
        clientId: data.clientId,
        professionalId: data.professionalId,
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'PENDIENTE',
        paymentStatus: 'PENDIENTE',
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
      { status: 500 }
    );
  }
}

// GET - Obtener todas las citas
export async function GET() {
  try {
    console.log('Obteniendo citas...');
    
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
  }
} 