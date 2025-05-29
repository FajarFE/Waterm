'use client';
import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
} from '@skripsi/components';

interface TutorialStep {
  id?: string;
  title: string;
  description: string;
  step?: { title: string; step: string[] }; // Optional, as per original data structure
  button: string;
}

interface TutorialCardProps {
  step: TutorialStep;
  classname?: string;
  styleTitle?: string;
  styleDescript?: string;
}

export const TutorialCard: React.FC<TutorialCardProps> = ({
  step,
  classname,
  styleDescript,
  styleTitle,
}) => {
  return (
    <div className={`p-5 ${classname}`}>
      <Card className="bg-transparent border-none shadow-none">
        <div
          className={`w-full h-[270px] relative overflow-hidden flex items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out justify-center`}
        >
          <span className="w-full h-4 bg-white absolute bottom-0"></span>
          <span className="w-4 h-full bg-white absolute right-0"></span>
          <span className="w-20 h-20 bg-white absolute -right-3 -bottom-3 rounded-full">
            <Image
              width={100}
              height={100}
              alt="Logo"
              className="absolute left-1"
              src={'/logo.png'}
            />
          </span>
          <span className="text-gray-500 text-lg">Image Placeholder</span>
        </div>
        <CardHeader>
          <CardTitle
            className={` text-slate-800 dark:text-white font-semibold ${styleTitle}`}
          >
            {step.title}
          </CardTitle>
          <CardDescription className={`${styleDescript}`}>
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>{step.button}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
