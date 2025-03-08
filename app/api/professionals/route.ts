import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/professionals
export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      include: {
        availability: true,
      },
    });
    return NextResponse.json(professionals);
  } catch (error) {
    console.error("Error al obtener profesionales:", error);
    return NextResponse.json({ error: 'Error al obtener los profesionales' }, { status: 500 });
  }
}

// POST /api/professionals
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newProfessional = await prisma.professional.create({
      data: {
        name: body.name,
        specialty: body.specialty,
        availability: body.availability ? {
          create: {
            startDate: body.availability.startDate,
            endDate: body.availability.endDate,
            startTime: body.availability.startTime,
            endTime: body.availability.endTime,
          }
        } : undefined,
      },
      include: {
        availability: true,
      },
    });
    
    return NextResponse.json(newProfessional, { status: 201 });
  } catch (error) {
    console.error("Error al crear profesional:", error);
    return NextResponse.json({ error: 'Error al crear el profesional' }, { status: 400 });
  }
}

// PUT /api/professionals
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Si hay disponibilidad, actualizar o crear
    if (body.availability) {
      if (body.availability.id) {
        // Actualizar disponibilidad existente
        await prisma.professionalAvailability.update({
          where: { id: body.availability.id },
          data: {
            startDate: body.availability.startDate,
            endDate: body.availability.endDate,
            startTime: body.availability.startTime,
            endTime: body.availability.endTime,
          },
        });
      } else {
        // Crear nueva disponibilidad
        await prisma.professionalAvailability.create({
          data: {
            professionalId: body.id,
            startDate: body.availability.startDate,
            endDate: body.availability.endDate,
            startTime: body.availability.startTime,
            endTime: body.availability.endTime,
          },
        });
      }
    }
    
    const updatedProfessional = await prisma.professional.update({
      where: { id: body.id },
      data: {
        name: body.name,
        specialty: body.specialty,
      },
      include: {
        availability: true,
      },
    });
    
    return NextResponse.json(updatedProfessional);
  } catch (error) {
    console.error("Error al actualizar profesional:", error);
    return NextResponse.json({ error: 'Error al actualizar el profesional' }, { status: 400 });
  }
}

// DELETE /api/professionals/:id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.professional.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Profesional eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar profesional:", error);
    return NextResponse.json({ error: 'Error al eliminar el profesional' }, { status: 400 });
  }
} 