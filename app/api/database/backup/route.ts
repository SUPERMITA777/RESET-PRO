import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Función para obtener todos los datos de la base de datos
async function getAllDatabaseData() {
  try {
    // Obtener datos de todas las tablas
    const treatments = await prisma.treatment.findMany();
    const availability = await prisma.availability.findMany();
    const professionals = await prisma.professional.findMany();
    const professionalAvailability = await prisma.professionalAvailability.findMany();
    const clients = await prisma.client.findMany();
    const appointments = await prisma.appointment.findMany();
    const products = await prisma.product.findMany();
    const paymentMethods = await prisma.paymentMethod.findMany();
    const sales = await prisma.sale.findMany();
    const saleItems = await prisma.saleItem.findMany();
    const payments = await prisma.payment.findMany();
    const expenses = await prisma.expense.findMany();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // No incluimos la contraseña por seguridad
      }
    });

    // Crear objeto con todos los datos
    return {
      treatments,
      availability,
      professionals,
      professionalAvailability,
      clients,
      appointments,
      products,
      paymentMethods,
      sales,
      saleItems,
      payments,
      expenses,
      users
    };
  } catch (error) {
    console.error('Error al obtener datos de la base de datos:', error);
    throw error;
  }
}

// Endpoint para crear un respaldo
export async function GET() {
  try {
    const data = await getAllDatabaseData();
    
    // Crear nombre de archivo con fecha y hora
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.json`;
    
    // Convertir a JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Crear directorio de respaldos si no existe
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Guardar archivo
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, jsonData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Respaldo creado exitosamente',
      fileName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al crear respaldo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear respaldo' },
      { status: 500 }
    );
  }
} 