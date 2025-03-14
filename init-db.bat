@echo off
echo Inicializando base de datos para RESET PRO

REM Crear base de datos
psql -U postgres -c "CREATE DATABASE reset_db;"

REM Generar cliente de Prisma
call npx prisma generate

REM Aplicar migraciones
call npx prisma migrate dev --name init

echo Base de datos inicializada correctamente 