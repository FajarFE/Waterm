'use client';
import type { Step, SubStepType, Tutorial } from '@/components/detailTutorial';
import {
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { type ReactNode, useMemo } from 'react';
import { scroller } from 'react-scroll'; // Import scroller from react-scroll

// interface MotionValueRecordProperties {
//   borderColor: MotionValue<string>;
//   dashOffset: MotionValue<number>;
//   curveDashOffset?: MotionValue<number>;
// }

interface StepTutorialProps {
  step: Tutorial;
  currentMainStepId?: string;
  currentSubStepId?: string;
  progressPercentage?: number;
  children?: ReactNode;
  scrollYProgress?: MotionValue<number> | number;
  scrollProgress?: MotionValue<number>;
  setMobileNavOpen?: (open: boolean) => void;
}

// Renamed and simplified hook to only calculate data
export function useStepTutorialData(tutorial: Tutorial) {
  const { stepData, subStepData } = useMemo(() => {
    if (!tutorial || !tutorial.step) {
      return { stepData: [], subStepData: [] };
    }

    let totalElements = 0;
    tutorial.step.forEach((step) => {
      totalElements++;
      if (step.sub_step) {
        totalElements += step.sub_step.length;
      }
    });

    const progressIncrement = totalElements > 0 ? 1 / totalElements : 0;

    const stepDataArray: {
      stepKey: string;
      stepThreshold: number;
      stepEndThreshold: number;
      step: Step;
    }[] = [];
    const subStepDataArray: {
      subStepKey: string;
      subStepThreshold: number;
      subStepEndThreshold: number;
      subStep: SubStepType;
      stepId: number;
      parentStepIndex: number;
    }[] = [];

    let currentProgress = 0;

    tutorial.step.forEach((step, index) => {
      const stepStart = currentProgress;
      currentProgress += progressIncrement;
      const stepEnd = currentProgress;

      stepDataArray.push({
        stepKey: `step-${index + 1}`,
        stepThreshold: stepStart,
        stepEndThreshold: stepEnd,
        step,
      });

      if (step.sub_step && step.sub_step.length > 0) {
        step.sub_step.forEach((subStep, subStepIndex) => {
          const subStepStart = currentProgress;
          currentProgress += progressIncrement;
          const subStepEnd = currentProgress;

          subStepDataArray.push({
            subStepKey: `substep-${index}-${subStepIndex + 1}`,
            subStepThreshold: subStepStart,
            subStepEndThreshold: subStepEnd,
            subStep,
            stepId: subStepIndex + 1,
            parentStepIndex: index,
          });
        });
      }
    });

    return { stepData: stepDataArray, subStepData: subStepDataArray };
  }, [tutorial]);

  return {
    stepData,
    subStepData,
  };
}

// New component for rendering individual step content
const StepItemContent = ({
  stepInfo,
  scrollProgress,
  stepIndex,
  isFirstStepWithoutSubstepsAfterAStepWithSubsteps,
  handleStepClick,
  children,
  hasSubSteps,
}: {
  stepInfo: {
    stepKey: string;
    stepThreshold: number;
    stepEndThreshold: number;
    step: Step;
  };
  scrollProgress: MotionValue<number>;
  stepIndex: number;
  isFirstStepWithoutSubstepsAfterAStepWithSubsteps: boolean;
  handleStepClick: (index: number) => void;
  children?: ReactNode;
  hasSubSteps: boolean;
}) => {
  const { stepThreshold, stepEndThreshold, step } = stepInfo;

  const borderColor = useTransform(
    scrollProgress,
    [stepThreshold, stepThreshold + 0.01],
    ['#E5E5E5', '#6344F5'],
  );
  const dashOffset = useTransform(
    scrollProgress,
    [stepThreshold, stepEndThreshold],
    [40, 0],
  );

  return (
    <div className="relative text-black w-full max-w-xs sm:max-w-sm">
      {hasSubSteps && (
        <svg
          width="17"
          height="27.8"
          viewBox="0 0 16 27.8"
          aria-hidden="true"
          className="block absolute top-[30px] left-[15px]"
        >
          <path
            d="M1 0C1 23.5 7 21.5 31.5 21.5"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="2"
          />
          <motion.path
            d="M1 0C1 23.5 7 21.5 31.5 21.5"
            fill="none"
            stroke="#6344F5"
            strokeWidth="2"
            strokeDasharray="40"
            strokeDashoffset={dashOffset}
          />
        </svg>
      )}

      {!isFirstStepWithoutSubstepsAfterAStepWithSubsteps &&
        !hasSubSteps &&
        stepIndex > 0 && (
          <svg
            width="4"
            height="29"
            viewBox="0 0 4 29"
            className="block absolute -top-[36px] left-[7px]"
            aria-hidden="true"
          >
            <path d="M2 0V29" fill="none" stroke="#E5E5E5" strokeWidth="2" />
            <motion.path
              d="M2 0V29"
              fill="none"
              stroke="#6344F5"
              strokeWidth="2"
              strokeDasharray="29"
              strokeDashoffset={dashOffset}
            />
          </svg>
        )}

      <motion.div
        className={`h-8 w-8 text-sm border-black dark:border-purple-500 border-2 text-black flex justify-center items-center rounded-full ${
          !isFirstStepWithoutSubstepsAfterAStepWithSubsteps && !hasSubSteps
            ? '-mt-2'
            : ''
        } cursor-pointer hover:bg-purple-100 transition-colors`}
        style={{ borderColor }}
        onClick={() => handleStepClick(stepIndex + 1)}
        role="button"
        tabIndex={0}
        aria-label={`Go to step ${stepIndex + 1}: ${step.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleStepClick(stepIndex + 1);
          }
        }}
      >
        {stepIndex + 1}
      </motion.div>

      <div
        className="absolute top-[3px] left-10 font-bold text-md md:text-lg cursor-pointer hover:text-purple-700 transition-colors"
        onClick={() => handleStepClick(stepIndex + 1)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleStepClick(stepIndex + 1);
          }
        }}
      >
        {step.title}
      </div>
      {children}
    </div>
  );
};

// New component for rendering individual sub-step content
const SubStepItemContent = ({
  subStepInfo,
  scrollProgress,
  parentStepIndex,
  subStepDisplayIndex,
  handleSubStepClick,
  isLastSubStep,
  isLastMainStep,
}: {
  subStepInfo: {
    subStepKey: string;
    subStepThreshold: number;
    subStepEndThreshold: number;
    subStep: SubStepType;
    stepId: number;
  };
  scrollProgress: MotionValue<number>;
  parentStepIndex: number;
  subStepDisplayIndex: number;
  handleSubStepClick: (stepIndex: number, subStepId: string) => void;
  isLastSubStep: boolean;
  isLastMainStep: boolean;
}) => {
  const { subStepThreshold, subStepEndThreshold, subStep } = subStepInfo;

  const borderColor = useTransform(
    scrollProgress,
    [subStepThreshold, subStepThreshold + 0.01],
    ['#E5E5E5', '#6344F5'],
  );
  const dashOffset = useTransform(
    scrollProgress,
    [subStepThreshold, subStepEndThreshold],
    [30, 0],
  );
  const curveDashOffset = useTransform(
    scrollProgress,
    [subStepThreshold, subStepEndThreshold],
    [50, 0],
  );

  return (
    <div className="relative w-full">
      <motion.div
        className="w-8 h-8 rounded-full flex justify-center items-center text-xs border-2 dark:border-purple-500 border-black text-black cursor-pointer hover:bg-purple-100 transition-colors"
        style={{ borderColor }}
        onClick={() =>
          handleSubStepClick(
            parentStepIndex + 1,
            subStepDisplayIndex.toString(),
          )
        }
        role="button"
        tabIndex={0}
        aria-label={`Go to substep ${subStepDisplayIndex}: ${subStep.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSubStepClick(
              parentStepIndex + 1,
              subStepDisplayIndex.toString(),
            );
          }
        }}
      >
        {subStepDisplayIndex}
      </motion.div>

      <div
        className="absolute top-1 left-10 text-sm font-extralight cursor-pointer hover:text-purple-700 transition-colors"
        onClick={() =>
          handleSubStepClick(
            parentStepIndex + 1,
            subStepDisplayIndex.toString(),
          )
        }
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSubStepClick(
              parentStepIndex + 1,
              subStepDisplayIndex.toString(),
            );
          }
        }}
      >
        {subStep.title}
      </div>

      {isLastSubStep && !isLastMainStep && (
        <svg
          width="34"
          height="17"
          viewBox="0 0 34 17"
          className="absolute -left-[17px] top-[29.6px]"
        >
          <path
            d="M33 0C33 2.94667 32.1843 9.06667 18.8824 9.06667C5.58039 9.06667 1 11.56 1 17"
            stroke="#E5E5E5"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M33 0C33 2.94667 32.1843 9.06667 18.8824 9.06667C5.58039 9.06667 1 11.56 1 17"
            stroke="#6344F5"
            strokeWidth="2"
            fill="none"
            strokeDasharray="50"
            strokeDashoffset={curveDashOffset}
          />
        </svg>
      )}

      {!isLastSubStep && (
        <svg
          width="2"
          height="30"
          viewBox="0 0 2 30"
          className="absolute top-[29.9px] left-[14px]"
        >
          <path d="M1 0V12" stroke="#E5E5E5" strokeWidth="2" />
          <motion.path
            d="M1 0V12"
            stroke="#6344F5"
            strokeWidth="2"
            strokeDasharray="30"
            strokeDashoffset={dashOffset}
          />
        </svg>
      )}
    </div>
  );
};

