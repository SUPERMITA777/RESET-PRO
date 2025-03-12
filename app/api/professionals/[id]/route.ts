import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);
    
    // Verificar si el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id },
    });
    
    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el profesional y su disponibilidad (cascade)
    await prisma.professional.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Profesional eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar profesional:", error);
    return NextResponse.json(
      { error: 'Error al eliminar el profesional' },
      { status: 400 }
    );
  }
} 