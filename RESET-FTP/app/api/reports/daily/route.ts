import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipos para mayor claridad
interface PaymentSummary {
  [key: string]: number;
}

interface AppointmentSummary {
  id: number;
  clientName: string;
  professional: string;
  subTreatment: string;
  price: number;
  deposit: number;
  totalPaid: number;
  paymentMethod: string;
  commissionPercentage: number;
  commissionAmount: number;
  date: Date;
  time: string;
}

// Agregar interfaz para gastos
interface ExpenseSummary {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

// Datos de ejemplo para el reporte diario
const mockDailyReport = {
  appointments: [
    { id: 1, client: "Ana García", treatment: "Masaje Relajante", professional: "María López", time: "09:00", amount: 3500, paymentMethod: "Efectivo", deposit: 0, totalPaid: 3500 },
    { id: 2, client: "Juan Pérez", treatment: "Corte de Pelo", professional: "Carlos Rodríguez", time: "10:30", amount: 1200, paymentMethod: "Tarjeta de Crédito", deposit: 0, totalPaid: 1200 },
    { id: 3, client: "Laura Martínez", treatment: "Manicura", professional: "Sandra Gómez", time: "11:45", amount: 800, paymentMethod: "Transferencia", deposit: 0, totalPaid: 800 },
    { id: 4, client: "Roberto Sánchez", treatment: "Facial", professional: "María López", time: "14:00", amount: 2500, paymentMethod: "Efectivo", deposit: 0, totalPaid: 2500 },
    { id: 5, client: "Claudia Torres", treatment: "Depilación", professional: "Sandra Gómez", time: "16:30", amount: 1800, paymentMethod: "Tarjeta de Débito", deposit: 0, totalPaid: 1800 },
  ],
  paymentSummary: [
    { method: "Efectivo", total: 6000 },
    { method: "Tarjeta de Crédito", total: 1200 },
    { method: "Tarjeta de Débito", total: 1800 },
    { method: "Transferencia", total: 800 },
  ],
  expenseSummary: [
    { description: "Compra de productos de limpieza", amount: 1500, paymentMethod: "Efectivo" },
    { description: "Pago de servicios", amount: 2800, paymentMethod: "Transferencia" },
  ]
};

export async function GET(request: Request) {
  try {
    // En una aplicación real, aquí se consultaría a la base de datos
    // y se filtrarían los datos según la fecha proporcionada
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro date' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(mockDailyReport);
  } catch (error) {
    console.error('Error al obtener el reporte diario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el reporte diario' },
      { status: 500 }
    );
  }
} 