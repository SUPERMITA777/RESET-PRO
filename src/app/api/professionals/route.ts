import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los profesionales
export async function GET() {
  try {
    console.log('Obteniendo profesionales...');
    
    // Verificar la conexión a la base de datos
    try {
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');
    } catch (dbError) {
      console.error('Error al conectar con la base de datos:', dbError);
      return NextResponse.json(
        { 
          error: 'Error de conexión con la base de datos', 
          details: String(dbError)
        },
        { status: 500 }
      );
    }

    const professionals = await prisma.professional.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Obtenidos ${professionals.length} profesionales exitosamente`);
    return NextResponse.json(professionals);
  } catch (error: any) {
    console.error('Error al obtener profesionales:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Error de conexión con la base de datos',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al obtener profesionales', 
        details: error.message || String(error),
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Conexión a la base de datos cerrada');
    } catch (disconnectError) {
      console.error('Error al cerrar la conexión:', disconnectError);
    }
  }
}

// POST /api/professionals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Datos recibidos para crear profesional:', body);

    // Validar datos requeridos
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Crear el profesional
    const professional = await prisma.professional.create({
      data: {
        name: body.name.trim(),
        specialty: body.specialty?.trim() || null,
        availability: body.availability || []
      }
    });

    console.log('Profesional creado:', professional);
    return NextResponse.json(professional, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear profesional:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un profesional con este nombre' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al crear profesional', 
        details: error.message || String(error),
        code: error.code
      },
      { status: 500 }
    );
  }
}

// PUT /api/professionals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Datos recibidos para actualizar profesional:', body);

    if (!body.id) {
      return NextResponse.json(
        { error: 'El ID del profesional es requerido' },
        { status: 400 }
      );
    }

    // Validar datos requeridos
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id: Number(body.id) }
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: 'El profesional no existe' },
        { status: 404 }
      );
    }

    // Actualizar el profesional
    const professional = await prisma.professional.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name.trim(),
        specialty: body.specialty?.trim() || null,
        availability: body.availability || []
      }
    });

    console.log('Profesional actualizado:', professional);
    return NextResponse.json(professional);
  } catch (error: any) {
    console.error('Error al actualizar profesional:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un profesional con este nombre' },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'El profesional no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al actualizar profesional', 
        details: error.message || String(error),
        code: error.code
      },
      { status: 500 }
    );
  }
}

// DELETE /api/professionals
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para eliminar un profesional' },
        { status: 400 }
      );
    }

    // Verificar que el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: 'El profesional no existe' },
        { status: 404 }
      );
    }
    
    // Eliminar el profesional
    await prisma.professional.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profesional eliminado exitosamente' 
    });
  } catch (error: any) {
    console.error('Error al eliminar profesional:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'El profesional no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al eliminar profesional', 
        details: error.message || String(error),
        code: error.code
      },
      { status: 500 }
    );
  }
} 