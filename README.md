# Frontend para Reserva de Turnos

Este proyecto es un frontend para un sistema de reserva de turnos, inspirado en AgendaPro. Permite a los clientes ver los servicios disponibles, sus precios y agendar turnos.

## Características

- Listado de servicios y sub-tratamientos con precios
- Reserva de turnos con selección de fecha y hora
- Formulario de contacto para los clientes
- Visualización del logo del negocio
- Diseño responsive y moderno

## Tecnologías utilizadas

- Next.js
- React
- Material UI
- Prisma ORM
- PostgreSQL

## Requisitos previos

- Node.js (versión 18 o superior)
- PostgreSQL

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/reset-front.git
   cd reset-front
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
     ```
     DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_db?schema=public"
     NEXTAUTH_SECRET="tu-clave-secreta"
     NEXTAUTH_URL="http://localhost:3000"
     ```

4. Genera el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

5. Ejecuta las migraciones de la base de datos:
   ```bash
   npx prisma migrate dev
   ```

6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

7. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del proyecto

- `src/app`: Páginas y rutas de la aplicación
- `src/components`: Componentes reutilizables
- `src/lib`: Utilidades y configuraciones
- `prisma`: Esquema y migraciones de la base de datos

## Endpoints de API

- `GET /api/services`: Obtiene la lista de servicios y sub-tratamientos
- `GET /api/availability`: Verifica la disponibilidad de horarios para una fecha y servicio específicos
- `POST /api/appointments`: Crea una nueva cita
- `GET /api/settings/logo`: Obtiene la URL del logo del negocio
- `POST /api/settings/logo`: Actualiza el logo del negocio

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

Fecha de actualización: 12/03/2025 
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