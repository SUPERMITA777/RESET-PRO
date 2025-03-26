import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    if (!parentId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del tratamiento padre' },
        { status: 400 }
      );
    }

    const subTreatments = await prisma.treatment.findMany({
      where: {
        parentId: parseInt(parentId),
        isSubtreatment: true
      },
      include: {
        Availability: true
      }
    });

    return NextResponse.json(subTreatments);
  } catch (error) {
    console.error('Error al obtener sub-tratamientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener sub-tratamientos', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, price, parentId, alwaysAvailable } = body;

    // Validar datos requeridos
    if (!name || !description || !duration || !price || !parentId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que exista el tratamiento padre
    const parentTreatment = await prisma.treatment.findUnique({
      where: { id: parentId }
    });

    if (!parentTreatment) {
      return NextResponse.json(
        { error: 'El tratamiento padre no existe' },
        { status: 404 }
      );
    }

    // Crear el sub-tratamiento
    const subTreatment = await prisma.treatment.create({
      data: {
        name,
        description,
        duration,
        price,
        isSubtreatment: true,
        parentId,
        alwaysAvailable: alwaysAvailable || false
      },
      include: {
        Availability: true
      }
    });

    return NextResponse.json(subTreatment);
  } catch (error) {
    console.error('Error al crear sub-tratamiento:', error);
    return NextResponse.json(
      { error: 'Error al crear sub-tratamiento', details: String(error) },
      { status: 500 }
    );
  }
} 