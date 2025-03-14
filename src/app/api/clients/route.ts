import { NextRequest, NextResponse } from 'next/server';

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
  }
} 