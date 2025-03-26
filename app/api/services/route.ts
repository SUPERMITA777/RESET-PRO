import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todas las categorías de servicios con sus sub-servicios
    const categories = await prisma.serviceCategory.findMany({
      include: {
        services: {
          where: {
            active: true
          },
          orderBy: {
            name: 'asc'
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            active: true
          }
        }
      },
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transformar los datos para el formato esperado por el frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      subServices: category.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration
      }))
    }));

    // Filtrar categorías que no tienen sub-servicios activos
    const filteredCategories = formattedCategories.filter(
      category => category.subServices.length > 0
    );

    return NextResponse.json(filteredCategories);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json(
      { error: 'Error al obtener los servicios' },
      { status: 500 }
    );
  }
} 