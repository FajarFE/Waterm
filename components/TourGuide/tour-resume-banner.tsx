'use client';

import { useTour } from '@skripsi/hooks/tour-guide';
import { motion } from 'framer-motion';
import { X, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui';

export function TourResumeBanner() {
  const {
    isPaused,
    resumeTour,
    endTour,
    currentStep,
    currentStepIndex,
    totalSteps,
  } = useTour();
  const [isVisible, setIsVisible] = useState(true);

  if (!isPaused || !isVisible || !currentStep) return null;

  const handleResume = () => {
    resumeTour();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleEnd = () => {
    endTour();
    setIsVisible(false);
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 shadow-lg"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 hidden sm:block">
            <div className="bg-white/20 rounded-full h-10 w-10 flex items-center justify-center">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="font-medium">Tour paused</h3>
            <p className="text-sm text-blue-100">
              Resume your tour ({currentStepIndex + 1}/{totalSteps}):{' '}
              {currentStep.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleResume}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Resume Tour
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEnd}
            className="text-white hover:bg-blue-700"
          >
            End Tour
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
