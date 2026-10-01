'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/AuthContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  
  // Student Portal routes that manage their own full-screen sidebar layout
  const isDedicatedStudentRoute = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/examinations') ||
    pathname?.startsWith('/profile');

  const isStudentBooks = pathname?.startsWith('/books') && isAuthenticated && user?.role === 'STUDENT';

  if (isDedicatedStudentRoute || isStudentBooks) {
    return <div className="min-h-screen bg-[#f8fafc]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
