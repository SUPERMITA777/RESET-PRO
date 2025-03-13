@echo off
echo ===================================
echo  ACTUALIZAR GITHUB Y DESPLEGAR EN VERCEL
echo ===================================
echo.

echo Obteniendo cambios del repositorio remoto...
git pull

echo.
echo Agregando todos los archivos modificados...
git add .

echo.
echo Creando commit con los cambios...
set /p mensaje="Ingresa el mensaje del commit: "
git commit -m "%mensaje%"

echo.
echo Subiendo cambios a GitHub...
git push

echo.
echo ===================================
echo  CAMBIOS SUBIDOS A GITHUB
echo ===================================
echo.
echo Los cambios han sido subidos a GitHub.
echo Vercel detectará automáticamente los cambios y comenzará el despliegue.
echo.
echo NOTA: Se ejecutará automáticamente el seed para crear el usuario administrador:
echo - Usuario: admin
echo - Contraseña: admin123
echo.
echo Puedes verificar el estado del despliegue en:
echo https://vercel.com/dashboard
echo.
echo Presiona cualquier tecla para salir...
pause > nul 