# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar RESET-PRO en Vercel, una plataforma de despliegue para aplicaciones web.

## Requisitos Previos

1. Una cuenta en [Vercel](https://vercel.com)
2. Una cuenta en [GitHub](https://github.com)
3. Una base de datos PostgreSQL (recomendamos [Neon](https://neon.tech), [Supabase](https://supabase.com) o [Railway](https://railway.app))

## Pasos para el Despliegue

### 1. Preparar el Repositorio en GitHub

1. Crea un nuevo repositorio en GitHub
2. Sube el código de RESET-PRO a tu repositorio:

```bash
git remote add origin https://github.com/tu-usuario/reset-pro.git
git push -u origin master
```

### 2. Configurar la Base de Datos

1. Crea una base de datos PostgreSQL en tu proveedor preferido
2. Obtén la URL de conexión a la base de datos
3. Ejecuta las migraciones de Prisma en tu base de datos:

```bash
# Configura la variable DATABASE_URL con tu URL de conexión
export DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_base_datos?sslmode=require"

# Ejecuta las migraciones
npx prisma migrate deploy
```

### 3. Desplegar en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "Add New" > "Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:
   - `DATABASE_URL`: URL de conexión a tu base de datos PostgreSQL
   - `NEXTAUTH_SECRET`: Una cadena secreta para NextAuth (puedes generarla con `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: La URL de tu aplicación desplegada (ej. https://reset-pro.vercel.app)
   - `JWT_SECRET`: Una cadena secreta para JWT (puedes generarla con `openssl rand -base64 32`)

5. Haz clic en "Deploy"

### 4. Verificar el Despliegue

1. Una vez completado el despliegue, Vercel te proporcionará una URL para tu aplicación
2. Visita la URL para verificar que la aplicación se ha desplegado correctamente
3. Inicia sesión con las credenciales predeterminadas:
   - Usuario: admin
   - Contraseña: admin123

### 5. Configurar un Dominio Personalizado (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en "Settings" > "Domains"
3. Agrega tu dominio personalizado y sigue las instrucciones para configurar los registros DNS

## Solución de Problemas

### Error de Conexión a la Base de Datos

Si encuentras errores de conexión a la base de datos:

1. Verifica que la URL de conexión sea correcta
2. Asegúrate de que la base de datos esté accesible desde Vercel (algunos proveedores requieren configuración adicional)
3. Verifica que las migraciones se hayan ejecutado correctamente

### Errores de Despliegue

Si encuentras errores durante el despliegue:

1. Revisa los logs de despliegue en Vercel
2. Asegúrate de que todas las variables de entorno estén configuradas correctamente
3. Verifica que el archivo `vercel.json` esté correctamente configurado

## Actualizaciones

Para actualizar tu aplicación desplegada:

1. Realiza los cambios en tu código local
2. Haz commit y push a GitHub:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

3. Vercel detectará automáticamente los cambios y desplegará la nueva versión

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)

Fecha de actualización: 12/03/2025 