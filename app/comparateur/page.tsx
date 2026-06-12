'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import ComparatorPage from '@/views/ComparatorPage';
export default function Page() {
  return <Suspense><ComparatorPage /></Suspense>;
}
