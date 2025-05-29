'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Step, type StepProps } from './Step';

export interface StepperProps {
  steps: StepProps[];
  activeStep: number;
  onChange?: (step: number) => void;
  lineColor?: string;
  lineHeight?: string;
  animationDuration?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onChange,
  lineColor = 'bg-blue-500',
  lineHeight = 'h-1',
  animationDuration = 300,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Hitung persentase berdasarkan jumlah langkah
    const stepPercentage = 100 / (steps.length - 1);
    // Hitung progress berdasarkan langkah aktif
    const calculatedProgress = activeStep * stepPercentage;
    // Pastikan progress tidak melebihi 100%
    const clampedProgress = Math.min(calculatedProgress, 100);
    setProgress(clampedProgress);
  }, [activeStep, steps.length]);

  return (
    <div className="relative ">
      <div
        className={`absolute top-1/2 left-0  right-0 -translate-y-1/2 ${lineHeight} bg-gray-200`}
      />
      <div
        className={`absolute top-1/2 left-0  -translate-y-1/2 ${lineHeight} ${lineColor} transition-all duration-${animationDuration}`}
        style={{ width: `${progress}%` }}
      />
      <div className="relative z-10 top-4 flex justify-between">
        {steps.map((step, index) => (
          <Step
            key={index}
            {...step}
            classNameText={`${
              index === 0
                ? 'absolute lg:-left-5   bottom-0'
                : index === steps.length - 1
                ? 'absolute lg:-right-8   bottom-0'
                : 'items-center'
            }
              `}
            className={`${
              index === 0
                ? 'items-start relative'
                : index === steps.length - 1
                ? 'items-end relative'
                : 'items-center'
            }`}
            isActive={index === activeStep}
            isCompleted={index < activeStep}
            onClick={() => onChange && onChange(index)}
          />
        ))}
      </div>
    </div>
  );
};
