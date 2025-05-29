'use client';
import { Button } from '@skripsi/components';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
});

export const NotFoundContent = () => {
  return (
    <div className="flex dark:bg-dot-white/[2] bg-dot-black/[2] dark:bg-black  flex-col items-center justify-center min-h-[100vh] gap-6">
      <div className="w-full max-w-4xl mx-auto">
        <LottieAnimation />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};
