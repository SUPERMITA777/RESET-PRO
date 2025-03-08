import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payment-methods
export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    return NextResponse.json({ error: 'Error al obtener los métodos de pago' }, { status: 500 });
  }
}

// POST /api/payment-methods
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        name: body.name,
        isActive: true,
      },
    });
    
    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error) {
    console.error("Error al crear método de pago:", error);
    return NextResponse.json({ error: 'Error al crear el método de pago' }, { status: 400 });
  }
}

// PUT /api/payment-methods
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: body.id },
      data: {
        name: body.name,
        isActive: body.isActive,
      },
    });
    
    return NextResponse.json(updatedPaymentMethod);
  } catch (error) {
    console.error("Error al actualizar método de pago:", error);
    return NextResponse.json({ error: 'Error al actualizar el método de pago' }, { status: 400 });
  }
}

// DELETE /api/payment-methods/:id
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = parseInt(pathParts[pathParts.length - 1]);
    
    // En lugar de eliminar, marcamos como inactivo
    await prisma.paymentMethod.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    return NextResponse.json({ error: 'Error al eliminar el método de pago' }, { status: 400 });
  }
} 