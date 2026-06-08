'use client';

/**
 * New Complaint redirect
 *
 * Complaint filing now runs through the public, guest-capable flow at
 * `/complaint-section/form`, which includes the mandatory PKR 1,000 payment
 * step. This route simply forwards there so all complaints follow one path.
 *
 * @module NewComplaintRedirect
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirects to the public complaint form */
export default function NewComplaintRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/complaint-section/form');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-muted-foreground">
        Redirecting to the complaint form…
      </div>
    </div>
  );
}
