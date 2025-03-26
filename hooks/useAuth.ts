import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  name: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // No hay usuario autenticado
          setUser(null)
          router.push('/login')
        }
      } catch (error) {
        console.error('Error de autenticación:', error)
        setUser(null)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setUser(null)
        router.push('/login')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return { 
    user, 
    isLoading, 
    logout 
  }
} 