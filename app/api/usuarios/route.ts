import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

// Obtener usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' }, 
      { status: 500 }
    )
  }
}

// Crear usuario
export async function POST(request: Request) {
  try {
    const { 
      username, 
      name, 
      email, 
      password, 
      role = 'OPERATOR' 
    } = await request.json()

    // Validar campos requeridos
    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { username },
          { email }
        ]
      } 
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El nombre de usuario o correo ya existe' }, 
        { status: 409 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' }, 
      { status: 500 }
    )
  }
}

// Actualizar usuario
export async function PUT(request: Request) {
  try {
    const { 
      id,
      username, 
      name, 
      email, 
      password, 
      role,
      isActive
    } = await request.json()

    // Validar ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' }, 
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({ 
      where: { id } 
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      )
    }

    // Verificar si el username o email ya existen en otro usuario
    if (username || email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          OR: [
            username ? { username } : {},
            email ? { email } : {}
          ],
          NOT: { id }
        }
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'El nombre de usuario o correo ya está en uso por otro usuario' }, 
          { status: 409 }
        )
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    
    if (username) updateData.username = username
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    
    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' }, 
      { status: 500 }
    )
  }
}

// Eliminar usuario (desactivar)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const idPart = pathParts[pathParts.length - 1]
    
    // Si no hay ID en la ruta, devolvemos un error
    if (pathParts.length <= 3 || idPart === 'usuarios') {
      return NextResponse.json({ error: 'ID de usuario no especificado' }, { status: 400 })
    }
    
    const id = parseInt(idPart)
    
    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })
    
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    
    // En lugar de eliminar, marcamos como inactivo
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al desactivar usuario:', error)
    return NextResponse.json(
      { error: 'Error al desactivar usuario' }, 
      { status: 500 }
    )
  }
} 