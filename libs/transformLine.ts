'use client';
import { MotionValue, useSpring, useTransform } from 'framer-motion';

export const useTransformLine = (
  rangeTransformations1: number[],
  transformaations1: number[],
  rangeTransformations2: number[],
  transformaations2: number[],
  scrollYProgress: MotionValue<number>,
) => {
  const y1 = useSpring(
    useTransform(scrollYProgress, rangeTransformations1, transformaations1),
    {
      stiffness: 500,
      damping: 90,
    },
  );

  const y2 = useSpring(
    useTransform(scrollYProgress, rangeTransformations2, transformaations2),
    {
      stiffness: 500,
      damping: 90,
    },
  );

  return { y1, y2 };
};
