const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Verificando conexión a la base de datos...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'No definida');
    
    // Intentar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Conexión exitosa. Resultado:', result);
    
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then((success) => {
    console.log('Verificación completada:', success ? 'Exitosa' : 'Fallida');
    process.exit(success ? 0 : 1);
  })
  .catch((e) => {
    console.error('Error inesperado:', e);
    process.exit(1);
  }); 