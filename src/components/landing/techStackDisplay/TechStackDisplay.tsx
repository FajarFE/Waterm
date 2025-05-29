'use client';

import Marquee from 'react-fast-marquee';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

type TechStackItem = {
  icons: string;
  // Add other properties if they exist in your techstack data
};

type TechStackDisplayProps = {
  techStackData: TechStackItem[];
};

export const TechStackDisplay = ({ techStackData }: TechStackDisplayProps) => {
  const t = useTranslations('landingPage');
  return (
    <div className="w-full mt-3 h-[100px] w-max-[cal(1920px)] md:h-[120px] lg:h-[147px] grid grid-cols-12 lg:mt-[53px]">
      <div className="col-span-2 border-t-2 border-slate-500 dark:border-white h-full dark:bg-dot-white/[2] bg-dot-black/[2] bg-slate-100 backdrop-blur-md bg-opacity-[0.2] relative w-full pl-5 "></div>
      <div className="col-span-2 -z-2 border-y-2 border-slate-500 dark:border-white h-full dark:bg-dot-white/[2] bg-dot-black/[2] bg-slate-100 backdrop-blur-md bg-opacity-[0.2] flex items-center ">
        <div
          className=" absolute text-center flex flex-col -left-[70px] md:-left-[100px] lg:-left-[200px] text-xl md:text-4xl lg:text-6xl font-semibold uppercase z-100 "
          style={{
            width: 'calc(100% * 2)',
          }}
        >
          {t('techStack')
            .split(' ')
            .map((word, index) => (
              <span key={index} className="inline-block mr-2">
                {word}
              </span>
            ))}
        </div>
      </div>
      <div className="col-span-8 border-slate-500 dark:border-white border-x-2 border-t-2 h-full bg-slate-100 w-full z-10 backdrop-blur-md flex justify-center items-center bg-opacity-[0.2] relative text-white">
        <Marquee autoFill={true} gradient={false} speed={50}>
          {techStackData.map((item, index) => (
            <div
              key={index}
              className={`flex justify-center ml-5 w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border-2 border-black dark:border-white p-2 bg-white bg-opacity-25 items-center gap-5 `}
            >
              <Icon color="black" icon={item.icons} width={50} height={50} />
            </div>
          ))}
        </Marquee>
        <span className="absolute top-3 left-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
        <span className="absolute top-3 right-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
        <span className="absolute bottom-3 left-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
        <span className="absolute bottom-3 right-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
      </div>
    </div>
  );
};
