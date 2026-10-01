'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => queryClientInstance);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

