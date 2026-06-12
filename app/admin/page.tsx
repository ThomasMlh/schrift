'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import AdminPage from '@/views/AdminPage';
export default function Page() {
  return <Suspense><AdminPage /></Suspense>;
}
