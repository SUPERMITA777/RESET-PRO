// Cargar variables de entorno desde .env
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

// Verificar si DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida en las variables de entorno');
  // Usar la URL de la base de datos remota que sabemos que funciona
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_Chb9LgKPs4mF@ep-withered-mud-a8vh18zd-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
  console.log('Se ha establecido una URL de base de datos por defecto (remota)');
}

// Imprimir información de depuración
console.log('Conectando a la base de datos con URL:', process.env.DATABASE_URL ? 'URL configurada correctamente' : 'URL no configurada');

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Verificar la conexión a la base de datos
prisma.$connect()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 