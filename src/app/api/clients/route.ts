import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
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
=======

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando solicitud de clientes');
    
    // Datos de ejemplo para clientes
    const mockClients = [
      { 
        id: 1, 
        name: 'Ana García', 
        email: 'ana@example.com',
        phone: '1123456789',
        appointments: []
      },
      { 
        id: 2, 
        name: 'Juan Pérez', 
        email: 'juan@example.com',
        phone: '1187654321',
        appointments: []
      },
      { 
        id: 3, 
        name: 'Laura Martínez', 
        email: 'laura@example.com',
        phone: '1156789012',
        appointments: []
      },
      { 
        id: 4, 
        name: 'Roberto Sánchez', 
        email: 'roberto@example.com',
        phone: '1145678901',
        appointments: []
      },
      { 
        id: 5, 
        name: 'Claudia Torres', 
        email: 'claudia@example.com',
        phone: '1198765432',
        appointments: []
      }
    ];
    
    console.log('Clientes generados exitosamente');
    return NextResponse.json(mockClients);
  } catch (error) {
    console.error('Error detallado al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes', details: String(error) },
      { status: 500 }
    );
>>>>>>> d5d5f735d3778854f3df0dd0220036bc9b4cbbdb
  }
} 