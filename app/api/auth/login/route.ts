import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('Iniciando proceso de login')

    const requestBody = await request.json()
    console.log('Cuerpo de la solicitud:', JSON.stringify(requestBody, null, 2))

    const { username, password } = requestBody

    if (!username || !password) {
      console.error('Campos requeridos faltantes')
      return NextResponse.json({ 
        error: 'Nombre de usuario y contraseña son requeridos' 
      }, { status: 400 })
    }

    let user;
    try {
      user = await prisma.user.findUnique({ 
        where: { username } 
      })
      console.log('Usuario encontrado:', user ? 'Sí' : 'No')
    } catch (findError) {
      console.error('Error al buscar usuario:', findError)
      return NextResponse.json({ 
        error: 'Error al buscar usuario'
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Contraseña válida:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Cuenta desactivada' 
      }, { status: 403 })
    }

    // Generar token usando jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')
    const token = await new SignJWT({ 
      id: user.id, 
      username: user.username,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const redirectUrl = `/dashboard`;
    console.log('URL de redirección:', redirectUrl)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      redirectUrl
    })

    // Configurar cookie con opciones más permisivas en desarrollo
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Cambiado a 'lax' para desarrollo
      path: '/',
      maxAge: 24 * 60 * 60 // 24 horas
    })

    console.log('Cookie establecida, enviando respuesta')
    return response

  } catch (error) {
    console.error('Error en el proceso de login:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
} 