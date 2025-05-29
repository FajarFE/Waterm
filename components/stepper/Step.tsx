import type React from 'react';
import { CheckIcon } from 'lucide-react';

export interface StepProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  activeColor?: string;
  completedColor?: string;
  inactiveColor?: string;
  className?: string;
  classNameText?: string;
}

export const Step: React.FC<StepProps> = ({
  label,
  icon,
  isActive,
  isCompleted,
  onClick,
  classNameText,
  className,
  activeColor = 'bg-blue-500',
  completedColor = 'bg-green-500',
  inactiveColor = 'bg-gray-300',
}) => {
  const bgColor = isCompleted
    ? completedColor
    : isActive
    ? activeColor
    : inactiveColor;

  return (
    <div className={`flex flex-col ${className}`} onClick={onClick}>
      <div
        className={`w-8 h-8 rounded-full ${
          isActive ? 'dark:text-white' : 'dark:text-black'
        } flex items-center justify-center text-white transition-all duration-300 ${bgColor}`}
      >
        {isCompleted ? (
          <CheckIcon className="w-5 h-5 " />
        ) : icon ? (
          icon
        ) : (
          <span className={`text-sm font-medium`}>{label[0]}</span>
        )}
      </div>
      <span
        className={`mt-2  text-lg font-bold  ${classNameText} ${
          isActive ? ' font-bold text-blue-300' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
};
