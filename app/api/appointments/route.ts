import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const body = await request.json();
    
    // Crear la cita
    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        time: body.time,
        status: body.status || 'reserved',
        professionalId: body.professionalId,
        treatmentId: body.treatmentId,
        clientId: body.clientId,
        box: body.box,
        deposit: body.deposit || 0,
        price: body.price,
        notes: body.notes,
        duration: body.duration,
      },
    });
    
    // Obtener la cita con sus relaciones
    const appointmentWithRelations = await prisma.appointment.findUnique({
      where: { id: newAppointment.id },
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
    
    console.log("Nueva cita:", JSON.stringify(formattedAppointment, null, 2));
    
    return NextResponse.json(formattedAppointment, { status: 201 });
  } catch (error) {
    console.error('Error al crear appointment:', error);
    return NextResponse.json(
      { error: 'Error al crear appointment' },
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
        time: body.time,
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