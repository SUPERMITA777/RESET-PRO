import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error desconocido al obtener profesionales' },
      { status: 500 }
    );
  }
}

// POST /api/professionals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      { status: 500 }
    );
  }
}

// PUT /api/professionals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    
    // Simulamos la eliminación de un profesional
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error al eliminar profesional:', error);
    return NextResponse.json(
      { error: 'Error al eliminar profesional' },
      { status: 500 }
    );
  }
} 