export const StepTutorial = (props: StepTutorialProps) => {
  const localScrollProgress = useMotionValue(0);
  const scrollProgressToUse = props.scrollProgress || localScrollProgress;

  const { stepData, subStepData } = useStepTutorialData(props.step);

  let lastStepWithSubStepsIndex = -1;
  const stepsToRender = stepData || [];

  const handleStepClick = (index: number) => {
    if (props.setMobileNavOpen) {
      props.setMobileNavOpen(false);
    }

    scroller.scrollTo(`step-${index}`, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -80,
    });
  };

  const handleSubStepClick = (stepIndex: number, subStepIndex: string) => {
    if (props.setMobileNavOpen) {
      props.setMobileNavOpen(false);
    }

    scroller.scrollTo(`substep-${stepIndex}-${subStepIndex}`, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -50,
    });
  };

  return (
    <motion.div>
      {props.children}
      {stepsToRender.map((stepInfo, stepIndex) => {
        const isLastStep = stepIndex === stepsToRender.length - 1;
        const hasSubSteps =
          stepInfo.step.sub_step && stepInfo.step.sub_step.length > 0;
        if (hasSubSteps) {
          lastStepWithSubStepsIndex = stepIndex;
        }
        const isFirstStepWithoutSubstepsAfterAStepWithSubsteps =
          !hasSubSteps &&
          stepIndex > lastStepWithSubStepsIndex &&
          stepIndex === lastStepWithSubStepsIndex + 1;

        const currentSubSteps = hasSubSteps
          ? subStepData.filter((ss) => ss.parentStepIndex === stepIndex)
          : [];

        return (
          <StepItemContent
            key={`step-item-${stepIndex}`}
            stepInfo={stepInfo}
            scrollProgress={scrollProgressToUse as MotionValue<number>}
            stepIndex={stepIndex}
            isFirstStepWithoutSubstepsAfterAStepWithSubsteps={
              isFirstStepWithoutSubstepsAfterAStepWithSubsteps
            }
            handleStepClick={handleStepClick}
            hasSubSteps={hasSubSteps || false}
          >
            {hasSubSteps && (
              <div className="pt-3 pb-3 -mt-2 pl-8 flex flex-col gap-2">
                {currentSubSteps.map((subStepInfo, currentSubStepIndex) => {
                  const isLastSubStepOfParent =
                    currentSubStepIndex === currentSubSteps.length - 1;
                  return (
                    <SubStepItemContent
                      key={`substep-item-${stepIndex}-${currentSubStepIndex}`}
                      subStepInfo={subStepInfo}
                      scrollProgress={
                        scrollProgressToUse as MotionValue<number>
                      }
                      parentStepIndex={stepIndex}
                      subStepDisplayIndex={subStepInfo.stepId}
                      handleSubStepClick={handleSubStepClick}
                      isLastSubStep={isLastSubStepOfParent}
                      isLastMainStep={isLastStep && isLastSubStepOfParent}
                    />
                  );
                })}
              </div>
            )}
          </StepItemContent>
        );
      })}
    </motion.div>
  );
};
