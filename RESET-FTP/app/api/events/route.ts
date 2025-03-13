import { NextResponse } from 'next/server';

export async function GET() {
  // Simulación de datos de eventos
  const events = [
    { id: 1, title: 'Cita con Cliente 1', date: '2025-03-12T10:00:00' },
    { id: 2, title: 'Cita con Cliente 2', date: '2025-03-12T14:30:00' },
    { id: 3, title: 'Cita con Cliente 3', date: '2025-03-13T09:15:00' },
  ];

  return NextResponse.json(events);
} 