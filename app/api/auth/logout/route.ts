import { NextResponse } from 'next/server'

export async function GET() {
  // Crear respuesta y eliminar la cookie de token
  const response = NextResponse.redirect(new URL('/login', new URL('http://localhost:3000').origin));
  
  // Eliminar la cookie de token
  response.cookies.delete('token');
  
  return response;
} 