import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Crear usuario administrador si no existe
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

  // Crear gastos de ejemplo
  const expenses = await prisma.expense.createMany({
    data: [
      {
        description: 'Compra de materiales de limpieza',
        amount: 150.50,
        date: new Date(),
        category: 'Suministros',
        paymentMethod: 'Efectivo',
        notes: 'Compra mensual de productos de limpieza'
      },
      {
        description: 'Pago de servicios de luz',
        amount: 300.75,
        date: new Date(),
        category: 'Servicios',
        paymentMethod: 'Transferencia',
        notes: 'Factura mensual de electricidad'
      }
    ]
  })

  console.log({ expenses })
  console.log('Seed completado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 