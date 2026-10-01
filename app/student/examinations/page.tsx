'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentExaminationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/examinations');
  }, [router]);

  return null;
}
