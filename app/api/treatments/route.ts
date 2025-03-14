import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Definimos la interfaz para el tipo Treatment
interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  isSubtreatment: boolean;
  parentId: number | null;
  alwaysAvailable?: boolean;
  availability: Array<{
    id?: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    box: string;
  }> | null;
}

// Definimos la interfaz para la disponibilidad
interface Availability {
  id?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  box: string;
}

// GET /api/treatments
export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({
      include: {
        Availability: true,
        subTreatments: true,
      },
    });

    // Transformar los datos para mantener la compatibilidad con el frontend
    const formattedTreatments = treatments.map(treatment => ({
      id: treatment.id,
      name: treatment.name,
      description: treatment.description,
      duration: treatment.duration,
      price: treatment.price,
      isSubtreatment: treatment.isSubtreatment,
      parentId: treatment.parentId,
      alwaysAvailable: treatment.alwaysAvailable,
      availability: treatment.Availability.map(avail => ({
        id: avail.id,
        startDate: avail.startDate.toISOString().split('T')[0],
        endDate: avail.endDate.toISOString().split('T')[0],
        startTime: avail.startTime,
        endTime: avail.endTime,
        box: avail.box,
      })),
    }));

    return NextResponse.json(formattedTreatments);
  } catch (error) {
    console.error('Error al obtener treatments:', error);
    return NextResponse.json(
      { error: 'Error al obtener treatments' },
      { status: 500 }
    );
  }
}

// POST /api/treatments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Preparar la disponibilidad si existe
    let availability = [];
    if (body.availability && body.availability.length > 0) {
      availability = body.availability.map((avail: any) => ({
        startDate: new Date(avail.startDate),
        endDate: new Date(avail.endDate),
        startTime: avail.startTime,
        endTime: avail.endTime,
        box: avail.box,
      }));
    }
    
    // Crear el tratamiento
    const newTreatment = await prisma.treatment.create({
      data: {
        name: body.name,
        description: body.description,
        duration: body.duration || 0,
        price: body.price || 0,
        isSubtreatment: body.isSubtreatment || false,
        alwaysAvailable: body.alwaysAvailable || false,
        parentId: body.parentId,
        Availability: {
          create: availability,
        },
      },
      include: {
        Availability: true,
      },
    });
    
    // Formatear la respuesta
    const formattedTreatment = {
      ...newTreatment,
      availability: newTreatment.Availability.map(avail => ({
        id: avail.id,
        startDate: avail.startDate.toISOString().split('T')[0],
        endDate: avail.endDate.toISOString().split('T')[0],
        startTime: avail.startTime,
        endTime: avail.endTime,
        box: avail.box,
      })),
    };
    
    console.log("Nuevo tratamiento:", formattedTreatment);
    
    return NextResponse.json(formattedTreatment, { status: 201 });
  } catch (error) {
    console.error('Error al crear treatment:', error);
    return NextResponse.json(
      { error: 'Error al crear treatment' },
      { status: 500 }
    );
  }
}

// PUT /api/treatments
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar si el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: body.id },
      include: { Availability: true },
    });
    
    if (!existingTreatment) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    }
    
    // Eliminar disponibilidades existentes si se proporcionan nuevas
    if (body.availability && body.availability.length > 0) {
      await prisma.availability.deleteMany({
        where: { treatmentId: body.id },
      });
    }
    
    // Actualizar el tratamiento
    const updatedTreatment = await prisma.treatment.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        duration: body.duration,
        price: body.price,
        isSubtreatment: body.isSubtreatment,
        alwaysAvailable: body.alwaysAvailable || false,
        parentId: body.parentId,
        Availability: {
          create: body.availability ? body.availability.map((avail: any) => ({
            startDate: new Date(avail.startDate),
            endDate: new Date(avail.endDate),
            startTime: avail.startTime,
            endTime: avail.endTime,
            box: avail.box,
          })) : [],
        },
      },
      include: {
        Availability: true,
      },
    });
    
    // Formatear la respuesta
    const formattedTreatment = {
      ...updatedTreatment,
      availability: updatedTreatment.Availability.map(avail => ({
        id: avail.id,
        startDate: avail.startDate.toISOString().split('T')[0],
        endDate: avail.endDate.toISOString().split('T')[0],
        startTime: avail.startTime,
        endTime: avail.endTime,
        box: avail.box,
      })),
    };
    
    console.log("Tratamiento actualizado:", JSON.stringify(formattedTreatment, null, 2));
    
    return NextResponse.json(formattedTreatment);
  } catch (error) {
    console.error("Error al actualizar tratamiento:", error);
    return NextResponse.json({ error: 'Error al actualizar el tratamiento' }, { status: 400 });
  }
}

// DELETE /api/treatments/:id
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    if (pathParts.length <= 3 || idPart === 'treatments') {
      return NextResponse.json({ error: 'ID de tratamiento no especificado' }, { status: 400 });
    }
    
    const id = parseInt(idPart);
    
    // Verificar si el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
    });
    
    if (!existingTreatment) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    }
    
    // Eliminar el tratamiento
    await prisma.treatment.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar tratamiento:", error);
    return NextResponse.json({ error: 'Error al eliminar el tratamiento' }, { status: 400 });
  }
} 