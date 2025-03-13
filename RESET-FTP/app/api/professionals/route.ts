import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    console.error('Error al obtener professionals:', error);
    return NextResponse.json(
      { error: 'Error al obtener professionals' },
      { status: 500 }
    );
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
            startDate: new Date(body.availability.startDate),
            endDate: new Date(body.availability.endDate),
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
    console.error('Error al crear professional:', error);
    return NextResponse.json(
      { error: 'Error al crear professional' },
      { status: 500 }
    );
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
            startDate: new Date(body.availability.startDate),
            endDate: new Date(body.availability.endDate),
            startTime: body.availability.startTime,
            endTime: body.availability.endTime,
          },
        });
      } else {
        // Crear nueva disponibilidad
        await prisma.professionalAvailability.create({
          data: {
            professionalId: body.id,
            startDate: new Date(body.availability.startDate),
            endDate: new Date(body.availability.endDate),
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
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    // Si no hay ID en la ruta, devolvemos un error
    if (pathParts.length <= 3 || idPart === 'professionals') {
      return NextResponse.json({ error: 'ID de profesional no especificado' }, { status: 400 });
    }
    
    const id = parseInt(idPart);
    
    // Verificar si el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id },
    });
    
    if (!existingProfessional) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }
    
    // Eliminar el profesional
    await prisma.professional.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar profesional:", error);
    return NextResponse.json({ error: 'Error al eliminar el profesional' }, { status: 400 });
  }
} 