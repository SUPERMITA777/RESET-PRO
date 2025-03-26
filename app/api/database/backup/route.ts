import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Endpoint para crear un respaldo de la base de datos
export async function POST() {
  try {
    // Obtener todos los datos de todas las tablas del sistema
    const professionals = await prisma.professional.findMany();
    const availability = await prisma.availability.findMany();
    const clients = await prisma.client.findMany();
    const treatments = await prisma.treatment.findMany();
    const products = await prisma.product.findMany();
    const appointments = await prisma.appointment.findMany();
    const sales = await prisma.sale.findMany({
      include: {
        items: true
      }
    });
    const expenses = await prisma.expense.findMany();
    const payments = await prisma.payment.findMany();
    
    // Obtener modelos opcionales con manejo de errores
    let serviceCategories: any[] = [];
    let services: any[] = [];

    try {
      // Usar $queryRaw para acceder a tablas que pueden no existir en el esquema
      const rawServiceCategories = await prisma.$queryRaw`SELECT * FROM "ServiceCategory"`;
      serviceCategories = Array.isArray(rawServiceCategories) ? rawServiceCategories : [];
    } catch (error) {
      console.log('Categorías de servicio no encontradas en el esquema');
    }

    try {
      // Usar $queryRaw para acceder a tablas que pueden no existir en el esquema
      const rawServices = await prisma.$queryRaw`SELECT * FROM "Service"`;
      services = Array.isArray(rawServices) ? rawServices : [];
    } catch (error) {
      console.log('Servicios no encontrados en el esquema');
    }

    // Crear objeto con todos los datos
    const backupData = {
      professionals,
      availability,
      clients,
      treatments,
      products,
      appointments,
      sales,
      expenses,
      payments,
      serviceCategories,
      services,
      createdAt: new Date().toISOString()
    };

    // Generar nombre de archivo para el respaldo
    const date = new Date();
    const formattedDate = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `respaldo_db_${formattedDate}.json`;

    // Convertir a JSON string
    const jsonData = JSON.stringify(backupData, null, 2);

    // Crear una respuesta con el archivo JSON
    const response = new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error creando respaldo:', error);
    return NextResponse.json({ success: false, error: 'Error al crear respaldo' }, { status: 500 });
  }
} 