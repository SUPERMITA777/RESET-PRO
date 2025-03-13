@echo off
echo ===================================
echo    ACTUALIZAR REPOSITORIO GITHUB
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
echo    PROCESO COMPLETADO
echo ===================================
echo.
echo Presiona cualquier tecla para salir...
pause > nul 