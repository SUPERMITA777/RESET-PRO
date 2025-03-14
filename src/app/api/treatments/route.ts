import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando solicitud de tratamientos');
    
    // Datos de ejemplo para tratamientos
    const mockTreatments = [
      { 
        id: 1, 
        name: 'Limpieza Facial Profunda', 
        description: 'Limpieza completa con extracción',
        duration: 60,
        price: 3500,
        categoryId: 1,
        availability: [],
        subTreatments: []
      },
      { 
        id: 2, 
        name: 'Hidratación Facial', 
        description: 'Tratamiento hidratante para todo tipo de piel',
        duration: 45,
        price: 2800,
        categoryId: 1,
        availability: [],
        subTreatments: []
      },
      { 
        id: 3, 
        name: 'Masaje Descontracturante', 
        description: 'Masaje para aliviar tensiones',
        duration: 60,
        price: 4200,
        categoryId: 2,
        availability: [],
        subTreatments: []
      },
      { 
        id: 4, 
        name: 'Drenaje Linfático', 
        description: 'Técnica para eliminar líquidos',
        duration: 60,
        price: 3800,
        categoryId: 2,
        availability: [],
        subTreatments: []
      },
      { 
        id: 5, 
        name: 'Depilación Piernas Completas', 
        description: 'Depilación con cera',
        duration: 45,
        price: 2500,
        categoryId: 3,
        availability: [],
        subTreatments: []
      },
      { 
        id: 6, 
        name: 'Depilación Axilas', 
        description: 'Depilación con cera',
        duration: 15,
        price: 800,
        categoryId: 3,
        availability: [],
        subTreatments: []
      },
      { 
        id: 7, 
        name: 'Manicura Tradicional', 
        description: 'Limado, cutículas y esmaltado',
        duration: 30,
        price: 1200,
        categoryId: 4,
        availability: [],
        subTreatments: []
      },
      { 
        id: 8, 
        name: 'Pedicura Completa', 
        description: 'Tratamiento completo para pies',
        duration: 45,
        price: 1800,
        categoryId: 4,
        availability: [],
        subTreatments: []
      }
    ];
    
    console.log('Tratamientos generados exitosamente');
    return NextResponse.json(mockTreatments);
  } catch (error) {
    console.error('Error detallado al obtener tratamientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener tratamientos', details: String(error) },
      { status: 500 }
    );
  }
} 