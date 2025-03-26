import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/seed
export async function POST() {
  try {
    // Limpiar la base de datos
    await prisma.appointment.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.professionalAvailability.deleteMany({});
    await prisma.treatment.deleteMany({});
    await prisma.professional.deleteMany({});
    await prisma.client.deleteMany({});

    // Crear tratamientos
    const treatment1 = await prisma.treatment.create({
      data: {
        name: "Limpieza Facial",
        description: "Tratamiento básico de limpieza facial",
        duration: 60,
        price: 5000,
        isSubtreatment: false,
      },
    });

    const treatment2 = await prisma.treatment.create({
      data: {
        name: "Limpieza Facial Profunda",
        description: "Limpieza facial con exfoliación y mascarilla",
        duration: 90,
        price: 7500,
        isSubtreatment: true,
        parentId: treatment1.id,
      },
    });

    const treatment3 = await prisma.treatment.create({
      data: {
        name: "Masaje Relajante",
        description: "Masaje corporal para relajación",
        duration: 60,
        price: 6000,
        isSubtreatment: false,
      },
    });

    const treatment4 = await prisma.treatment.create({
      data: {
        name: "Masaje Descontracturante",
        description: "Masaje para aliviar contracturas musculares",
        duration: 60,
        price: 7000,
        isSubtreatment: true,
        parentId: treatment3.id,
      },
    });

    // Crear disponibilidad para tratamientos
    await prisma.availability.create({
      data: {
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        startTime: "09:00",
        endTime: "17:00",
        box: "Box 1",
        treatmentId: treatment1.id,
      },
    });

    await prisma.availability.create({
      data: {
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        startTime: "09:00",
        endTime: "17:00",
        box: "Box 2",
        treatmentId: treatment3.id,
      },
    });

    // Crear profesionales
    const professional1 = await prisma.professional.create({
      data: {
        name: "Ana García",
        specialty: "Esteticista",
      },
    });

    const professional2 = await prisma.professional.create({
      data: {
        name: "Carlos Rodríguez",
        specialty: "Masajista",
      },
    });

    // Crear disponibilidad para profesionales
    await prisma.professionalAvailability.create({
      data: {
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        startTime: "09:00",
        endTime: "17:00",
        professionalId: professional1.id,
      },
    });

    await prisma.professionalAvailability.create({
      data: {
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        startTime: "09:00",
        endTime: "17:00",
        professionalId: professional2.id,
      },
    });

    // Crear clientes
    const client1 = await prisma.client.create({
      data: {
        name: "María López",
        email: "maria@example.com",
        phone: "1234567890",
      },
    });

    const client2 = await prisma.client.create({
      data: {
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "0987654321",
      },
    });

    // Crear citas
    await prisma.appointment.create({
      data: {
        date: new Date("2025-01-15"),
        time: "10:00",
        status: "confirmed",
        professionalId: professional1.id,
        treatmentId: treatment1.id,
        clientId: client1.id,
        box: "Box 1",
        deposit: 2000,
        price: 5000,
        duration: 60,
      },
    });

    await prisma.appointment.create({
      data: {
        date: new Date("2025-01-20"),
        time: "14:00",
        status: "confirmed",
        professionalId: professional2.id,
        treatmentId: treatment3.id,
        clientId: client2.id,
        box: "Box 2",
        deposit: 2500,
        price: 6000,
        duration: 60,
      },
    });

    return NextResponse.json({ success: true, message: "Base de datos sembrada con éxito" });
  } catch (error) {
    console.error("Error al sembrar la base de datos:", error);
    return NextResponse.json({ error: 'Error al sembrar la base de datos' }, { status: 500 });
  }
} 