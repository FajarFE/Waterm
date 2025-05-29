'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ImageIcon, Loader2 } from 'lucide-react';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@skripsi/hooks/tour-guide';
import { cn } from '@skripsi/libs';
import { Button } from '../ui';
import Image from 'next/image';

type TourGuideProps = {
  className?: string;
};

const themeStyles = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    muted: 'text-gray-500',
    accent: 'bg-blue-500 text-white hover:bg-blue-600',
    accentMuted: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    progress: 'bg-blue-500',
    progressBg: 'bg-gray-200',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    muted: 'text-gray-400',
    accent: 'bg-blue-600 text-white hover:bg-blue-700',
    accentMuted: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
    progress: 'bg-blue-500',
    progressBg: 'bg-gray-700',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    muted: 'text-blue-600',
    accent: 'bg-blue-600 text-white hover:bg-blue-700',
    accentMuted: 'bg-blue-200 text-blue-800 hover:bg-blue-300',
    progress: 'bg-blue-600',
    progressBg: 'bg-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    border: 'border-green-200',
    muted: 'text-green-600',
    accent: 'bg-green-600 text-white hover:bg-green-700',
    accentMuted: 'bg-green-200 text-green-800 hover:bg-green-300',
    progress: 'bg-green-600',
    progressBg: 'bg-green-200',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    muted: 'text-purple-600',
    accent: 'bg-purple-600 text-white hover:bg-purple-700',
    accentMuted: 'bg-purple-200 text-purple-800 hover:bg-purple-300',
    progress: 'bg-purple-600',
    progressBg: 'bg-purple-200',
  },
  system: {
    bg: 'bg-background',
    text: 'text-foreground',
    border: 'border-border',
    muted: 'text-muted-foreground',
    accent: 'bg-primary text-primary-foreground hover:bg-primary/90',
    accentMuted: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    progress: 'bg-primary',
    progressBg: 'bg-muted',
  },
};

