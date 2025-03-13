'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

export default function AccesoDenegadoPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-4 text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para acceder a esta página.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Ir al Dashboard
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/login')
            }}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
} 