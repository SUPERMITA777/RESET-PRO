import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando solicitud de métodos de pago');
    
    // Datos de ejemplo para métodos de pago
    const mockPaymentMethods = [
      { 
        id: 1, 
        name: 'Efectivo',
        isActive: true
      },
      { 
        id: 2, 
        name: 'Tarjeta de Crédito',
        isActive: true
      },
      { 
        id: 3, 
        name: 'Tarjeta de Débito',
        isActive: true
      },
      { 
        id: 4, 
        name: 'Transferencia',
        isActive: true
      },
      { 
        id: 5, 
        name: 'Mercado Pago',
        isActive: true
      }
    ];
    
    console.log('Métodos de pago generados exitosamente');
    return NextResponse.json(mockPaymentMethods);
  } catch (error) {
    console.error('Error detallado al obtener métodos de pago:', error);
    return NextResponse.json(
      { error: 'Error al obtener métodos de pago', details: String(error) },
      { status: 500 }
    );
  }
} 