export function TourGuide({ className }: TourGuideProps) {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    endTour,
    theme,
    isNavigating,
  } = useTour();

  const [tooltipStyle, setTooltipStyle] = useState({});
  const [spotlightStyle, setSpotlightStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    borderRadius?: string;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isPositioning, setIsPositioning] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const styles = themeStyles[theme];

  const handleNext = () => {
    setIsExiting(true);
    setTimeout(() => {
      nextStep();
      setIsExiting(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsExiting(true);
    setTimeout(() => {
      prevStep();
      setIsExiting(false);
    }, 300);
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      endTour();
      setIsExiting(false);
    }, 300);
  };

  // Replace the positionTooltip function with this useCallback version
  const positionTooltip = useCallback(() => {
    if (!currentStep || !tooltipRef.current) return;

    setIsPositioning(true);

    // For popover content, we need to wait a bit for the popover to fully open
    const positioningDelay =
      currentStep.action?.type === 'openPopover' ? 500 : 100;

    setTimeout(() => {
      const currentTarget = document.querySelector(currentStep.target);
      if (!currentTarget || !tooltipRef.current) {
        setIsPositioning(false);
        return;
      }

      // If this is a popover step, look for an open popover content element
      let element = currentTarget;
      if (currentStep.action?.type === 'openPopover') {
        // Try to find the popover content that's currently open
        const popoverContent = document.querySelector(
          '[data-state="open"][role="dialog"]',
        );
        if (popoverContent) {
          // If we're targeting a specific element inside the popover
          if (
            currentStep.target.includes('#edit-whatapps') ||
            currentStep.target.includes('#edit-telegram')
          ) {
            // Find the specific element inside the popover
            const specificElement = popoverContent.querySelector(
              currentStep.target,
            );
            if (specificElement) {
              element = specificElement;
            }
          } else {
            element = popoverContent;
          }
        }
      } else if (
        currentStep.target.includes('#edit-whatapps') ||
        currentStep.target.includes('#edit-telegram')
      ) {
        // For steps targeting elements inside an already open popover
        const popoverContent = document.querySelector(
          '[data-state="open"][role="dialog"]',
        );
        if (popoverContent) {
          const specificElement = document.querySelector(currentStep.target);
          if (specificElement) {
            element = specificElement;
          }
        }
      }

      setTargetElement(element);

      const targetRect = element.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const position = currentStep.position || 'bottom';

      // Window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Set spotlight style with padding
      const padding = currentStep.spotlightPadding ?? 8;
      const spotlightTop = targetRect.top - padding;
      const spotlightLeft = targetRect.left - padding;
      const spotlightWidth = targetRect.width + padding * 2;
      const spotlightHeight = targetRect.height + padding * 2;

      setSpotlightStyle({
        top: spotlightTop + scrollY,
        left: spotlightLeft,
        width: spotlightWidth,
        height: spotlightHeight,
        borderRadius: '4px',
      });

      // Position the tooltip
      let top, left;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + 16;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - 16;
          break;
        case 'bottom':
        default:
          top = targetRect.bottom + 16;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 16) left = 16;
      if (left + tooltipRect.width > windowWidth - 16) {
        left = windowWidth - tooltipRect.width - 16;
      }
      if (top < 16) top = 16;
      if (top + tooltipRect.height > windowHeight - 16) {
        top = windowHeight - tooltipRect.height - 16;
      }

      // Add window scroll position for absolute positioning
      top += scrollY;

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
      });

      setIsPositioning(false);
    }, positioningDelay);
  }, [currentStep]);

  // Update the useEffect dependency array to remove the reference to positionTooltip
  useEffect(() => {
    if (!isTourActive || !currentStep) return;

    // If the current step is for a different route, don't show the tooltip
    if (currentStep.route && currentStep.route !== pathname) return;

    // Reset image state when step changes
    setShowImage(false);

    // Position the tooltip
    positionTooltip();

    // Add window resize and scroll listeners
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);

    // Add mutation observer to detect DOM changes (like popover opening)
    const observer = new MutationObserver(() => {
      // Only reposition if we're not already in the middle of positioning
      if (!isPositioning) {
        positionTooltip();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'style', 'class'],
    });

    // Set up an intersection observer to detect when the target element changes visibility
    if (targetElement) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          positionTooltip();
        }
      });

      intersectionObserver.observe(targetElement);

      return () => {
        window.removeEventListener('resize', positionTooltip);
        window.removeEventListener('scroll', positionTooltip);
        observer.disconnect();
        intersectionObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
      observer.disconnect();
    };
  }, [
    currentStep,
    isTourActive,
    pathname,
    isPositioning,
    positionTooltip,
    targetElement,
  ]);

  // If navigating between routes, show a loading state
  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div
          className={cn(
            'rounded-xl shadow-xl border p-6 flex flex-col items-center',
            styles.bg,
            styles.text,
            styles.border,
          )}
        >
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Navigating to next step...
          </h3>
          <p className={cn('text-sm', styles.muted)}>
            Please wait while we load the next page
          </p>
        </div>
      </div>
    );
  }

  if (!isTourActive || !currentStep) return null;

  // If the current step is for a different route, don't show the tooltip
  if (currentStep.route && currentStep.route !== pathname) return null;

  // Determine if we should use spotlight (default to true if not specified)
  const useSpotlight = currentStep.spotlight !== false;

  return (
    <AnimatePresence>
      {!isExiting && (
        <>
          {/* SVG Mask Overlay */}
          <div
            className="fixed inset-0 z-[1000] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {useSpotlight && (
                    <rect
                      x={spotlightStyle.left}
                      y={spotlightStyle.top}
                      width={spotlightStyle.width}
                      height={spotlightStyle.height}
                      rx="4"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.6)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          </div>

          {/* Spotlight border */}
          {useSpotlight && (
            <motion.div
              className="fixed z-[1001] border-2 border-white/50 rounded-md pointer-events-none"
              style={spotlightStyle}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className={cn(
              'fixed z-[1002] w-80 rounded-xl shadow-xl border transition-all duration-200',
              styles.bg,
              styles.text,
              styles.border,
              className,
            )}
            style={tooltipStyle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-2 top-2 rounded-full h-8 w-8',
                styles.muted,
              )}
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>

            {/* Content */}
            <div className="p-5">
              {/* Progress bar */}
              <div className={cn('h-1 rounded-full mb-4', styles.progressBg)}>
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    styles.progress,
                  )}
                  style={{
                    width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>

              {/* Title and content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {currentStep.title}
                </h3>
                <p className={cn('text-sm', styles.muted)}>
                  {currentStep.content}
                </p>
              </div>

              {/* Image (if provided) */}
              {currentStep.image && (
                <div className="mb-4">
                  {showImage ? (
                    <Image
                      src={currentStep.image || '/placeholder.svg'}
                      alt={currentStep.title}
                      className="w-full h-auto rounded-lg object-cover max-h-40"
                      onError={() => setShowImage(false)}
                      width={320}
                      height={160}
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-full h-32 rounded-lg flex items-center justify-center cursor-pointer',
                        styles.accentMuted,
                      )}
                      onClick={() => setShowImage(true)}
                    >
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-70" />
                        <span className="text-sm">Click to view image</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className={cn('text-sm', styles.muted)}>
                  {currentStepIndex + 1} of {totalSteps}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className={cn(
                      'rounded-full px-4',
                      currentStepIndex === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : styles.accentMuted,
                    )}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className={cn('rounded-full px-4', styles.accent)}
                  >
                    {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                    {currentStepIndex !== totalSteps - 1 && (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Keyboard shortcuts */}
            <div
              className={cn(
                'px-5 py-3 text-xs border-t flex justify-between',
                styles.border,
                styles.muted,
              )}
            >
              <div>ESC to exit</div>
              <div>← → arrows to navigate</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
