import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, format, addMinutes, isBefore, isAfter, set } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!dateParam || !serviceId) {
      return NextResponse.json(
        { error: 'Se requiere fecha y ID de servicio' },
        { status: 400 }
      );
    }

    // Parsear la fecha
    const date = parse(dateParam, 'yyyy-MM-dd', new Date());
    
    // Obtener el servicio para conocer su duración
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Duración del servicio en minutos
    const serviceDuration = service.duration;

    // Obtener citas existentes para esa fecha
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          equals: new Date(dateParam)
        },
        status: {
          in: ['CONFIRMADO', 'PENDIENTE']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Definir horario de trabajo (9:00 AM - 7:00 PM)
    const workdayStart = set(date, { hours: 9, minutes: 0, seconds: 0 });
    const workdayEnd = set(date, { hours: 19, minutes: 0, seconds: 0 });
    
    // Generar slots de 30 minutos
    const slots = [];
    let currentSlot = workdayStart;
    
    while (isBefore(currentSlot, workdayEnd)) {
      const slotEnd = addMinutes(currentSlot, serviceDuration);
      
      // Verificar si el slot está disponible
      const isSlotAvailable = !existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.startTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        // Verificar si hay superposición
        return (
          (isBefore(currentSlot, appointmentEnd) && isAfter(slotEnd, appointmentStart)) ||
          (isBefore(appointmentStart, slotEnd) && isAfter(appointmentEnd, currentSlot))
        );
      });
      
      if (isSlotAvailable) {
        slots.push(format(currentSlot, 'HH:mm'));
      }
      
      // Avanzar al siguiente slot (30 minutos)
      currentSlot = addMinutes(currentSlot, 30);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    );
  }
} 