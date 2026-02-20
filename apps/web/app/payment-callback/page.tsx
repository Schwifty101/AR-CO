'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'cancelled'>(
    'processing',
  );

  useEffect(() => {
    const source = searchParams.get('source') || 'payment';
    const cancelled = searchParams.get('cancelled');
    const tracker = searchParams.get('tracker');
    const reference = searchParams.get('reference');
    const signature = searchParams.get('sig');

    if (window.opener) {
      if (cancelled) {
        window.opener.postMessage(
          { type: `safepay-${source}-cancelled` },
          window.location.origin,
        );
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: updating state based on URL params after postMessage
        setStatus('cancelled');
      } else {
        window.opener.postMessage(
          {
            type: `safepay-${source}-success`,
            tracker,
            reference,
            signature,
          },
          window.location.origin,
        );
        setStatus('success');
      }

      // Close popup after short delay
      setTimeout(() => window.close(), 1500);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {status === 'processing' && (
          <p className="text-muted-foreground">Processing payment...</p>
        )}
        {status === 'success' && (
          <p className="text-green-600">Payment successful! This window will close.</p>
        )}
        {status === 'cancelled' && (
          <p className="text-muted-foreground">Payment cancelled. This window will close.</p>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
