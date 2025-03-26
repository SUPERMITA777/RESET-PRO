import { NextRequest, NextResponse } from 'next/server';
import { format, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando solicitud de reporte diario');
    
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    console.log('Fecha solicitada:', dateParam);

    if (!dateParam) {
      console.log('Error: No se proporcionó fecha');
      return NextResponse.json(
        { error: 'Se requiere una fecha para el reporte' },
        { status: 400 }
      );
    }

    // Parsear la fecha
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      console.log('Error: Fecha inválida');
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }
    
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    
    console.log('Rango de fechas:', { startDate, endDate });

    // Datos de ejemplo para pruebas
    const mockAppointments = [
      { 
        id: 1, 
        client: { name: 'Ana García' }, 
        treatment: { name: 'Masaje Relajante' }, 
        professional: { name: 'María López' }, 
        time: '09:00', 
        price: 3500, 
        deposit: 0 
      },
      { 
        id: 2, 
        client: { name: 'Juan Pérez' }, 
        treatment: { name: 'Corte de Pelo' }, 
        professional: { name: 'Carlos Rodríguez' }, 
        time: '10:30', 
        price: 1200, 
        deposit: 0 
      },
      { 
        id: 3, 
        client: { name: 'Laura Martínez' }, 
        treatment: { name: 'Manicura' }, 
        professional: { name: 'Sandra Gómez' }, 
        time: '11:45', 
        price: 800, 
        deposit: 0 
      },
      { 
        id: 4, 
        client: { name: 'Roberto Sánchez' }, 
        treatment: { name: 'Facial' }, 
        professional: { name: 'María López' }, 
        time: '14:00', 
        price: 2500, 
        deposit: 0 
      },
      { 
        id: 5, 
        client: { name: 'Claudia Torres' }, 
        treatment: { name: 'Depilación' }, 
        professional: { name: 'Sandra Gómez' }, 
        time: '16:30', 
        price: 1800, 
        deposit: 0 
      }
    ];

    // Formatear datos de citas
    const formattedAppointments = mockAppointments.map(appointment => ({
      id: appointment.id,
      client: appointment.client?.name || 'Cliente sin nombre',
      treatment: appointment.treatment?.name || 'Tratamiento no especificado',
      professional: appointment.professional?.name || 'Profesional no asignado',
      time: appointment.time,
      amount: appointment.price,
      paymentMethod: 'Efectivo', // Por defecto
      deposit: appointment.deposit,
      totalPaid: appointment.price
    }));

    // Datos de ejemplo para métodos de pago
    const mockPaymentSummary = [
      { method: 'Efectivo', total: 6000 },
      { method: 'Tarjeta de Crédito', total: 1200 },
      { method: 'Tarjeta de Débito', total: 1800 },
      { method: 'Transferencia', total: 800 },
    ];

    // Datos de ejemplo para gastos
    const mockExpenseSummary = [
      { description: 'Compra de productos de limpieza', amount: 1500, paymentMethod: 'Efectivo' },
      { description: 'Pago de servicios', amount: 2800, paymentMethod: 'Transferencia' },
    ];

    // Calcular totales
    const totalAppointments = formattedAppointments.length;
    const totalRevenue = formattedAppointments.reduce((sum, app) => sum + app.amount, 0);
    const totalExpenses = mockExpenseSummary.reduce((sum, exp) => sum + exp.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const response = {
      date: format(date, 'yyyy-MM-dd'),
      appointments: formattedAppointments,
      paymentSummary: mockPaymentSummary,
      expenseSummary: mockExpenseSummary,
      summary: {
        totalAppointments,
        totalRevenue,
        totalExpenses,
        netIncome
      }
    };
    
    console.log('Reporte generado exitosamente');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error detallado al obtener el reporte diario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el reporte diario', details: String(error) },
      { status: 500 }
    );
  }
} 