import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/professionals
export async function GET() {
  console.log('Iniciando solicitud GET /api/professionals');
  try {
    console.log('Intentando obtener profesionales desde la base de datos...');
    const professionals = await prisma.professional.findMany({
      include: {
        professionalAvailability: true,
      },
    });
    console.log(`Profesionales obtenidos exitosamente: ${professionals.length}`);
    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error detallado al obtener profesionales:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesionales', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/professionals
export async function POST(request: Request) {
  console.log('Iniciando solicitud POST /api/professionals');
  try {
    const body = await request.json();
    console.log('Datos recibidos:', JSON.stringify(body));

    const newProfessional = await prisma.professional.create({
      data: {
        name: body.name,
        specialty: body.specialty,
        phone: body.phone,
        professionalAvailability: body.availability ? {
          create: {
            startDate: new Date(body.availability.startDate),
            endDate: new Date(body.availability.endDate),
            startTime: body.availability.startTime,
            endTime: body.availability.endTime,
          }
        } : undefined,
      },
      include: {
        professionalAvailability: true,
      },
    });

    console.log('Profesional creado exitosamente:', newProfessional.id);
    return NextResponse.json(newProfessional, { status: 201 });
  } catch (error) {
    console.error('Error detallado al crear profesional:', error);
    return NextResponse.json(
      { error: 'Error al crear profesional', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/professionals
export async function PUT(request: Request) {
  console.log('Iniciando solicitud PUT /api/professionals');
  try {
    const body = await request.json();
    console.log('Datos recibidos para actualización:', JSON.stringify(body));
    
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
        phone: body.phone,
      },
      include: {
        professionalAvailability: true,
      },
    });
    
    console.log('Profesional actualizado exitosamente:', updatedProfessional.id);
    return NextResponse.json(updatedProfessional);
  } catch (error) {
    console.error("Error detallado al actualizar profesional:", error);
    return NextResponse.json({ error: 'Error al actualizar el profesional', details: String(error) }, { status: 400 });
  }
}

// DELETE /api/professionals/:id
export async function DELETE(request: Request) {
  console.log('Iniciando solicitud DELETE /api/professionals/:id');
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    // Si no hay ID en la ruta, devolvemos un error
    if (pathParts.length <= 3 || idPart === 'professionals') {
      console.error('ID de profesional no especificado en la ruta');
      return NextResponse.json({ error: 'ID de profesional no especificado' }, { status: 400 });
    }
    
    const id = parseInt(idPart);
    console.log(`Intentando eliminar profesional con ID: ${id}`);
    
    // Verificar si el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id },
    });
    
    if (!existingProfessional) {
      console.error(`Profesional con ID ${id} no encontrado`);
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }
    
    // Eliminar el profesional
    await prisma.professional.delete({
      where: { id },
    });
    
    console.log(`Profesional con ID ${id} eliminado exitosamente`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error detallado al eliminar profesional:", error);
    return NextResponse.json({ error: 'Error al eliminar el profesional', details: String(error) }, { status: 400 });
  }
} 