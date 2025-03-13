import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Iniciando seed...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'No definida')
    
    // Verificar conexión a la base de datos
    console.log('Verificando conexión a la base de datos...')
    await prisma.$queryRaw`SELECT 1`
    console.log('Conexión a la base de datos exitosa')

    // Crear usuario administrador si no existe
    console.log('Buscando usuario administrador...')
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!adminExists) {
      console.log('Creando usuario administrador...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'ADMIN',
          isActive: true,
        },
      })
      console.log('Usuario administrador creado')
    } else {
      console.log('El usuario administrador ya existe')
    }

    // Crear gastos de ejemplo si no existen
    console.log('Verificando gastos existentes...')
    const expensesCount = await prisma.expense.count()
    
    if (expensesCount === 0) {
      console.log('Creando gastos de ejemplo...')
      const expenses = await prisma.expense.createMany({
        data: [
          {
            description: 'Compra de materiales de limpieza',
            amount: 150.50,
            date: new Date(),
            category: 'Suministros',
          },
          {
            description: 'Pago de servicios de luz',
            amount: 300.75,
            date: new Date(),
            category: 'Servicios',
          }
        ]
      })
      console.log('Gastos de ejemplo creados:', expenses.count)
    } else {
      console.log('Ya existen gastos en la base de datos')
    }

    console.log('Seed completado exitosamente')
  } catch (error) {
    console.error('Error durante el seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error fatal durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Cerrando conexión a la base de datos...')
    await prisma.$disconnect()
    console.log('Conexión cerrada')
  }) 