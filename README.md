# RESET-PRO

Sistema de gestión para clínica de estética y tratamientos.

## Migración a Neon.tech

Este proyecto ha sido migrado para utilizar una base de datos PostgreSQL alojada en Neon.tech, lo que proporciona:

- Base de datos PostgreSQL serverless
- Plan gratuito generoso para desarrollo
- Compatibilidad con Vercel para despliegue

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
   ```
   npm install
   ```
3. Configurar variables de entorno:
   - Crear un archivo `.env.local` basado en `.env.example`
   - Configurar la URL de conexión a la base de datos

4. Sincronizar la base de datos:
   ```
   npx prisma db push
   ```

5. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

## Despliegue en Vercel

Para desplegar en Vercel:

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno:
   - `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
   - `NODE_ENV`: "production"
3. Desplegar la aplicación

## Tecnologías

- Next.js
- Prisma ORM
- PostgreSQL (Neon.tech)
- Vercel 