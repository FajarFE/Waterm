'use client';
import { useLottie } from 'lottie-react';
import notFoundAnimation from '@skripsi/public/404.json';

const LottieAnimation = () => {
  const options = {
    animationData: notFoundAnimation,
    loop: true,
  };

  const { View } = useLottie(options);
  return View;
};

export default LottieAnimation;
