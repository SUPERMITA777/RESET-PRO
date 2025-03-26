import { NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

export async function GET(request: Request) {
  const prisma = new PrismaClient()

  try {
    // Obtener el token de las cookies
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar el token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default_secret'
    ) as { id: number }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  } finally {
    await prisma.$disconnect()
  }
} 