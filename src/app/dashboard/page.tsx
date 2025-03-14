'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/components/dashboard';

// Componente cliente que usa useSearchParams
function DashboardWithParams() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  return (
    <Dashboard initialTab={tab ? parseInt(tab) : 0} />
  );
}

// Página principal que envuelve el componente cliente en Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DashboardWithParams />
    </Suspense>
  );
} 