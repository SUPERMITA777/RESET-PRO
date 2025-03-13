import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Endpoint para restaurar un respaldo
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fileName } = data;
    
    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Nombre de archivo no proporcionado' },
        { status: 400 }
      );
    }
    
    // Verificar que el archivo existe
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Archivo de respaldo no encontrado' },
        { status: 404 }
      );
    }
    
    // Leer archivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const backupData = JSON.parse(fileContent);
    
    // Iniciar transacción para restaurar datos
    await prisma.$transaction(async (tx) => {
      // Limpiar tablas en orden inverso (para respetar restricciones de clave foránea)
      await tx.payment.deleteMany({});
      await tx.saleItem.deleteMany({});
      await tx.sale.deleteMany({});
      await tx.appointment.deleteMany({});
      await tx.professionalAvailability.deleteMany({});
      await tx.availability.deleteMany({});
      await tx.expense.deleteMany({});
      await tx.product.deleteMany({});
      await tx.paymentMethod.deleteMany({});
      await tx.client.deleteMany({});
      await tx.professional.deleteMany({});
      await tx.treatment.deleteMany({});
      // No eliminamos usuarios para mantener la seguridad
      
      // Restaurar datos en orden correcto
      if (backupData.treatments?.length) {
        for (const treatment of backupData.treatments) {
          await tx.treatment.create({ data: {
            ...treatment,
            createdAt: new Date(treatment.createdAt),
            updatedAt: new Date(treatment.updatedAt)
          }});
        }
      }
      
      if (backupData.professionals?.length) {
        for (const professional of backupData.professionals) {
          await tx.professional.create({ data: {
            ...professional,
            createdAt: new Date(professional.createdAt),
            updatedAt: new Date(professional.updatedAt)
          }});
        }
      }
      
      if (backupData.professionalAvailability?.length) {
        for (const availability of backupData.professionalAvailability) {
          await tx.professionalAvailability.create({ data: {
            ...availability,
            startDate: new Date(availability.startDate),
            endDate: new Date(availability.endDate),
            createdAt: new Date(availability.createdAt),
            updatedAt: new Date(availability.updatedAt)
          }});
        }
      }
      
      if (backupData.clients?.length) {
        for (const client of backupData.clients) {
          await tx.client.create({ data: {
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt)
          }});
        }
      }
      
      if (backupData.availability?.length) {
        for (const availability of backupData.availability) {
          await tx.availability.create({ data: {
            ...availability,
            startDate: new Date(availability.startDate),
            endDate: new Date(availability.endDate),
            createdAt: new Date(availability.createdAt),
            updatedAt: new Date(availability.updatedAt)
          }});
        }
      }
      
      if (backupData.paymentMethods?.length) {
        for (const method of backupData.paymentMethods) {
          await tx.paymentMethod.create({ data: {
            ...method,
            createdAt: new Date(method.createdAt),
            updatedAt: new Date(method.updatedAt)
          }});
        }
      }
      
      if (backupData.products?.length) {
        for (const product of backupData.products) {
          await tx.product.create({ data: {
            ...product,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          }});
        }
      }
      
      if (backupData.appointments?.length) {
        for (const appointment of backupData.appointments) {
          await tx.appointment.create({ data: {
            ...appointment,
            date: new Date(appointment.date),
            createdAt: new Date(appointment.createdAt),
            updatedAt: new Date(appointment.updatedAt)
          }});
        }
      }
      
      if (backupData.sales?.length) {
        for (const sale of backupData.sales) {
          await tx.sale.create({ data: {
            ...sale,
            date: new Date(sale.date),
            createdAt: new Date(sale.createdAt),
            updatedAt: new Date(sale.updatedAt)
          }});
        }
      }
      
      if (backupData.saleItems?.length) {
        for (const item of backupData.saleItems) {
          await tx.saleItem.create({ data: {
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }});
        }
      }
      
      if (backupData.payments?.length) {
        for (const payment of backupData.payments) {
          await tx.payment.create({ data: {
            ...payment,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt)
          }});
        }
      }
      
      if (backupData.expenses?.length) {
        for (const expense of backupData.expenses) {
          await tx.expense.create({ data: {
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt)
          }});
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos restaurada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al restaurar la base de datos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al restaurar la base de datos' },
      { status: 500 }
    );
  }
}

// Endpoint para listar respaldos disponibles
export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      return NextResponse.json({ backups: [] });
    }
    
    // Leer archivos en el directorio
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Ordenar por fecha descendente
    
    return NextResponse.json({ backups: files });
  } catch (error) {
    console.error('Error al listar respaldos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar respaldos' },
      { status: 500 }
    );
  }
} 