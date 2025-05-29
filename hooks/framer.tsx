import { useMotionValueEvent, useScroll, motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface FramerProps {
  children?: React.ReactNode;
  className?: string;
}

export const Framer: React.FC<FramerProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState<number>(0);
  const { scrollYProgress: Scroll } = useScroll({
    target: ref,
    offset: ['0.5 0.8', '0.5 1'],
  });

  useMotionValueEvent(Scroll, 'change', (latest: number) => {
    setClipPath(latest);
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        translateY: Scroll,
        clipPath: `inset(${clipPath * 12}%round 6px)`,
      }}
      initial={{ clipPath: `inset(0% round 6px)` }}
      animate={{ clipPath: `inset(${clipPath * 12}%round 6px)` }}
    >
      {children}
    </motion.div>
  );
};
