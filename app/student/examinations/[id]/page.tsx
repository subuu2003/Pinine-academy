'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function StudentExaminationDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/examinations/${id}`);
    } else {
      router.replace('/examinations');
    }
  }, [router, id]);

  return null;
}
