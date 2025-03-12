# RESET-PRO

Sistema de gestión para Reset Spa.

## Características

- Gestión de tratamientos y subtratamientos
- Agenda con vista diaria, semanal y mensual
- Gestión de citas y disponibilidad
- Gestión de clientes
- Gestión de profesionales
- Gestión de productos
- Gestión de ventas y pagos
- Panel de administración

## Tecnologías

- Next.js 15
- Prisma ORM
- PostgreSQL (Neon.tech)
- Tailwind CSS
- Shadcn UI
- Vercel

## Requisitos

- Node.js 18.x o superior
- npm 9.x o superior
- PostgreSQL (o una base de datos compatible con Prisma)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/reset-pro.git
   cd reset-pro
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Actualiza las variables con tus propios valores

4. Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

5. Ejecutar migraciones de la base de datos:
   ```bash
   npx prisma migrate dev
   ```

6. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en Vercel

1. Crea una cuenta en Vercel si aún no tienes una
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`: URL de conexión a tu base de datos PostgreSQL
   - `JWT_SECRET`: Clave secreta para la generación de tokens JWT
   - `NODE_ENV`: Establecer como "production"

4. Despliega la aplicación

La aplicación está desplegada en Vercel y utiliza una base de datos PostgreSQL alojada en Neon.tech.

Fecha de actualización: 12/03/2025 