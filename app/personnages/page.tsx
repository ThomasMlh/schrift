'use client';
import { Suspense } from 'react';
import CharactersPage from '@/views/CharactersPage';
export default function Page() {
  return <Suspense><CharactersPage /></Suspense>;
}
