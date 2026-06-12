'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import GuidesPage from '@/views/GuidesPage';
export default function Page() {
  return <Suspense><GuidesPage /></Suspense>;
}
