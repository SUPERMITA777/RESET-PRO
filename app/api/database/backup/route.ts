import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Endpoint para crear un respaldo de la base de datos
export async function POST(request: NextRequest) {
  try {
    // Crear directorio de respaldos si no existe
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Nombre del archivo basado en la fecha
    const date = new Date();
    const fileName = `backup_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}.json`;
    const filePath = path.join(backupDir, fileName);
    
    // Consultar todos los datos
    const [
      treatments,
      professionals,
      professionalAvailability,
      clients,
      availability,
      paymentMethods,
      products,
      appointments,
      sales,
      saleItems,
      payments,
      expenses,
      serviceCategories,
      services
    ] = await Promise.all([
      prisma.treatment.findMany(),
      prisma.professional.findMany(),
      prisma.professionalAvailability.findMany(),
      prisma.client.findMany(),
      prisma.availability.findMany(),
      prisma.paymentMethod.findMany(),
      prisma.product.findMany(),
      prisma.appointment.findMany(),
      prisma.sale.findMany(),
      prisma.saleItem.findMany(),
      prisma.payment.findMany(),
      prisma.expense.findMany(),
      // Intentar obtener categorías de servicios y servicios, pero manejar caso donde no existen
      prisma.$queryRaw`SELECT * FROM "ServiceCategory"`.catch(() => []),
      prisma.$queryRaw`SELECT * FROM "Service"`.catch(() => [])
    ]);
    
    // Crear objeto con todos los datos
    const backupData = {
      treatments,
      professionals,
      professionalAvailability,
      clients,
      availability,
      paymentMethods,
      products,
      appointments,
      sales,
      saleItems,
      payments,
      expenses,
      serviceCategories,
      services
    };
    
    // Guardar en archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Respaldo creado exitosamente',
      fileName,
      path: filePath,
      timestamp: date.toISOString()
    });
  } catch (error) {
    console.error('Error al crear respaldo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear respaldo' },
      { status: 500 }
    );
  }
} 