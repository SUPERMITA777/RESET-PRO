import { UserRole } from '@prisma/client'
import 'next/server'

declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: number
      username: string
      role: UserRole
      iat?: number
      exp?: number
    }
  }
} 