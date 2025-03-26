import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Función auxiliar para validar fechas
function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando actualización del tratamiento:', params.id);
    
    // Verificar conexión a la base de datos
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Error de conexión con la base de datos' },
        { status: 500 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de tratamiento inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos:', JSON.stringify(body, null, 2));

    // Verificar si el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id }
    });

    if (!existingTreatment) {
      return NextResponse.json(
        { error: 'Tratamiento no encontrado' },
        { status: 404 }
      );
    }

    // Validaciones básicas
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: 'La descripción es obligatoria' },
        { status: 400 }
      );
    }

    // Validaciones para subtratamientos
    if (body.isSubtreatment) {
      if (!body.parentId) {
        return NextResponse.json(
          { error: 'Debe seleccionar un tratamiento principal' },
          { status: 400 }
        );
      }

      if (!body.duration || Number(body.duration) <= 0) {
        return NextResponse.json(
          { error: 'La duración debe ser mayor a 0' },
          { status: 400 }
        );
      }

      if (!body.price || Number(body.price) < 0) {
        return NextResponse.json(
          { error: 'El precio no puede ser negativo' },
          { status: 400 }
        );
      }
    }

    // Verificar si ya existe otro tratamiento con el mismo nombre
    const duplicateTreatment = await prisma.treatment.findFirst({
      where: {
        name: body.name.trim(),
        isSubtreatment: Boolean(body.isSubtreatment),
        id: { not: id }
      }
    });

    if (duplicateTreatment) {
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

    // Actualizar el tratamiento
    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: treatmentData
    });

    // Si no es siempre disponible y hay disponibilidades, actualizarlas
    if (!body.alwaysAvailable && body.availability?.length > 0) {
      try {
        // Eliminar disponibilidades existentes
        await prisma.availability.deleteMany({
          where: { treatmentId: id }
        });

        // Validar y crear nuevas disponibilidades
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
            treatmentId: id,
            startDate,
            endDate,
            startTime: avail.startTime,
            endTime: avail.endTime,
            box: avail.box.trim()
          };
        });

        // Crear nuevas disponibilidades
        await prisma.availability.createMany({
          data: availabilityRecords
        });
      } catch (availError: any) {
        console.error('Error al actualizar disponibilidades:', availError);
        return NextResponse.json(
          { error: `Error al actualizar disponibilidades: ${availError.message}` },
          { status: 400 }
        );
      }
    } else if (body.alwaysAvailable) {
      // Si es siempre disponible, eliminar todas las disponibilidades
      await prisma.availability.deleteMany({
        where: { treatmentId: id }
      });
    }

    // Obtener el tratamiento actualizado con sus relaciones
    const finalTreatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        Availability: true,
        subTreatments: true
      }
    });

    return NextResponse.json(finalTreatment);
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Tratamiento no encontrado' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el tratamiento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando eliminación del tratamiento:', params.id);
    
    // Verificar conexión a la base de datos
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Error de conexión con la base de datos' },
        { status: 500 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de tratamiento inválido' },
        { status: 400 }
      );
    }

    // Verificar si el tratamiento existe y obtener todas sus relaciones
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        Availability: true,
        subTreatments: {
          include: {
            appointments: true,
            Availability: true
          }
        },
        appointments: true
      }
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamiento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si tiene citas asociadas (tanto en el tratamiento principal como en subtratamientos)
    const hasAppointments = treatment.appointments.length > 0 || 
      treatment.subTreatments.some(sub => sub.appointments.length > 0);

    if (hasAppointments) {
      return NextResponse.json(
        { error: 'No se puede eliminar el tratamiento porque tiene citas asociadas' },
        { status: 400 }
      );
    }

    // Eliminar en orden para mantener la integridad referencial
    try {
      // 1. Eliminar disponibilidades de los subtratamientos
      for (const subTreatment of treatment.subTreatments) {
        if (subTreatment.Availability && subTreatment.Availability.length > 0) {
          await prisma.availability.deleteMany({
            where: { treatmentId: subTreatment.id }
          });
          console.log(`Disponibilidades eliminadas del subtratamiento ${subTreatment.id}`);
        }
      }

      // 2. Eliminar disponibilidades del tratamiento principal
      if (treatment.Availability && treatment.Availability.length > 0) {
        await prisma.availability.deleteMany({
          where: { treatmentId: id }
        });
        console.log('Disponibilidades eliminadas del tratamiento principal');
      }

      // 3. Eliminar subtratamientos
      if (treatment.subTreatments && treatment.subTreatments.length > 0) {
        await prisma.treatment.deleteMany({
          where: { parentId: id }
        });
        console.log('Subtratamientos eliminados');
      }

      // 4. Eliminar el tratamiento principal
      await prisma.treatment.delete({
        where: { id }
      });
      console.log('Tratamiento principal eliminado');

      return NextResponse.json({ 
        message: 'Tratamiento eliminado correctamente',
        success: true
      });
    } catch (deleteError) {
      console.error('Error durante la eliminación:', deleteError);
      
      // Intentar revertir los cambios si algo falla
      try {
        // Verificar si el tratamiento principal aún existe
        const treatmentExists = await prisma.treatment.findUnique({
          where: { id }
        });

        if (!treatmentExists) {
          // Si el tratamiento principal fue eliminado pero falló algo más
          // No podemos revertir los cambios, solo notificar el error
          return NextResponse.json(
            { error: 'Error durante la eliminación. Algunos datos pueden haber sido eliminados.' },
            { status: 500 }
          );
        }
      } catch (revertError) {
        console.error('Error al intentar revertir cambios:', revertError);
      }
      
      throw deleteError;
    }
  } catch (error) {
    console.error('Error al eliminar tratamiento:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'No se puede eliminar el tratamiento porque tiene registros asociados' },
          { status: 400 }
        );
      }
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Tratamiento no encontrado' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al eliminar el tratamiento' },
      { status: 500 }
    );
  }
} 