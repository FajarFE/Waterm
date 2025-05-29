import { Tutorial } from '@/components/detailTutorial';
import { MotionValue, useTransform } from 'framer-motion';
import { useMemo } from 'react';

export type TransformValues = {
  progress: MotionValue<number>;
  borderColor: MotionValue<string>;
  dashOffset: MotionValue<number>;
  curveDashOffset?: MotionValue<number>;
};

export const useMainStepMotion = (
  scrollProgress: MotionValue<number>,
  start: number,
  end: number,
): TransformValues => {
  const progress = useTransform(scrollProgress, [start, end], [0, 1]);
  const borderColor = useTransform(
    scrollProgress,
    [start, end],
    ['#000000', '#6344F5'],
  );
  const dashOffset = useTransform(scrollProgress, [start, end], [27, 0]);

  return { progress, borderColor, dashOffset };
};

export const useSubStepMotion = (
  scrollProgress: MotionValue<number>,
  start: number,
  end: number,
): TransformValues => {
  const progress = useTransform(scrollProgress, [start, end], [0, 1]);
  const borderColor = useTransform(
    scrollProgress,
    [start, end],
    ['#000000', '#6344F5'],
  );
  const dashOffset = useTransform(scrollProgress, [start, end], [30, 0]);
  const curveDashOffset = useTransform(scrollProgress, [start, end], [40, 0]);

  return { progress, borderColor, dashOffset, curveDashOffset };
};

export const useStepTutorialMotion = (
  tutorialData: Tutorial, // Menggunakan TutorialData
  scrollProgress: MotionValue<number>,
) => {
  // Calculate total segments
  const totalSegments = useMemo(() => {
    let count = tutorialData.step.length;
    tutorialData.step.forEach((step) => {
      if (step.sub_step) {
        // Pastikan substep ada
        count += step.sub_step.length;
      }
    });
    return count;
  }, [tutorialData]);

  // Calculate segment ranges
  const segmentRanges = useMemo(() => {
    const ranges: Record<string, { start: number; end: number }> = {};
    if (totalSegments === 0) {
      return ranges; // Hindari division by zero dan tangani steps kosong
    }
    const segmentSize = 1 / totalSegments;
    let currentSegment = 0;

    tutorialData.step.forEach((mainStep, index) => {
      ranges[`step-${index + 1}`] = {
        start: currentSegment * segmentSize,
        end: (currentSegment + 1) * segmentSize,
      };
      currentSegment++;

      if (mainStep.sub_step) {
        mainStep.sub_step.forEach((_, subStepIndex) => {
          // Menggunakan kombinasi ID step dan index substep sebagai key
          ranges[`substep-${index + 1}-${subStepIndex + 1}`] = {
            start: currentSegment * segmentSize,
            end: (currentSegment + 1) * segmentSize,
          };
          currentSegment++;
        });
      }
    });

    return ranges;
  }, [tutorialData, totalSegments]);

  // Create motion values for each segment
  const motionValues: Record<string, TransformValues> = {};
  Object.entries(segmentRanges).forEach(([key, { start, end }]) => {
    if (key.includes('substep')) {
      motionValues[key] = useSubStepMotion(scrollProgress, start, end);
    } else {
      motionValues[key] = useMainStepMotion(scrollProgress, start, end);
    }
  });

  return { motionValues, segmentRanges };
};
