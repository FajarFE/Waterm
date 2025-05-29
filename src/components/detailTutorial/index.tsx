'use client';

import { Book } from 'lucide-react';

import { TipBox } from './tip-box';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { StepTutorial } from '@skripsi/components/progress';
import { scroller } from 'react-scroll';
import { motion } from 'framer-motion';
import { SubStep } from './sub-step';
import { TutorialCard } from '../tutorial/TutorialCard';
import Image from 'next/image';

// Define interfaces and types for your data

export interface GlossaryItem {
  title: string;
  description: string;
}

export interface SubStepType {
  title: string;
  description: string;
  image?: string;
}

export interface Step {
  title: string;
  description: string;
  image?: string;
  sub_step?: SubStepType[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  step: Step[];
  button: string;
  glosarium?: GlossaryItem[];
}

export interface TutorialData {
  title: string;
  description: string;
  tutorial: Tutorial[];
}

export default function TutorialPage() {
  const params = useParams();
  const tutorialId = params?.id as string;
  const contentRef = useRef<HTMLDivElement>(null);

  const t = useTranslations();
  const tutorialData = t.raw('tutorial') as unknown as TutorialData; // Type assertion here
  const headerRef = useRef<HTMLDivElement>(null);

  // State untuk menyimpan sub-step yang aktif untuk setiap step
  interface ActiveSubStepsState {
    [key: string | number]: {
      [key: string | number]: boolean;
    };
  }
  const [activeSubSteps, setActiveSubSteps] = useState<ActiveSubStepsState>({});

  // State untuk menampilkan glosarium
  const [showGlossary, setShowGlossary] = useState(false);

  // Add this with the other state declarations
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Track scroll progress of the content
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start start', 'end start'],
  });

  // Find the current tutorial
  const currentTutorial =
    tutorialData.tutorial.find((t) => t.id === tutorialId) ||
    tutorialData.tutorial[0];

  // Get other tutorials for recommendations
  const otherTutorials = tutorialData.tutorial.filter(
    (t) => t.id !== tutorialId,
  );

  // Function to toggle sub-step visibility
  const toggleSubStep = (
    stepIndex: string | number,
    subStepIndex: string | number,
  ) => {
    setActiveSubSteps((prev) => {
      const currentStepSubSteps = prev[stepIndex] || {};
      return {
        ...prev,
        [stepIndex]: {
          ...currentStepSubSteps,
          [subStepIndex]: !currentStepSubSteps[subStepIndex],
        },
      };
    });
  };

  // Function to scroll to a specific step
  const scrollToStep = (index: number) => {
    scroller.scrollTo(`step-${index + 1}`, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -90, // Offset to account for any fixed headers
    });
  };

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const headerTranslateY = useTransform(
    smoothScrollProgress,
    [0, 0.1],
    [0, mobileNavOpen ? 0 : -10],
  );

  useEffect(() => {
    // Function to prevent scroll
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Function to prevent wheel events
    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    // Function to prevent touchmove events
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (mobileNavOpen) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Add CSS to hide scrollbar but maintain layout
      document.documentElement.style.setProperty(
        '--scrollbar-width',
        `${scrollbarWidth}px`,
      );

      // Add a class to the body to hide scrollbar
      document.body.classList.add('hide-scrollbar');

      // Add padding to compensate for scrollbar disappearance (prevents layout shift)
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Add event listeners to prevent scrolling
      document.addEventListener('wheel', preventWheel, { passive: false });
      document.addEventListener('touchmove', preventTouchMove, {
        passive: false,
      });

      // Prevent space bar, Page Up, Page Down, Home, End keys
      document.addEventListener(
        'keydown',
        (e) => {
          const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
          if (keys.includes(e.keyCode)) {
            e.preventDefault();
            return false;
          }
        },
        { passive: false },
      );
    } else {
      // Remove the class that hides scrollbar
      document.body.classList.remove('hide-scrollbar');
      // Remove padding
      document.body.style.paddingRight = '';
    }

    return () => {
      // Clean up by removing all event listeners and styles
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('keydown', preventDefault);
      document.body.classList.remove('hide-scrollbar');
      document.body.style.paddingRight = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="max-w-7xl  mx-auto container mb-20">
      <div className="flex  rounded-lg pb-5 mb-10 lg:border-b-2 w-full  lg:border-x-2 lg:border-slate-700 lg:dark:border-white flex-col min-h-screen">
        <motion.header
          ref={headerRef}
          style={{
            y: headerTranslateY,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
          className="bg-white dark:bg-black border-b pt-20 p-4 shadow-sm"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start md:flex-row flex-col-reverse justify-between">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-black dark:text-white ">
                  Sistem Monitoring Kualitas Air
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Tutorial: {currentTutorial.title}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-row-reverse">
                <button
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="md:hidden flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  aria-label={
                    mobileNavOpen ? 'Tutup navigasi' : 'Buka navigasi'
                  }
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-navigation"
                >
                  <span className="sr-only">
                    {mobileNavOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                  </span>
                  {mobileNavOpen ? (
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
                <Link
                  href="/tutorial"
                  className="px-4 py-2 text-sm bg-blue-50 text-black rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Kembali ke Daftar Tutorial
                </Link>
              </div>
            </div>
          </div>
        </motion.header>
        {/* Replace the grid div with this */}
        <div className="grid grid-cols-1 px-2 md:grid-cols-12 w-full gap-5">
          {/* Replace the sidebar div with this */}
          {/* Also modify the mobile navigation container to ensure it's properly positioned and sized */}
          {/* Replace the div with className that starts with ${mobileNavOpen ? "fixed inset-0 z-20 pt-20... */}
          <div
            className={`${
              mobileNavOpen
                ? 'fixed inset-0 z-20 bg-white/95 top-[185px] lg:top-0 overflow-y-auto'
                : 'hidden'
            }  md:col-span-4 col-span-full md:h-screen md:top-0 md:sticky md:pl-4 md:block `}
          >
            {/* Add this at the beginning of the sidebar's inner div */}
            <div className="h-full bg-white rounded-b-lg shadow-lg flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-700">
                  Navigasi Tutorial
                </h2>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close navigation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-4 flex-grow">
                <div className="flex w-full pb-14 top-5 md:top-10 relative justify-center items-center">
                  {currentTutorial.glosarium &&
                    currentTutorial.glosarium.length > 0 && (
                      <button
                        onClick={() => setShowGlossary(!showGlossary)}
                        className="flex absolute items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Book size={18} />
                        <span>
                          {showGlossary ? 'Tutup Glosarium' : 'Lihat Glosarium'}
                        </span>
                      </button>
                    )}
                </div>
                {/* The 'transform' class enables scaling. 
                    'scale-[0.60]' sets the default scale.
                    'md:scale-100' sets the scale to 100% on medium screens and wider. 
                    This combination makes the scale responsive. */}
                <div className="scale-[0.65] md:scale-[0.85] absolute  w-full -top-[10px] md:top-[176px]">
                  <StepTutorial
                    scrollYProgress={scrollYProgress}
                    scrollProgress={smoothScrollProgress}
                    step={currentTutorial}
                    setMobileNavOpen={setMobileNavOpen} // Ensure this prop is passed if StepTutorial uses it
                  ></StepTutorial>
                </div>
              </div>
            </div>
            {/* Glossary Button */}
          </div>
          {/* Scrollable content - dynamically generated based on tutorial */}
          {/* Replace the content column div with this */}
          <div className="col-span-full md:col-span-8">
            <div className="max-w-3xl mx-auto ">
              {/* Tutorial Header */}
              <div className="bg-white p-8 rounded-b-lg shadow-md mt-[184px] md:mt-[157px] mb-10">
                <h2 className="text-xl lg:text-base dark:text-black font-bold mb-4">
                  {currentTutorial.title}
                </h2>
                <p className="text-sm lg:text-base text-gray-600 mb-6">
                  {currentTutorial.description}
                </p>
                {/* Mobile Glossary Toggle Button */}

                {/* Glosarium Content */}
                {showGlossary &&
                  currentTutorial.glosarium &&
                  currentTutorial.glosarium.length > 0 && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-blue-800">
                        Glosarium
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentTutorial.glosarium.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <h4 className="font-medium text-base text-blue-700">
                              {item.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Tutorial Steps */}
              <div ref={contentRef} className="space-y-12 text-black">
                {currentTutorial.step.map((step, stepIndex) => (
                  <section
                    key={stepIndex}
                    id={`step-${stepIndex + 1}`}
                    className="bg-white p-4 rounded-xl shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold text-base">
                          {stepIndex + 1}
                        </div>
                        <h2 className="text-xl font-bold">{step.title}</h2>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p
                        className="text-sm md:text-base text-gray-600 subpixel-antialiased font-optional"
                        style={
                          {
                            textRendering: 'optimizeLegibility',
                            contentVisibility: 'auto',
                          } as React.CSSProperties
                        }
                        data-lcp="true"
                        data-priority="high"
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Add a tip box for some steps - this is mock data, you can customize */}
                    {stepIndex === 1 && (
                      <TipBox type="warning">
                        Pastikan Anda memiliki akses ke email yang terdaftar
                        untuk menerima kode OTP.
                      </TipBox>
                    )}

                    {stepIndex === 2 && (
                      <TipBox type="warning">
                        Jangan mengatur nilai limit terlalu ketat karena dapat
                        menyebabkan notifikasi berlebihan.
                      </TipBox>
                    )}

                    {stepIndex === 3 && (
                      <TipBox type="note">
                        Penamaan perangkat yang jelas akan memudahkan
                        identifikasi di dashboard.
                      </TipBox>
                    )}

                    {step.image && step.image !== '/' && (
                      <div className="my-6 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          width={100}
                          height={100}
                          src={step.image || '/placeholder.svg'}
                          alt={step.title}
                          className="w-full object-cover h-auto max-h-[450px]"
                        />
                      </div>
                    )}

                    {step.sub_step && step.sub_step.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14"></path>
                            <path d="M18 13l-6 6"></path>
                            <path d="M6 13l6 6"></path>
                          </svg>
                          Sub-langkah:
                        </h3>
                        {step.sub_step.map((subStep, subStepIndex) => (
                          <div
                            key={subStepIndex}
                            id={`substep-${stepIndex + 1}-${subStepIndex + 1}`}
                          >
                            <SubStep
                              subStep={subStep}
                              isOpen={
                                activeSubSteps[stepIndex]?.[subStepIndex] ||
                                false
                              }
                              onClick={() =>
                                toggleSubStep(stepIndex, subStepIndex)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step navigation */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between mt-8 pt-4 border-t border-gray-100">
                      {stepIndex !== 0 && (
                        <button
                          onClick={() =>
                            scrollToStep(Math.max(0, stepIndex - 1))
                          }
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m15 18-6-6 6-6"></path>
                          </svg>
                          Langkah Sebelumnya
                        </button>
                      )}
                      {stepIndex !== currentTutorial.step.length - 1 && (
                        <button
                          onClick={() => scrollToStep(stepIndex + 1)}
                          className={`flex text-blue-600 hover:bg-blue-50 items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm`}
                        >
                          Langkah Selanjutnya
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </section>
                ))}
              </div>

              {/* Tutorial Recommendations */}
            </div>
          </div>
        </div>
      </div>

      {otherTutorials.length > 0 && (
        <div className="mt-16  p-8 rounded-xl shadow-md">
          <h2 className="text-xl lg:text-3xl font-bold mb-6">
            Tutorial Lainnya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTutorials.slice(0, 3).map((tutorial, index) => (
              <div key={index}>
                <TutorialCard
                  classname=""
                  styleTitle="text-base sm:text-base text-black line-clamp-2"
                  styleDescript="text-sm line-clamp-2"
                  step={{
                    title: tutorial.title,
                    description: tutorial.description,
                    button: tutorial.button,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
