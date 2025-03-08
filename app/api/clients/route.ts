import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        appointments: true,
      },
    });

    console.log(`Obtenidos ${clients.length} clientes de la base de datos`);
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json({ error: 'Error al obtener los clientes' }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("Creando nuevo cliente:", body);
    
    // Validar datos mínimos
    if (!body.name) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
    }
    
    // Crear el cliente
    const newClient = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        medicalHistory: body.medicalHistory || null,
      },
    });
    
    console.log("Nuevo cliente creado:", JSON.stringify(newClient, null, 2));
    
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 400 });
  }
}

// PUT /api/clients
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: body.id },
    });
    
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    
    // Actualizar el cliente
    const updatedClient = await prisma.client.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        medicalHistory: body.medicalHistory || null,
      },
    });
    
    console.log("Cliente actualizado:", JSON.stringify(updatedClient, null, 2));
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 400 });
  }
}

// DELETE /api/clients/:id
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idPart = pathParts[pathParts.length - 1];
    
    // Si no hay ID en la ruta, devolvemos un error
    if (pathParts.length <= 3 || idPart === 'clients') {
      return NextResponse.json({ error: 'ID de cliente no especificado' }, { status: 400 });
    }
    
    const id = parseInt(idPart);
    
    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });
    
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    
    // Eliminar el cliente
    await prisma.client.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 400 });
  }
} 