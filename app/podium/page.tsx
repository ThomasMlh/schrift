'use client';
import { Suspense } from 'react';
import PodiumPage from '@/views/PodiumPage';
export default function Page() {
  return <Suspense><PodiumPage /></Suspense>;
}
