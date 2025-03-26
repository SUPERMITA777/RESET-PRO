// Cargar variables de entorno desde .env
require('dotenv').config();

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Intentar conectar a la base de datos
    await prisma.$connect()
    console.log('Conexión a la base de datos establecida correctamente')
    
    // Realizar una consulta de prueba
    const userCount = await prisma.user.count()
    console.log(`Número de usuarios: ${userCount}`)
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    process.exit(0)
  }) 