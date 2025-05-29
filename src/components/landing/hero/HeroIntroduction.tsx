'use client';

import Image from 'next/image';
import { motion, MotionValue } from 'framer-motion';
import { useTranslations } from 'next-intl';

type HeroIntroductionProps = {
  opacity: MotionValue<number> | number;
  // isDesktop: boolean;
};

export const HeroIntroduction = ({
  opacity,
}: // isDesktop,
HeroIntroductionProps) => {
  const t = useTranslations('landingPage.heroSection');
  return (
    <motion.div
      style={{ opacity }}
      className="lg:col-span-7 px-4 my-10 lg:my-0 flex-col justify-between items-center h-[calc(100%+15%)] relative"
    >
      <div className="outer absolute block left-2 w-[96%] -z-1 h-[calc(100%+12%)] lg:h-[45%] h-max-[800px] lg:top-[340px] lg:absolute lg:-left-[20px] rounded-md ">
        <div className="inner w-full h-full h-max-[800px] bg-slate-100 relative clip-custom rounded-md">
          <div className="absolute bottom-5 right-1 w-2 h-2 bg-black rounded-full "></div>
          <div className="absolute bottom-1 right-5 w-2 h-2 bg-black rounded-full "></div>
          <div className="absolute top-9 left-1 md:left-1 w-2 h-2 bg-black rounded-md"></div>
          <div className="absolute top-1 left-5 w-2 h-2 bg-black rounded-md "></div>
        </div>
      </div>
      <div className="pl-5 lg:pl-0 flex flex-col z-10 relative gap-3 lg:gap-5 justify-center items-start w-full lg:h-full lg:pr-[400px] lg:pt-28">
        <div className="text-xl -mb-2 lg:-mb-5 font-bold flex flex-row justify-center items-center">
          <div className="w-[70px] h-[70px] lg:w-16 lg:h-16 mr-2 lg:mr-3 rounded-full overflow-hidden">
            <Image alt="logo" width={100} height={100} src="/logo.png" />
          </div>
          <div className="-ml-[25px] lg:-ml-[35px] text-[20px] lg:text-[25px] font-semibold text-sky-500 ">
            aterm
          </div>
        </div>
        <h2 className="text-md lg:text-2xl font-semibold pr-10 md:pr-20 leading-none text-gray-800">
          {t('title')}
        </h2>
        <p className="text-xs lg:text-lg text-gray-600">{t('description')}</p>
        <button className="bg-blue-500 rounded-full text-md hover:bg-blue-700 text-white font-bold py-1 px-3 lg:py-2 lg:px-4 md:py-2 md:px-4">
          {t('button')}
        </button>
      </div>
    </motion.div>
  );
};
