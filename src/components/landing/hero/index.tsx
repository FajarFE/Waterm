'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useTransformLine } from '@skripsi/libs';
import { Tutorial } from '../../tutorial'; // Updated import
import { useMediaQuery } from 'react-responsive';
import data from '@/contans/techstack.json';
import AnimeLottie from '@skripsi/public/HeroSection.json';
import Fish from '@skripsi/public/akwkkwadk.json';
import WaterDroplet from '@skripsi/public/ohno.json';
import AnimatedGrid from '../feature-section'; // Updated import
import { HeroIntroduction } from './HeroIntroduction';
// import { HeroAnimatedDisplay } from './HeroAnimatedDisplay'; // Comment out direct import
import { TechStackDisplay } from '../techStackDisplay/TechStackDisplay';
import { HeroCallToAction } from './HeroCallToAction';
import { DetailDevices } from '@/components/landing/detailDevice';
import { HeroAnimatedDisplay } from './HeroAnimatedDisplay';

// Dynamically import HeroAnimatedDisplay with SSR turned off

// Removed direct imports for Canvas, OrbitControls, useGLTF, Environment, Box3, Vector3, Object3D as they are encapsulated
// Removed ModelViewer and HeroCarousel direct imports as they are used within HeroAnimatedDisplay or HeroCarousel

export default function ParallaxHero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start start', 'end start'],
  });
  const lottieData = {
    animationData: AnimeLottie,
    loop: true,
  };
  const shapesLottie1 = {
    animationData: Fish,
    loop: true,
  };

  const DropletLottie = {
    animationData: WaterDroplet,
    loop: true,
  };
  const [isTransformComplete, setIsTransformComplete] = useState(false);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const desktopY = useTransform<number, string | number>(
    scrollYProgress,
    [0, 0.1, 0.18],
    ['-30%', '160%', '280%'],
  );

  const mobileY = useTransform<number, string | number>(
    scrollYProgress,
    [0, 0.1, 0.18],
    ['0%', '220%', '268%'],
  );
  const tabletY = useTransform<number, string | number>(
    scrollYProgress,
    [0, 0.18],
    ['0%', '248%'],
  );

  const desktopX = useTransform<number, string | number>(
    scrollYProgress,
    [0, 0.17, 0.18],
    ['0%', '0%', '-70%'],
  );

  const mobileX = useMotionValue<string | number>('0%');

  const transform = {
    scale: useSpring(
      useTransform(scrollYProgress, [0, 0.18], [1, isDesktop ? 0.96 : 1.2]),
      {
        stiffness: 500,
        damping: 90,
      },
    ),
    y: isDesktop ? desktopY : isTablet ? tabletY : mobileY,
    x: isDesktop ? desktopX : isTablet ? mobileX : mobileX,
  };
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const { y1: line1_1, y2: line1_2 } = useTransformLine(
    [0, 0.6],
    [0, 200],
    [0, 0.1, 0.16, 0.23],
    [65, 200, 300, 900],
    scrollYProgress,
  );
  const { y1: line2_1, y2: line2_2 } = useTransformLine(
    [0, 0.1],
    [0, 100],
    [0, 0.1, 0.23],
    [65, 200, 600],
    scrollYProgress,
  );
  const { y1: line3_1, y2: line3_2 } = useTransformLine(
    [0, 0.6],
    [0, 120],
    [0, 0.1, 0.16, 0.18],
    [65, 160, 200, 600],
    scrollYProgress,
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      if (value >= 0.18) {
        setIsTransformComplete(true);
      } else {
        setIsTransformComplete(false);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const TechStack = data;
  return (
    <motion.section
      ref={contentRef}
      className="bg-slate-200 overflow-hidden mb-5 lg:-mt-[100px] rounded-b-2xl h-auto dark:bg-dot-white/[2] bg-dot-black/[2] dark:bg-black w-max-[cal(1920px)]"
    >
      <div className="min-w-7xl mb-0 lg:mt-0 md:mt-20 md:mb-10 h-auto   w-max-[cal(1920px)] sm:max-h-[500px] lg:max-h-[calc(1080px*2)] mx-auto flex-col container flex justify-center items-center lg:-mb-[200px]">
        <div
          id="about"
          className="lg:grid flex  flex-col lg:mb-20 gap-12 lg:gap-2 h-auto lg:grid-cols-12 max-h-[670px] lg:max-h-[1080px] w-full pt-20 pb-5 lg:pt-0 lg:pb  lg:h-screen md:h-screen justify-center items-center"
        >
          <HeroIntroduction opacity={opacity} />
          <HeroAnimatedDisplay
            transformStyle={transform}
            isTransformComplete={isTransformComplete}
            isTablet={isTablet}
            mainLottieData={lottieData}
            dropletLottieData={DropletLottie}
            shapesLottieData={shapesLottie1}
            line1_1={line1_1}
            line1_2={line1_2}
            line2_1={line2_1}
            line2_2={line2_2}
            line3_1={line3_1}
            line3_2={line3_2}
          />
        </div>
      </div>
      <TechStackDisplay techStackData={TechStack} />
      <HeroCallToAction scrollYProgress={scrollYProgress} />
      <AnimatedGrid scrollYProgress={scrollYProgress} />
      <DetailDevices />
      <Tutorial scrollYProgress={scrollYProgress} />
    </motion.section>
  );
}
