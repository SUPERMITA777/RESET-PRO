@echo off
echo Actualizando repositorio de GitHub...

:: Agregar todos los cambios
git add .

:: Crear commit con fecha y hora
set "datetime=%date:~6,4%-%date:~3,2%-%date:~0,2% %time:~0,2%:%time:~3,2%:%time:~6,2%"
git commit -m "Actualización automática: %datetime%"

:: Subir cambios a GitHub
git push origin master

echo.
echo Proceso completado.
pause 