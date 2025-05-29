'use client';

import { cn } from '@skripsi/libs';
import Image from 'next/image';

export interface SubStepProps {
  subStep: {
    title: string;
    description: string;
    image?: string;
  };
  isOpen: boolean;
  onClick: () => void;
}

export function SubStep({ subStep, isOpen, onClick }: SubStepProps) {
  return (
    <div
      className={cn(
        'border rounded-lg transition-all duration-300',
        isOpen
          ? 'bg-white border-blue-200 shadow-sm'
          : 'bg-gray-50 border-gray-200',
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              isOpen
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-600',
            )}
          >
            {isOpen ? (
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
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            ) : (
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
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </div>
          <h4 className="text-md md:text-lg font-medium">{subStep.title}</h4>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 ml-11">
          <div className="border-l-2  border-blue-200 pl-4">
            <p className="text-gray-600 mb-4 md:text-lg text-sm">
              {subStep.description}
            </p>
            {subStep.image && subStep.image !== '/' && (
              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <Image
                  width={100}
                  height={100}
                  src={subStep.image || '/placeholder.svg'}
                  alt={subStep.title}
                  className="w-full object-cover h-auto max-h-[338px]"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
