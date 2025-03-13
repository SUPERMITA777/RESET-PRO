'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/components/dashboard';

// Componente cliente que usa useSearchParams
function DashboardWithParams() {
  const searchParams = useSearchParams();
  // Usa searchParams aquí si es necesario
  
  return <Dashboard />;
}

// Página principal que envuelve el componente cliente en Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DashboardWithParams />
    </Suspense>
  );
} 