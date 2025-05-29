'use client';

import type React from 'react';
import {
  motion,
  type MotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';

interface FlipWordsProps {
  words: string;
  scrollYProgress: MotionValue<number>;
  End: number;
  Start: number;
  className?: string;
}

export const FlipWords: React.FC<FlipWordsProps> = ({
  words,
  scrollYProgress,
  End,
  Start,

  className,
}) => {
  const letters = words.split('');
  const totalLetters = letters.length;

  return (
    <motion.div className={className}>
      {letters.map((letter, index) => (
        <Letter
          End={End}
          Start={Start}
          key={index}
          letter={letter}
          scrollYProgress={scrollYProgress}
          index={index}
          totalLetters={totalLetters}
        />
      ))}
    </motion.div>
  );
};

interface LetterProps {
  letter: string;
  scrollYProgress: MotionValue<number>;
  index: number;
  Start: number;
  End: number;
  totalLetters: number;
}

const Letter: React.FC<LetterProps> = ({
  letter,
  scrollYProgress,
  index,
  End,
  Start,
  totalLetters,
}) => {
  const animationStart = Start;
  const animationEnd = End;
  const animationDuration = animationEnd - animationStart;
  const letterDuration = animationDuration / totalLetters;
  const start = animationStart + index * letterDuration;
  const end = Math.min(start + letterDuration, animationEnd);

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  const y = useTransform(scrollYProgress, [start, end], [20, 0]);
  const blurAmount = useTransform(scrollYProgress, [start, end], [8, 0]);

  const springConfig = { stiffness: 800, damping: 15, mass: 1 };
  const springOpacity = useSpring(opacity, springConfig);
  const springY = useSpring(y, springConfig);
  const springBlur = useSpring(blurAmount, springConfig);
  const skewY = useTransform(scrollYProgress, [start, end], [20, 0]);
  const springSkew = useSpring(skewY, springConfig);

  return (
    <motion.span
      style={{
        opacity: springOpacity,
        y: springY,
        skewX: springSkew,
        display: 'inline-block',
        filter: useTransform(springBlur, (value) => `blur(${value}px)`),
      }}
    >
      {letter === ' ' ? '\u00A0' : letter}
    </motion.span>
  );
};
