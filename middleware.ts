import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/_next',
  '/favicon.ico',
]

// Rutas protegidas por rol
const rolePermissions = {
  ADMIN: ['/dashboard', '/api'],
  MANAGER: ['/dashboard', '/api'],
  OPERATOR: ['/dashboard', '/api'],
  READONLY: ['/dashboard/reportes', '/api/reportes']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Obtener token
  const token = request.cookies.get('token')?.value

  // Si no hay token, redirigir al login
  if (!token) {
    console.log('No hay token, redirigiendo a login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verificar token usando jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    console.log('Token verificado:', {
      role,
      pathname
    })

    // Verificar permisos de rol
    const userPermissions = rolePermissions[role as keyof typeof rolePermissions] || []
    const hasPermission = userPermissions.some(path => pathname.startsWith(path))

    if (!hasPermission) {
      console.log('Permiso denegado, redirigiendo a agenda')
      return NextResponse.redirect(new URL('/dashboard/agenda', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.log('Error al verificar token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configurar las rutas que serán interceptadas por el middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 