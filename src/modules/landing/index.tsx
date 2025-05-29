'use client';
import { useRef } from 'react';
import ParallaxHero from '@/components/landing/hero'; // Updated import
import { motion, useScroll, useTransform } from 'framer-motion';
import { ContactFAQSection } from '../../components/landing/faq-contact';

export const LandingPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start start', 'end end'],
  });
  // Adjust the input range [0.97, 1] to [0.7, 1] for a smoother start
  const scale = useTransform(scrollYProgress, [0.8, 1], [1, 0.83]);

  return (
    <>
      <div className="h-auto" ref={contentRef}>
        <motion.div className="h-auto" style={{ scale: scale }}>
          <ParallaxHero />
        </motion.div>
      </div>
      <div
        style={{
          marginTop: '-30vh',
        }}
        className="min-h-screen py-20 bg-background"
      >
        <ContactFAQSection />
      </div>
    </>
  );
};
