'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import CharactersPage from '@/views/CharactersPage';
export default function Page() {
  return <Suspense><CharactersPage /></Suspense>;
}
