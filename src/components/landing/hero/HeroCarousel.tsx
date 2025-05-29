'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Model } from './ModelViewer'; // Updated import
import { useTranslations } from 'next-intl';

export const HeroCarousel = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslations('landingPage.Services');
  const slides = t.raw('slides');

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full h-full rounded-md flex flex-col">
      <div className="relative w-full h-full rounded-md">
        <AnimatePresence mode="wait">
          {slides.map(
            (
              slide: { title: string; model: string; desc: string },
              index: number,
            ) =>
              currentSlide === index && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 gap-2 md:gap-5 rounded-md bg-white p-1 md:p-5 flex flex-col items-start md:pr-[180px] justify-start`}
                >
                  <h3 className="text-gray-800 text-sm pr-20  top-5 left-5 md:text-2xl lg:text-3xl w-full font-extrabold z-10">
                    <span className="bg-gradient-to-r  from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      {slide.title.split(' ')[0]} {/* "MendobrakHambatan" */}
                    </span>
                    <span className="text-gray-800 ml-[2px] md:ml-1">
                      {slide.title.split(' ').slice(1).join(' ')}{' '}
                    </span>
                  </h3>
                  <p className="  text-gray-800 text-[8px] leading-normal top-16 pr-24 left-5 md:text-xs md:text-left lg:text-sm z-10">
                    {slide.desc}
                  </p>
                  <Canvas
                    gl={{ outputColorSpace: 'srgb' }}
                    camera={{ position: [0, 1, 6], fov: 50 }} // Changed Y position to 1
                    style={{
                      width: isMobile ? '200px' : '400px',
                      height: isMobile ? '200px' : '400px',
                      position: 'absolute',
                    }}
                    className=" -bottom-[60px] -right-[40px] md:-bottom-[130px] md:left-[320px] flex justify-end items-end"
                  >
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <Environment preset="sunset" />
                    <Model index={index} src={slide.model} />
                    <OrbitControls
                      enableZoom={false}
                      enablePan={false}
                      minPolarAngle={Math.PI / 2.5}
                      maxPolarAngle={Math.PI / 2.5}
                      target={[0, 1, 0]} // Changed Y position to 1 to match camera
                    />
                  </Canvas>
                </motion.div>
              ),
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute hidden md:block md:-left-20 md:top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm z-10 transition-all"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute hidden md:block md:-right-20 md:top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm z-10 transition-all"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Pagination Dots */}
        <div className="absolute -bottom-[40px] left-0 right-0 flex justify-center gap-2 md:hidden">
          {slides.map((_: unknown, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-purple-500 w-4' : 'bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
