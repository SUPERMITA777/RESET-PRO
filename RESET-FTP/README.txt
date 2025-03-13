INSTRUCCIONES PARA DESPLEGAR RESET-PRO EN SERVIDOR FTP
=============================================

Este archivo contiene instrucciones para desplegar la aplicación RESET-PRO en un servidor FTP.

REQUISITOS DEL SERVIDOR
----------------------
- Soporte para Node.js 18.x o superior
- Soporte para npm
- Soporte para PostgreSQL (o una base de datos compatible con Prisma)
- Acceso FTP para subir archivos

PASOS PARA EL DESPLIEGUE
-----------------------
1. Sube todos los archivos y carpetas de esta carpeta RESET-FTP al servidor mediante FTP.

2. Conéctate al servidor mediante SSH (si está disponible) y ejecuta los siguientes comandos:
   ```
   cd /ruta/a/tu/aplicacion
   npm install
   npm run build
   npm start
   ```

3. Si no tienes acceso SSH, configura un archivo de inicio en el panel de control de tu hosting:
   - Comando de inicio: `npm start`
   - Directorio de trabajo: `/ruta/a/tu/aplicacion`

4. Configura las variables de entorno en el panel de control de tu hosting:
   - DATABASE_URL: URL de conexión a tu base de datos PostgreSQL
   - JWT_SECRET: Clave secreta para la generación de tokens JWT
   - NODE_ENV: Establecer como "production"

5. Configura el dominio para que apunte a la aplicación.

ESTRUCTURA DE ARCHIVOS
---------------------
- .next/: Archivos de construcción de Next.js
- app/: Componentes y páginas de la aplicación
- components/: Componentes reutilizables
- hooks/: Hooks personalizados de React
- lib/: Utilidades y configuraciones
- prisma/: Configuración de la base de datos
- public/: Archivos estáticos
- styles/: Estilos de la aplicación
- types/: Definiciones de tipos de TypeScript
- .env: Variables de entorno
- package.json: Dependencias del proyecto
- server.js: Configuración del servidor
- vercel.json: Configuración de despliegue

SOLUCIÓN DE PROBLEMAS
--------------------
- Si encuentras errores durante el despliegue, verifica los logs del servidor.
- Asegúrate de que la base de datos PostgreSQL esté correctamente configurada y accesible.
- Verifica que todas las variables de entorno estén correctamente configuradas.

Para más información, consulta la documentación de Next.js: https://nextjs.org/docs

Fecha de actualización: 12/03/2025 

# Configuración de la base de datos MySQL para Byet Hosting
DATABASE_URL="mysql://b15_38507219:2xhgwk6s@sql113.byethost15.com/b15_38507219"

# Clave secreta para JWT (autenticación)
JWT_SECRET="tu_secreto_super_seguro_y_unico_para_jwt"

# Ambiente de ejecución
NODE_ENV="production"

# Puerto para el servidor (solo necesario si el hosting permite especificar el puerto)
PORT=3000

# Dirección del hostname (solo si es necesario)
HOSTNAME="0.0.0.0" 