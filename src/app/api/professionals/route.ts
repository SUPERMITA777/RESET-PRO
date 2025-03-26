import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

<<<<<<< HEAD
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
=======
export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando solicitud de profesionales');
    
    const professionals = await prisma.professional.findMany({
      include: {
        availability: true,
      },
    });
    
    console.log('Profesionales obtenidos exitosamente');
    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error detallado al obtener profesionales:', error);
    
    // Manejo específico de errores de base de datos
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error al obtener profesionales', 
          details: error.message,
          stack: error.stack 
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
        },
        { status: 500 }
      );
    }
<<<<<<< HEAD

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
=======
    
    return NextResponse.json(
      { error: 'Error desconocido al obtener profesionales' },
      { status: 500 }
    );
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
  }
}

// POST /api/professionals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
<<<<<<< HEAD
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
=======
    
    // Simulamos la creación de un nuevo profesional
    const newProfessional = {
      id: Math.floor(Math.random() * 1000) + 6,
      name: body.name,
      specialty: body.specialty,
      availability: []
    };
    
    return NextResponse.json(newProfessional);
  } catch (error) {
    console.error('Error al crear profesional:', error);
    return NextResponse.json(
      { error: 'Error al crear profesional' },
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
      { status: 500 }
    );
  }
}

// PUT /api/professionals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
<<<<<<< HEAD
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
=======
    
    // Simulamos la actualización de un profesional
    const updatedProfessional = {
      id: body.id,
      name: body.name,
      specialty: body.specialty,
      availability: body.availability || []
    };
    
    return NextResponse.json(updatedProfessional);
  } catch (error) {
    console.error('Error al actualizar profesional:', error);
    return NextResponse.json(
      { error: 'Error al actualizar profesional' },
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
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
<<<<<<< HEAD

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
=======
    
    // Simulamos la eliminación de un profesional
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error al eliminar profesional:', error);
    return NextResponse.json(
      { error: 'Error al eliminar profesional' },
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
      { status: 500 }
    );
  }
} 