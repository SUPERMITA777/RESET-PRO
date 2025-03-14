import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, addMinutes } from 'date-fns';

// GET /api/appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        professional: true,
        treatment: true,
        client: true,
      },
    });

    // Formatear las fechas y mapear las relaciones para la respuesta
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      date: appointment.date.toISOString().split('T')[0],
      professionalName: appointment.professional?.name || null,
      treatmentName: appointment.treatment?.name || null,
      clientName: appointment.client?.name || null,
      clientPhone: appointment.client?.phone || null
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error al obtener appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments
export async function POST(request: Request) {
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
        service: {
          connect: { id: data.serviceId }
        },
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'PENDIENTE',
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        notes: 'Cita creada desde el portal de clientes'
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

// PUT /api/appointments
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar si la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: body.id },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }
    
    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id: body.id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
        professionalId: body.professionalId,
        treatmentId: body.treatmentId,
        clientId: body.clientId,
        box: body.box,
        deposit: body.deposit,
        price: body.price,
        notes: body.notes,
        duration: body.duration,
      },
    });
    
    // Obtener la cita actualizada con sus relaciones
    const appointmentWithRelations = await prisma.appointment.findUnique({
      where: { id: updatedAppointment.id },
      include: {
        professional: true,
        treatment: true,
        client: true,
      },
    });
    
    // Formatear la fecha y mapear las relaciones para la respuesta
    const formattedAppointment = {
      ...appointmentWithRelations,
      date: appointmentWithRelations?.date.toISOString().split('T')[0],
      professionalName: appointmentWithRelations?.professional?.name || null,
      treatmentName: appointmentWithRelations?.treatment?.name || null,
      clientName: appointmentWithRelations?.client?.name || null,
      clientPhone: appointmentWithRelations?.client?.phone || null
    };
    
    console.log("Cita actualizada:", JSON.stringify(formattedAppointment, null, 2));
    
    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error('Error al actualizar appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/:id
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    // Si no hay ID en la ruta, devolvemos un error
    if (pathParts.length <= 3 || idPart === 'appointments') {
      return NextResponse.json({ error: 'ID de cita no especificado' }, { status: 400 });
    }
    
    const id = parseInt(idPart);
    
    // Verificar si la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }
    
    // Eliminar la cita
    await prisma.appointment.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    return NextResponse.json({ error: 'Error al eliminar la cita' }, { status: 400 });
  }
} 