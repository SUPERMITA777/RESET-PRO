@echo off
echo Iniciando servidor de ResetV0 con NO-IP...
echo.
echo Asegúrate de que:
echo 1. Tu servicio NO-IP está configurado correctamente
echo 2. El puerto 3000 está reenviado en tu router
echo 3. La base de datos PostgreSQL está en ejecución
echo.

set DATABASE_URL=postgresql://postgres:1977@localhost:5432/resetv0?schema=public

echo Iniciando el servidor...
npm run build && npm start
pause 