import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// Función para obtener el logo
export async function GET() {
  try {
    // Obtener la configuración del logo desde la base de datos
    // @ts-ignore: El modelo Setting puede no estar definido en el tipo PrismaClient, pero existe en la BD
    const logoSetting = await prisma.setting.findFirst({
      where: {
        key: 'logo'
      }
    });

    if (!logoSetting || !logoSetting.value) {
      // Si no hay logo configurado, devolver una respuesta vacía
      return NextResponse.json({ logoUrl: null });
    }

    // Devolver la URL del logo
    return NextResponse.json({ logoUrl: logoSetting.value });
  } catch (error) {
    console.error('Error al obtener el logo:', error);
    return NextResponse.json(
      { error: 'Error al obtener el logo' },
      { status: 500 }
    );
  }
}

// Función para subir y actualizar el logo
export async function POST(request: NextRequest) {
  try {
    // Verificar si estamos en entorno Vercel
    const isVercelProduction = process.env.VERCEL_ENV === 'production';
    
    if (isVercelProduction) {
      return NextResponse.json(
        { 
          error: "No se puede subir el logo en el entorno de producción Vercel. Vercel tiene un sistema de archivos de solo lectura. Para implementar esta funcionalidad, necesitas usar almacenamiento externo como AWS S3, Supabase Storage o similar." 
        },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen no debe superar los 2MB' },
        { status: 400 }
      );
    }

    // Crear directorio para almacenar imágenes si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `logo_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Leer el archivo como un ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Escribir el archivo en el sistema de archivos
    await writeFile(filePath, buffer);

    // URL pública del logo
    const logoUrl = `/uploads/${fileName}`;

    // Actualizar o crear la configuración en la base de datos
    // @ts-ignore: El modelo Setting puede no estar definido en el tipo PrismaClient, pero existe en la BD
    await prisma.setting.upsert({
      where: {
        key: 'logo'
      },
      update: {
        value: logoUrl
      },
      create: {
        key: 'logo',
        value: logoUrl
      }
    });

    return NextResponse.json({ 
      message: 'Logo actualizado correctamente',
      logoUrl 
    });
  } catch (error) {
    console.error('Error al subir el logo:', error);
    return NextResponse.json(
      { error: 'Error al subir el logo' },
      { status: 500 }
    );
  }
} 