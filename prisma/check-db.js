const { PrismaClient } = require('@prisma/client');

// Crear una instancia de PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Verificando conexión a la base de datos...');
  
  try {
    // Intentar conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Ejecutar una consulta SQL directa para verificar la conexión
    const result = await prisma.$queryRaw`SELECT current_database() as database, current_timestamp as timestamp`;
    console.log('Información de la base de datos:', result);
    
    // Verificar las tablas disponibles
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Tablas disponibles en la base de datos:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    console.log('✅ Verificación de datos completada');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 