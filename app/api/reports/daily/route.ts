import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipos para mayor claridad
interface PaymentSummary {
  method: string;
  total: number;
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
  paymentMethod: string;
  date: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro date' },
        { status: 400 }
      );
    }
    
    // Convertir el parámetro de fecha a un objeto Date
    const date = new Date(dateParam);
    
    // Asegurarse de que la fecha es válida
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    // Crear fechas para el inicio y fin del día
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Obtener citas del día
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        client: true,
        professional: true,
        treatment: true,
        sales: {
          include: {
            payments: {
              include: {
                paymentMethod: true
              }
            }
          }
        }
      }
    });
    
    // Obtener gastos del día
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    
    // Procesar citas para el formato esperado
    const processedAppointments = appointments.map(appointment => {
      // Calcular el total pagado sumando todos los pagos asociados a las ventas de esta cita
      const totalPaid = appointment.sales.reduce((sum, sale) => {
        return sum + sale.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
      }, 0);
      
      // Obtener el método de pago principal (el de mayor monto)
      let mainPaymentMethod = "No especificado";
      let maxAmount = 0;
      
      appointment.sales.forEach(sale => {
        sale.payments.forEach(payment => {
          if (payment.amount > maxAmount) {
            maxAmount = payment.amount;
            mainPaymentMethod = payment.paymentMethod.name;
          }
        });
      });
      
      // Calcular comisión (ejemplo: 10% del precio)
      const commissionPercentage = 10; // Esto podría venir de la configuración o del profesional
      const commissionAmount = (appointment.price * commissionPercentage) / 100;
      
      return {
        id: appointment.id,
        client: appointment.client?.name || "Cliente no especificado",
        treatment: appointment.treatment?.name || "Tratamiento no especificado",
        professional: appointment.professional?.name || "Profesional no especificado",
        time: appointment.time,
        amount: appointment.price,
        paymentMethod: mainPaymentMethod,
        deposit: appointment.deposit,
        totalPaid: totalPaid,
        commissionPercentage,
        commissionAmount
      };
    });
    
    // Calcular resumen de pagos
    const paymentMethodsMap = new Map<string, number>();
    
    appointments.forEach(appointment => {
      appointment.sales.forEach(sale => {
        sale.payments.forEach(payment => {
          const methodName = payment.paymentMethod.name;
          const currentTotal = paymentMethodsMap.get(methodName) || 0;
          paymentMethodsMap.set(methodName, currentTotal + payment.amount);
        });
      });
    });
    
    const paymentSummary = Array.from(paymentMethodsMap.entries()).map(([method, total]) => ({
      method,
      total
    }));
    
    // Procesar gastos
    const processedExpenses = expenses.map(expense => ({
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod || "No especificado"
    }));
    
    return NextResponse.json({
      appointments: processedAppointments,
      paymentSummary,
      expenseSummary: processedExpenses
    });
    
  } catch (error) {
    console.error('Error al obtener el reporte diario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el reporte diario' },
      { status: 500 }
    );
  }
} 