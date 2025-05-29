'use client';

import { MotionValue } from 'framer-motion';
import { FlipWords } from '../../flipword'; // Updated import
import { useTranslations } from 'next-intl';

type HeroCallToActionProps = {
  scrollYProgress: MotionValue<number>;
};

export const HeroCallToAction = ({
  scrollYProgress,
}: HeroCallToActionProps) => {
  const t = useTranslations('landingPage.Services');

  return (
    <div className="lg:h-screen h-[60vh] md:max-h-[700px] lg:max-h-[900px] w-full w-max-[cal(1920px)]">
      <div className="grid grid-cols-12 h-[70px] md:h-[110px] relative lg:h-[200px] justify-center items-center">
        <span className="col-span-2 border-b-2 border-slate-500 dark:border-white h-full dark:bg-dot-white/[2] bg-dot-black/[2] bg-slate-100 z-10 backdrop-blur-md bg-opacity-[0.2]"></span>
        <div className="absolute z-1 -left-[20px] -bottom-[401px] lg:-bottom-[550px] text-xl lg:text-5xl w-full ">
          <span className="flex flex-col gap-1 md:gap-2 justify-center items-center">
            <span>
              <span className="bg-gradient-to-r font-bold from-purple-500 to-blue-500 bg-clip-text text-transparent">
                {t('tagline.1').split(' ')[0]}{' '}
              </span>
              <span className="font-extralight">
                {t('tagline.1').split(' ').slice(1).join(' ')}{' '}
              </span>
            </span>
            <span className="pl-20 ">
              <span className="bg-gradient-to-r font-bold to-purple-500 from-blue-500 bg-clip-text text-transparent">
                {t('tagline.2').split(' ')[0]}{' '}
              </span>
              <span className="font-extralight">
                {t('tagline.2').split(' ').slice(1).join(' ')}{' '}
              </span>
            </span>
          </span>
        </div>
        <div className="col-span-8 overflow-hidden border-slate-500 dark:border-white border-x-2 border-b-2 h-full bg-slate-100 flex justify-center items-center z-10 backdrop-blur-md bg-opacity-[0.2] relative">
          <FlipWords
            Start={0.1}
            End={0.15}
            words={t('title')}
            scrollYProgress={scrollYProgress}
            className="lg:text-6xl text-xl break-words uppercase font-semibold px-[10px] lg:px-[180px] text-center"
          />
          <span className="absolute top-3 left-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
          <span className="absolute top-3 right-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
          <span className="absolute bottom-3 left-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
          <span className="absolute bottom-3 right-3 bg-slate-500 dark:bg-white w-2 h-2 rounded-full"></span>
        </div>
        <span className="col-span-2 border-y-2 border-slate-500 dark:border-white h-full dark:bg-dot-white/[2] bg-dot-black/[2] bg-slate-100 z-10 backdrop-blur-md bg-opacity-[0.2]"></span>
      </div>
    </div>
  );
};
