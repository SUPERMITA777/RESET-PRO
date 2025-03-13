# RESET-PRO

Sistema de gestión para clínicas y centros de estética, desarrollado con Next.js, Prisma y PostgreSQL.

## Características

- Gestión de citas y agenda
- Gestión de clientes
- Gestión de tratamientos
- Gestión de profesionales
- Reportes financieros
- Respaldo y restauración de base de datos
- Gestión de usuarios con diferentes niveles de permisos

## Requisitos

- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/reset-pro.git
   cd reset-pro
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/reset_pro"
   NEXTAUTH_SECRET="tu-secreto-para-nextauth"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Ejecutar migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una.
2. Conecta tu repositorio de GitHub con Vercel.
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`: URL de conexión a tu base de datos PostgreSQL
   - `NEXTAUTH_SECRET`: Una cadena secreta para NextAuth
   - `NEXTAUTH_URL`: La URL de tu aplicación desplegada

4. Despliega la aplicación desde el dashboard de Vercel.

## Base de datos

Para el despliegue en producción, puedes utilizar:
- [Neon](https://neon.tech) - PostgreSQL serverless
- [Supabase](https://supabase.com) - PostgreSQL con funcionalidades adicionales
- [Railway](https://railway.app) - Plataforma para desplegar PostgreSQL

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

Fecha de actualización: 12/03/2025 