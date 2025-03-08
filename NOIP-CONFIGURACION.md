# Configuración de NO-IP para ResetV0

## Requisitos Previos
1. Una cuenta en NO-IP (https://www.noip.com/)
2. Acceso a la configuración de tu router
3. Base de datos PostgreSQL instalada y configurada

## Pasos para configurar NO-IP

### 1. Crear una cuenta y hostname en NO-IP
1. Regístrate en NO-IP (https://www.noip.com/)
2. Crea un hostname gratuito (ej: `tuempresa.ddns.net`)
3. Descarga e instala el cliente de actualización de NO-IP en tu computadora
4. Configura el cliente con tu cuenta y hostname

### 2. Configurar el reenvío de puertos en tu router
1. Accede a la interfaz de administración de tu router (generalmente 192.168.0.1 o 192.168.1.1)
2. Busca la sección "Port Forwarding" o "Reenvío de puertos"
3. Crea una nueva regla:
   - Puerto externo: 3000 (o el que prefieras)
   - IP interna: La IP de tu computadora (puedes encontrarla ejecutando `ipconfig` en CMD)
   - Puerto interno: 3000
   - Protocolo: TCP y UDP

### 3. Iniciar el servidor
1. Ejecuta `iniciar-servidor.bat`
2. El servidor estará disponible en `http://tuempresa.ddns.net:3000`

## Verificación
1. Desde tu teléfono móvil (usando datos móviles, no WiFi) o desde otra red, intenta acceder a `http://tuempresa.ddns.net:3000`
2. Deberías ver la página de inicio de ResetV0

## Solución de problemas
- Si no puedes acceder desde internet, verifica:
  - Que el cliente de NO-IP esté ejecutándose
  - Que el reenvío de puertos esté configurado correctamente
  - Que no haya restricciones en tu firewall
  - Que el servidor esté ejecutándose en tu computadora

## Consideraciones de seguridad
- Este es un entorno básico para desarrollo y pruebas, no se recomienda para producción
- Considera implementar HTTPS para mayor seguridad
- Limita el acceso solo a los usuarios que realmente necesitan acceder remotamente 