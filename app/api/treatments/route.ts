import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentDateArgentina } from '@/lib/date-utils';

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

// Obtenemos el año actual en Argentina
const currentYear = new Date().getFullYear();
const currentDate = getCurrentDateArgentina();

// Datos iniciales de tratamientos - FECHAS FIJAS para evitar problemas
let treatments: Treatment[] = [
  {
    id: 1,
    name: "Limpieza Facial",
    description: "Tratamiento básico de limpieza facial",
    duration: 60,
    price: 5000,
    isSubtreatment: false,
    parentId: null,
    availability: [
      {
        id: 1,
        startDate: "2025-01-01", // FECHA FIJA
        endDate: "2025-12-31", // FECHA FIJA
        startTime: "09:00",
        endTime: "17:00",
        box: "Box 1"
      }
    ]
  },
  {
    id: 2,
    name: "Limpieza Facial Profunda",
    description: "Limpieza facial con exfoliación y mascarilla",
    duration: 90,
    price: 7500,
    isSubtreatment: true,
    parentId: 1,
    availability: null
  },
  {
    id: 3,
    name: "Masaje Relajante",
    description: "Masaje corporal para relajación",
    duration: 60,
    price: 6000,
    isSubtreatment: false,
    parentId: null,
    availability: [
      {
        id: 2,
        startDate: "2025-01-01", // FECHA FIJA
        endDate: "2025-12-31", // FECHA FIJA
        startTime: "09:00",
        endTime: "17:00",
        box: "Box 2"
      }
    ]
  },
  {
    id: 4,
    name: "Masaje Descontracturante",
    description: "Masaje para aliviar contracturas musculares",
    duration: 60,
    price: 7000,
    isSubtreatment: true,
    parentId: 3,
    availability: null
  }
];

// GET /api/treatments
export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({
      include: {
        availability: true,
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
      availability: treatment.availability.map(avail => ({
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
    console.error("Error al obtener tratamientos:", error);
    return NextResponse.json({ error: 'Error al obtener los tratamientos' }, { status: 500 });
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
        availability: {
          create: availability,
        },
      },
      include: {
        availability: true,
      },
    });
    
    // Formatear la respuesta
    const formattedTreatment = {
      ...newTreatment,
      availability: newTreatment.availability.map(avail => ({
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
    console.error("Error al crear tratamiento:", error);
    return NextResponse.json({ error: 'Error al crear el tratamiento' }, { status: 400 });
  }
}

// PUT /api/treatments
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar si el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: body.id },
      include: { availability: true },
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
        availability: {
          create: body.availability || [],
        },
      },
      include: {
        availability: true,
      },
    });
    
    // Obtener el tratamiento actualizado con su disponibilidad
    const treatmentWithAvailability = await prisma.treatment.findUnique({
      where: { id: updatedTreatment.id },
      include: { availability: true },
    });
    
    console.log("Tratamiento actualizado:", JSON.stringify(treatmentWithAvailability, null, 2));
    
    // Formatear la respuesta
    const formattedTreatment = {
      ...treatmentWithAvailability,
      availability: treatmentWithAvailability?.availability.map(avail => ({
        id: avail.id,
        startDate: avail.startDate.toISOString().split('T')[0],
        endDate: avail.endDate.toISOString().split('T')[0],
        startTime: avail.startTime,
        endTime: avail.endTime,
        box: avail.box,
      })),
    };
    
    return NextResponse.json(formattedTreatment);
  } catch (error) {
    console.error("Error al actualizar tratamiento:", error);
    return NextResponse.json({ error: 'Error al actualizar el tratamiento' }, { status: 400 });
  }
}

// DELETE /api/treatments/:id
export async function DELETE(request: Request) {
  try {
    // Redireccionar a la ruta dinámica [id]
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    if (pathParts.length <= 3 || idPart === 'treatments') {
      return NextResponse.json({ error: 'ID de tratamiento no especificado' }, { status: 400 });
    }
    
    // En lugar de implementar la lógica aquí, vamos a redireccionar a la ruta dinámica
    return NextResponse.json({ 
      error: 'Esta ruta está deshabilitada. Use /api/treatments/{id} con método DELETE para eliminar un tratamiento.' 
    }, { status: 400 });
  } catch (error) {
    console.error("Error en la redirección DELETE:", error);
    return NextResponse.json({ error: 'Error en la redirección DELETE' }, { status: 400 });
  }
} 