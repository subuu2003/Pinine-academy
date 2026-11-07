'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] antialiased overflow-hidden">
      <Navbar />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
