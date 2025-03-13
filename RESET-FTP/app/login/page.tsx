'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Intentando iniciar sesión con:', JSON.stringify({ username, password }, null, 2))
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      console.log('Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await response.json()
      console.log('Datos de respuesta:', JSON.stringify(data, null, 2))

      if (response.ok) {
        console.log('Inicio de sesión exitoso, redirigiendo a:', data.redirectUrl)
        toast.success('Inicio de sesión exitoso')
        // Redirigir al dashboard usando el enrutador de Next.js
        router.push(data.redirectUrl)
      } else {
        console.error('Error de inicio de sesión:', JSON.stringify(data, null, 2))
        toast.error(data.error || data.details || 'Error de inicio de sesión')
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      toast.error('Error de conexión al servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              placeholder="Ingresa tu nombre de usuario"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage 