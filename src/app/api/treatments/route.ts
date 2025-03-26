import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Función auxiliar para validar fechas
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Función auxiliar para validar hora
function isValidTime(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

export async function GET() {
  try {
    console.log('Obteniendo tratamientos...');
    
    // Verificar conexión a la base de datos
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Error de conexión con la base de datos' },
        { status: 500 }
      );
    }

    const treatments = await prisma.treatment.findMany({
      include: {
        Availability: true,
        subTreatments: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Obtenidos ${treatments.length} tratamientos exitosamente`);
    return NextResponse.json(treatments);
  } catch (error: any) {
    console.error('Error al obtener tratamientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener tratamientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando creación de tratamiento...');
    
    // Verificar conexión a la base de datos
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Error de conexión con la base de datos');
      return NextResponse.json(
        { error: 'Error de conexión con la base de datos' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos:', JSON.stringify(body, null, 2));
    
    // Validaciones básicas
    if (!body.name?.trim()) {
      console.error('Nombre no proporcionado');
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }
    
    if (!body.description?.trim()) {
      console.error('Descripción no proporcionada');
      return NextResponse.json(
        { error: 'La descripción es obligatoria' },
        { status: 400 }
      );
    }

    // Validaciones para subtratamientos
    if (body.isSubtreatment) {
      if (!body.parentId) {
        console.error('ParentId no proporcionado para subtratamiento');
        return NextResponse.json(
          { error: 'Debe seleccionar un tratamiento principal' },
          { status: 400 }
        );
      }

      if (!body.duration || Number(body.duration) <= 0) {
        console.error('Duración inválida:', body.duration);
        return NextResponse.json(
          { error: 'La duración debe ser mayor a 0' },
          { status: 400 }
        );
      }

      if (!body.price || Number(body.price) < 0) {
        console.error('Precio inválido:', body.price);
        return NextResponse.json(
          { error: 'El precio no puede ser negativo' },
          { status: 400 }
        );
      }
    }

    // Validar si ya existe un tratamiento con el mismo nombre
    const existingTreatment = await prisma.treatment.findFirst({
      where: {
        name: body.name.trim(),
        isSubtreatment: Boolean(body.isSubtreatment)
      }
    });

    if (existingTreatment) {
      console.error('Ya existe un tratamiento con ese nombre:', body.name);
      return NextResponse.json(
        { error: 'Ya existe un tratamiento con ese nombre' },
        { status: 400 }
      );
    }

    // Si es un subtratamiento, verificar que el tratamiento padre existe
    if (body.isSubtreatment && body.parentId) {
      const parentTreatment = await prisma.treatment.findUnique({
        where: { id: Number(body.parentId) }
      });

      if (!parentTreatment) {
        console.error('Tratamiento padre no encontrado:', body.parentId);
        return NextResponse.json(
          { error: 'El tratamiento padre no existe' },
          { status: 404 }
        );
      }
    }
    
    // Preparar datos del tratamiento
    const treatmentData = {
      name: body.name.trim(),
      description: body.description.trim(),
      duration: body.isSubtreatment ? Number(body.duration) : 0,
      price: body.isSubtreatment ? Number(body.price) : 0,
      isSubtreatment: Boolean(body.isSubtreatment),
      parentId: body.isSubtreatment ? Number(body.parentId) : null,
      alwaysAvailable: Boolean(body.alwaysAvailable)
    };
    
    console.log('Datos preparados para crear tratamiento:', JSON.stringify(treatmentData, null, 2));

    // Crear el tratamiento sin disponibilidades
    const treatment = await prisma.treatment.create({
      data: treatmentData
    });
    
    console.log('Tratamiento creado:', JSON.stringify(treatment, null, 2));
    
    // Si no es siempre disponible y hay disponibilidades, crearlas después
    if (!body.alwaysAvailable && body.availability?.length > 0) {
      try {
        console.log('Creando disponibilidades para el tratamiento');
        
        // Validar cada disponibilidad
        const availabilityRecords = body.availability.map((avail: any) => {
          // Validar fechas
          if (!avail.startDate || !avail.endDate) {
            throw new Error('Las fechas de inicio y fin son obligatorias');
          }

          const startDate = new Date(avail.startDate);
          const endDate = new Date(avail.endDate);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Las fechas deben ser válidas');
          }

          if (startDate > endDate) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
          }

          // Validar horas
          if (!avail.startTime || !avail.endTime) {
            throw new Error('Las horas de inicio y fin son obligatorias');
          }

          const startTime = avail.startTime.split(':').map(Number);
          const endTime = avail.endTime.split(':').map(Number);

          if (startTime[0] > endTime[0] || 
              (startTime[0] === endTime[0] && startTime[1] >= endTime[1])) {
            throw new Error('La hora de inicio debe ser anterior a la hora de fin');
          }

          // Validar box
          if (!avail.box?.trim()) {
            throw new Error('El box es obligatorio');
          }

          return {
            treatmentId: treatment.id,
            startDate,
            endDate,
            startTime: avail.startTime,
            endTime: avail.endTime,
            box: avail.box.trim()
          };
        });
        
        console.log('Disponibilidades preparadas:', JSON.stringify(availabilityRecords, null, 2));
        
        await prisma.availability.createMany({
          data: availabilityRecords
        });
        
        console.log('Disponibilidades creadas exitosamente');
      } catch (availError: any) {
        console.error('Error al crear disponibilidades:', availError);
        // Eliminar el tratamiento si falla la creación de disponibilidades
        await prisma.treatment.delete({
          where: { id: treatment.id }
        });
        return NextResponse.json(
          { error: `Error al crear disponibilidades: ${availError.message}` },
          { status: 400 }
        );
      }
    }
    
    // Obtener el tratamiento con sus relaciones
    const createdTreatment = await prisma.treatment.findUnique({
      where: { id: treatment.id },
      include: {
        Availability: true,
        subTreatments: true
      }
    });
    
    console.log('Tratamiento completo creado exitosamente');
    return NextResponse.json(createdTreatment, { status: 201 });
  } catch (error) {
    console.error('Error al crear tratamiento:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error específico de Prisma:', error.code);
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un tratamiento con ese nombre' },
          { status: 400 }
        );
      }
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'El tratamiento padre no existe' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al crear el tratamiento' },
      { status: 500 }
    );
  }
} 