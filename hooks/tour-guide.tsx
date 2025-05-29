'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useRef,
  useCallback,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type TourTheme =
  | 'light'
  | 'dark'
  | 'blue'
  | 'green'
  | 'purple'
  | 'system';

export type TourStepAction = {
  type: 'openPopover' | 'click' | 'focus' | 'hover' | 'custom';
  // For custom actions, provide a function to execute
  handler?: () => void;
};

export type TourStep = {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  route?: string; // The route this step belongs to
  params?: string;
  action?: TourStepAction; // Action to perform when this step is shown
  delay?: number; // Delay in ms before showing the tooltip (useful for animations)
  image?: string; // Optional image URL to show in the tour step
  spotlight?: boolean; // Whether to use spotlight effect (default: true)
  spotlightPadding?: number; // Padding around the spotlight (default: 8)
  closePopoverOnNext?: boolean; // Whether to close popovers when moving to the next step (default: true)
  parentPopover?: string;
};

type TourContextType = {
  isTourActive: boolean;
  currentStepIndex: number;
  startTour: (routeSteps?: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStep: TourStep | null;
  totalSteps: number;
  allSteps: TourStep[];
  executeStepAction: (step: TourStep) => void;
  theme: TourTheme;
  setTheme: (theme: TourTheme) => void;
  isPaused: boolean;
  resumeTour: () => void;
  pauseTour: () => void;
  isNavigating: boolean;
  closeAllPopovers: () => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

type TourProviderProps = {
  children: ReactNode;
  initialSteps?: TourStep[];
  storageKey?: string;
  initialTheme?: TourTheme;
};

export function TourProvider({
  children,
  initialSteps = [],
  storageKey = 'app-tour-state',
  initialTheme = 'system',
}: TourProviderProps) {
  const [allSteps, setAllSteps] = useState<TourStep[]>(initialSteps);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [theme, setTheme] = useState<TourTheme>(initialTheme);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPositioning, setIsPositioning] = useState(false);
  const [showImage, setShowImage] = useState(false);

  // Add refs to track timers so we can clear them properly
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Mengonversi searchParams menjadi string query
  const queryString = searchParams?.toString() ?? '';

  // Load tour state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const {
          active,
          paused,
          stepIndex,
          steps,
          theme: savedTheme,
        } = JSON.parse(savedState);

        if (active || paused) {
          setIsTourActive(active);
          setIsPaused(paused);
          setCurrentStepIndex(stepIndex);
          if (steps && steps.length > 0) {
            setAllSteps(steps);
          }
          if (savedTheme) {
            setTheme(savedTheme);
          }
        }
      } catch (error) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  // Save tour state to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        active: isTourActive,
        paused: isPaused,
        stepIndex: currentStepIndex,
        steps: allSteps,
        theme,
      }),
    );
  }, [isTourActive, isPaused, currentStepIndex, allSteps, theme, storageKey]);

  // Handle route changes
  useEffect(() => {
    if (!isTourActive && !isPaused) return;

    const currentStep = allSteps[currentStepIndex];

    // If the current step has a route and it's different from the current route,
    // navigate to that route
    if (currentStep?.route && currentStep.route !== pathname) {
      setIsNavigating(true);
      closeAllPopovers();

      // Combine route and params if they exist
      const targetRoute = currentStep.params
        ? `${currentStep.route}?${currentStep.params}`
        : currentStep.route;

      router.push(targetRoute);

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      navigationTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
        navigationTimerRef.current = null;
      }, 1000);
    } else if (currentStep?.params && !isNavigating) {
      // Only update params if they are different from current params
      // and we're not already navigating
      if (currentStep.params !== queryString) {
        router.replace(`${pathname}?${currentStep.params}`);
      }
    } else {
      setIsNavigating(false);
    }

    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
    };
  }, [currentStepIndex, isTourActive, isPaused, allSteps, pathname, router]);

  // Modify the auto-resume effect to prevent unnecessary param changes
  useEffect(() => {
    if (!isPaused) return;

    const currentStep = allSteps[currentStepIndex];

    if (currentStep?.route === pathname) {
      // Only update params if they're different and specified
      if (
        currentStep.params &&
        currentStep.params !== queryString &&
        !isNavigating
      ) {
        router.replace(`${pathname}?${currentStep.params}`);
      }

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = setTimeout(() => {
        resumeTour();
        resumeTimerRef.current = null;
      }, 500);
    }

    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, [
    pathname,
    isPaused,
    allSteps,
    currentStepIndex,
    queryString,
    router,
    isNavigating,
  ]);

  // Execute step action when the step changes
  useEffect(() => {
    // Clear any existing action timer when dependencies change
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }

    if (!isTourActive || isNavigating) return;

    const currentStep = allSteps[currentStepIndex];
    if (currentStep && currentStep.route === pathname) {
      if (currentStep.params && currentStep.params !== queryString) {
        router.replace(`${pathname}?${currentStep.params}`);
      }

      // If there's a delay specified, wait before executing the action
      if (currentStep.delay) {
        const timer = setTimeout(() => {
          executeStepAction(currentStep);
        }, currentStep.delay);
        return () => clearTimeout(timer);
      } else {
        executeStepAction(currentStep);
      }
    }

    // Cleanup function to clear timers
    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, [
    currentStepIndex,
    isTourActive,
    pathname,
    allSteps,
    isNavigating,
    queryString,
    router,
  ]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          endTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTourActive, currentStepIndex]);

  // Function to close all open popovers
  const closeAllPopovers = () => {
    // Click on the body to close any open popovers
    document.body.click();

    // Additionally, try to find and close any popovers that might still be open
    const openPopovers = document.querySelectorAll(
      '[data-state="open"][role="dialog"]',
    );
    openPopovers.forEach((popover) => {
      // Try to find the close button and click it
      const closeButton = popover.querySelector('button[aria-label="Close"]');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }
    });

    // Also try to find any open popover triggers and click them to close
    const openPopoverTriggers = document.querySelectorAll(
      '[aria-expanded="true"][aria-haspopup="dialog"]',
    );
    openPopoverTriggers.forEach((trigger) => {
      (trigger as HTMLButtonElement).click();
    });

    // Add a small delay and try one more time to ensure everything is closed
    setTimeout(() => {
      document.body.click();
    }, 100);
  };
  // Execute the action for a step
  // Check if a popover needs to be opened first
  const ensureParentPopoverOpen = (step: TourStep) => {
    if (step.parentPopover) {
      const parentTrigger = document.querySelector(
        step.parentPopover,
      ) as HTMLElement;
      if (parentTrigger) {
        // Check if the popover is already open
        const isExpanded =
          parentTrigger.getAttribute('aria-expanded') === 'true';
        if (!isExpanded) {
          // Open the parent popover
          parentTrigger.click();
          return true;
        }
      }
    }
    return false;
  };
  // Execute the action for a step
  const executeStepAction = (step: TourStep) => {
    // First check if we need to open a parent popover
    const needsDelay = ensureParentPopoverOpen(step);

    // If we opened a parent popover, wait a bit before executing the action
    const executeAction = () => {
      if (!step.action) return;

      const targetElement = document.querySelector(step.target) as HTMLElement;
      if (!targetElement) return;

      switch (step.action.type) {
        case 'openPopover':
          // Close any previously open popovers first
          closeAllPopovers();

          // Then click the target element to open the popover
          setTimeout(() => {
            targetElement.click();
          }, 100);
          break;
        case 'click':
          targetElement.click();
          break;
        case 'focus':
          targetElement.focus();
          break;
        case 'hover':
          // Trigger mouseenter event
          targetElement.dispatchEvent(
            new MouseEvent('mouseenter', { bubbles: true }),
          );
          break;
        case 'custom':
          if (step.action.handler) {
            step.action.handler();
          }
          break;
      }
    };

    if (needsDelay) {
      setTimeout(executeAction, 300);
    } else {
      executeAction();
    }
  };

  // Get the current step
  const currentStep =
    (isTourActive || isPaused) && allSteps.length > 0
      ? allSteps[currentStepIndex]
      : null;

  // Add this near the top of the TourProvider component
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

      // Rest of your positioning logic...
      // ...

      setIsPositioning(false);
    }, positioningDelay);
  }, [currentStep, isPositioning]);

  // Replace the useEffect that handles positioning
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
    const targetElement = document.querySelector(currentStep.target);
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
  }, [currentStep, isTourActive, pathname, positionTooltip]);

  // Start the tour
  const startTour = (routeSteps?: TourStep[]) => {
    // Clear any existing timers
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }

    if (routeSteps) {
      setAllSteps(routeSteps);
    }
    setCurrentStepIndex(0);
    setIsTourActive(true);
    setIsPaused(false);
  };

  // End the tour
  const endTour = () => {
    // Clear any existing timers
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
    if (stepChangeTimerRef.current) {
      clearTimeout(stepChangeTimerRef.current);
      stepChangeTimerRef.current = null;
    }

    setIsTourActive(false);
    setIsPaused(false);
    setCurrentStepIndex(0); // Reset to first step for next time
    localStorage.removeItem(storageKey);

    // Close any open popovers or modals
    closeAllPopovers();
  };

  // Pause the tour (when navigating away or user manually pauses)
  const pauseTour = () => {
    // Clear any existing timers
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }

    setIsTourActive(false);
    setIsPaused(true);

    // Close any open popovers when pausing
    closeAllPopovers();
  };

  // Resume a paused tour
  const resumeTour = () => {
    setIsTourActive(true);
    setIsPaused(false);
  };

  const scrollToElement = (selector: string) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Go to the next step
  const nextStep = () => {
    // Clear any existing action timer
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }

    if (currentStepIndex < allSteps.length - 1) {
      // Close any open popovers before moving to the next step
      // Only close if the current step doesn't explicitly set closePopoverOnNext to false
      if (currentStep?.closePopoverOnNext !== false) {
        closeAllPopovers();
      }
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      // Get the next step's target and scroll to it
      const nextStep = allSteps[nextStepIndex];
      if (nextStep?.target) {
        scrollToElement(nextStep.target);
      }
    } else {
      endTour();
    }
  };

  // Go to the previous step
  const prevStep = () => {
    // Clear any existing action timer
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
    if (stepChangeTimerRef.current) {
      clearTimeout(stepChangeTimerRef.current);
      stepChangeTimerRef.current = null;
    }

    if (currentStepIndex > 0) {
      // Close any open popovers before moving to the previous step
      // Only close if the current step doesn't explicitly set closePopoverOnNext to false
      const currentStepData = allSteps[currentStepIndex];

      // Only close popovers if closePopoverOnNext is not explicitly set to false
      if (currentStepData?.closePopoverOnNext !== false) {
        closeAllPopovers();
      }

      const prevStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIndex);

      const prevStepData = allSteps[prevStepIndex];
      if (prevStepData?.target) {
        scrollToElement(prevStepData.target);
      }

      if (prevStepData) {
        stepChangeTimerRef.current = setTimeout(() => {
          executeStepAction(prevStepData);
          stepChangeTimerRef.current = null;
        }, 300);
      }
    }
  };

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        startTour,
        endTour,
        nextStep,
        prevStep,
        currentStep,
        totalSteps: allSteps.length,
        allSteps,
        executeStepAction,
        theme,
        setTheme,
        isPaused,
        resumeTour,
        pauseTour,
        isNavigating,
        closeAllPopovers,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
