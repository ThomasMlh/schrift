'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import UserPage from '@/views/UserPage';
export default function Page() {
  return <Suspense><UserPage /></Suspense>;
}
