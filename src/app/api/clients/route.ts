import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Obteniendo clientes...');
    
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

    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Obtenidos ${clients.length} clientes exitosamente`);
    return NextResponse.json(clients);
  } catch (error: any) {
    console.error('Error al obtener clientes:', {
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
        error: 'Error al obtener clientes', 
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