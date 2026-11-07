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
  
  // Student Portal routes that manage their own sidebar layout internally
  const isSidebarRoute = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/profile');

  if (isSidebarRoute) {
    return (
      <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
        <Navbar />
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
