const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const users = await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador Principal',
        email: 'admin@empresa.com',
        role: 'ADMIN'
      },
      {
        username: 'operador',
        password: hashedPassword,
        name: 'Operador Principal',
        email: 'operador@empresa.com',
        role: 'OPERATOR'
      }
    ]
  })

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

  console.log({ users, expenses })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 