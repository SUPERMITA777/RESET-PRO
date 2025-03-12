import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/treatments/:id
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);
    
    // Verificar si el tratamiento existe
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: { availability: true }
    });
    
    if (!treatment) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    }
    
    // Si es un tratamiento principal, buscar y eliminar todos los subtratamientos asociados
    if (!treatment.isSubtreatment) {
      // Primero obtenemos todos los subtratamientos
      const subTreatments = await prisma.treatment.findMany({
        where: { parentId: id }
      });
      
      console.log(`Eliminando ${subTreatments.length} subtratamientos asociados al tratamiento ${id}`);
      
      // Eliminar cada subtratamiento
      for (const subTreatment of subTreatments) {
        // Eliminar la disponibilidad del subtratamiento (si existe)
        await prisma.availability.deleteMany({
          where: { treatmentId: subTreatment.id }
        });
        
        // Eliminar el subtratamiento
        await prisma.treatment.delete({
          where: { id: subTreatment.id }
        });
        
        console.log(`Subtratamiento ${subTreatment.id} eliminado`);
      }
    }
    
    // Eliminar la disponibilidad del tratamiento principal
    await prisma.availability.deleteMany({
      where: { treatmentId: id }
    });
    
    // Finalmente, eliminar el tratamiento principal
    await prisma.treatment.delete({
      where: { id }
    });
    
    console.log(`Tratamiento ${id} eliminado correctamente`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar tratamiento:", error);
    return NextResponse.json({ error: 'Error al eliminar el tratamiento' }, { status: 400 });
  }
} 