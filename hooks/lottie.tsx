'use client';
import dynamic from 'next/dynamic';

// Define props interface
interface LottieProps {
  animationData: any;
  loop: boolean;
}

// Create base component that will be loaded client-side only
const BaseLottie = ({ animationData, loop }: LottieProps) => {
  // We can safely import and use lottie-react here since this component
  // will only be loaded on the client
  const { useLottie } = require('lottie-react');

  const options = {
    animationData,
    loop,
  };

  const { View } = useLottie(options);
  return View;
};

// Export a dynamically loaded version that is never server-side rendered
export const Lottie = dynamic(() => Promise.resolve(BaseLottie), {
  ssr: false,
  loading: () => null,
});
