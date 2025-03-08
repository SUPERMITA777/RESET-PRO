import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Aquí puedes añadir datos iniciales si lo necesitas
  console.log('Base de datos inicializada correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 