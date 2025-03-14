require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyCustomMigration() {
  console.log('Aplicando migración personalizada...');
  
  // Verificar que la variable de entorno DATABASE_URL está definida
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está definida en las variables de entorno');
    process.exit(1);
  }
  
  // Conectar a la base de datos
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida');
    
    // Verificar si las tablas ya existen
    const checkServiceCategoryResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ServiceCategory'
      );
    `);
    
    const serviceTableExists = checkServiceCategoryResult.rows[0].exists;
    
    if (serviceTableExists) {
      console.log('Las tablas ya existen, omitiendo migración personalizada');
    } else {
      console.log('Aplicando migración personalizada para crear las tablas Service y ServiceCategory');
      
      // Crear la tabla ServiceCategory
      await client.query(`
        CREATE TABLE IF NOT EXISTS "ServiceCategory" (
          "id" SERIAL NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
        );
      `);
      
      // Crear la tabla Service
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Service" (
          "id" SERIAL NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "duration" INTEGER NOT NULL,
          "categoryId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
        );
      `);
      
      // Añadir la restricción de clave foránea
      await client.query(`
        ALTER TABLE "Service" 
        ADD CONSTRAINT "Service_categoryId_fkey" 
        FOREIGN KEY ("categoryId") 
        REFERENCES "ServiceCategory"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
      
      // Modificar la tabla Appointment
      await client.query(`
        ALTER TABLE "Appointment" 
        ADD COLUMN IF NOT EXISTS "serviceId" INTEGER,
        ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
      `);
      
      // Añadir la restricción de clave foránea para Appointment
      await client.query(`
        ALTER TABLE "Appointment" 
        ADD CONSTRAINT "Appointment_serviceId_fkey" 
        FOREIGN KEY ("serviceId") 
        REFERENCES "Service"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      
      console.log('Migración personalizada aplicada con éxito');
      
      // Insertar las categorías de servicios
      const categorias = [
        { name: 'Faciales' },
        { name: 'Corporales' },
        { name: 'Depilación' },
        { name: 'Manicura y Pedicura' }
      ];
      
      for (const categoria of categorias) {
        await client.query(`
          INSERT INTO "ServiceCategory" ("name", "updatedAt")
          VALUES ($1, NOW())
          ON CONFLICT DO NOTHING;
        `, [categoria.name]);
      }
      
      console.log('Categorías de servicios creadas');
    }
  } catch (error) {
    console.error('Error al aplicar la migración personalizada:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

applyCustomMigration()
  .then(() => {
    console.log('Proceso de migración personalizada completado');
  })
  .catch((error) => {
    console.error('Error en el proceso de migración personalizada:', error);
    process.exit(1);
  }); 