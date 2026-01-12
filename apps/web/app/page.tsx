'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const fetchApiMessage = async () => {
      try {
        // Use relative URL - Next.js rewrites will proxy to backend
        const res = await fetch('/api/hello', {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching API:', error);
        setMessage('Failed to fetch from API');
      }
    };

    fetchApiMessage();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          Turborepo SaaS Monorepo
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Testing API proxy connection:
          </p>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-100 dark:bg-zinc-900">
            <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
              {message}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Frontend deployed on Vercel</p>
          <p>Backend deployed on Railway</p>
        </div>
      </main>
    </div>
  );
}
