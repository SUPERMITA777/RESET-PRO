import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sales
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        client: true,
        appointment: true,
        items: {
          include: {
            product: true,
            treatment: true,
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json({ error: 'Error al obtener las ventas' }, { status: 500 });
  }
}

// POST /api/sales
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Crear la venta con sus items y pagos
    const newSale = await prisma.sale.create({
      data: {
        clientId: body.clientId,
        appointmentId: body.appointmentId,
        total: body.total,
        status: body.status || 'pending',
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            treatmentId: item.treatmentId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
        payments: {
          create: body.payments.map((payment: any) => ({
            paymentMethodId: payment.paymentMethodId,
            amount: payment.amount,
            reference: payment.reference,
          })),
        },
      },
      include: {
        client: true,
        appointment: true,
        items: {
          include: {
            product: true,
            treatment: true,
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });
    
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json({ error: 'Error al crear la venta' }, { status: 400 });
  }
}

// PUT /api/sales
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Actualizar la venta
    const updatedSale = await prisma.sale.update({
      where: { id: body.id },
      data: {
        status: body.status,
        total: body.total,
        // No actualizamos items ni pagos aquí por seguridad
      },
      include: {
        client: true,
        appointment: true,
        items: {
          include: {
            product: true,
            treatment: true,
          },
        },
        payments: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    return NextResponse.json({ error: 'Error al actualizar la venta' }, { status: 400 });
  }
}

// DELETE /api/sales/:id
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = parseInt(pathParts[pathParts.length - 1]);
    
    // En lugar de eliminar, marcamos como cancelada
    await prisma.sale.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al cancelar venta:", error);
    return NextResponse.json({ error: 'Error al cancelar la venta' }, { status: 400 });
  }
} 