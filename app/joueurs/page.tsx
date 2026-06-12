'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import UsersPage from '@/views/UsersPage';
export default function Page() {
  return <Suspense><UsersPage /></Suspense>;
}
