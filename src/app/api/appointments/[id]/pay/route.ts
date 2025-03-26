import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Procesar el pago de una cita
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = parseInt(params.id);
    
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'ID de cita inválido' },
        { status: 400 }
      );
    }
    
    console.log(`Procesando pago para la cita ID: ${appointmentId}`);
    
    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' }, 
        { status: 404 }
      );
    }

    // Verificar que la cita no esté ya pagada
    if (existingAppointment.paymentStatus === 'PAGADO') {
      return NextResponse.json(
        { error: 'Esta cita ya ha sido pagada' }, 
        { status: 400 }
      );
    }

    // Actualizar estado de pago
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        paymentStatus: 'PAGADO',
        status: 'CONFIRMADO'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pago procesado correctamente',
      appointmentId
    });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
} 