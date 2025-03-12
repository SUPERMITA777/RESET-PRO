import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida');
  process.env.DATABASE_URL = "postgresql://postgres:1977@localhost:5432/resetv0?schema=public";
}

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

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 