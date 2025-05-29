import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@skripsi/components';
import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FlipWords } from '../flipword';
import { useTranslations } from 'next-intl';
import { TutorialCard } from './TutorialCard';

export const Tutorial = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const t = useTranslations('tutorial');
  const data = t.raw('tutorial') as Array<{
    id?: string;
    title: string;
    description: string;
    step: { title: string; step: string[] };
    button: string;
    imgPlaceholder?: string;
  }>;

  return (
    <div className="w-full mb-10 lg:h-[100dvh] grid grid-rows-12 z-10 relative -mt-[22px]">
      <div className="row-span-1 grid grid-cols-10 ">
        <div className="col-start-1 col-end-3   border-slate-500 border-r-2"></div>
        <div className="col-span-8 bg-white dark:bg-black border-t-2 border-slate-500"></div>
      </div>
      <div className="row-span-1 grid grid-cols-10 ">
        <div className="col-span-2   border-slate-500   border-r-2"></div>
        <div className="col-span-8 bg-white  dark:bg-black"></div>
      </div>
      <div className="row-span-2 grid grid-cols-10  ">
        <div className="col-span-2 "></div>
        <div className="col-span-2 border-r-2  border-y-2 -ml-[1.5px] border-slate-500 relative w-full h-full flex justify-center items-center">
          <FlipWords
            End={0.47}
            Start={0.4}
            words="Tutorial"
            scrollYProgress={scrollYProgress}
            className="lg:text-8xl absolute h-full flex justify-center items-center w-[200%] lg:-left-[300px] -left-20  top-0 text-3xl break-words uppercase font-semibold  text-center"
          />
        </div>
        <div className="col-span-6  bg-white  dark:bg-black"></div>
      </div>
      <div className="row-span-8  grid grid-cols-10">
        <div className="col-span-2  border-r-2 flex flex-col justify-center items-center border-slate-500 gap-10">
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.16)',
            }}
            className="h-[35px] w-[60px] flex backdrop-blur-xl bg-opacity-75 justify-center items-center rounded-full bg-white  dark:bg-black overflow-hidden"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous slide"
            tabIndex={0}
          >
            <motion.div
              className="w-full h-full flex overflow-hidden justify-center items-center"
              whileHover={{
                x: 0,
              }}
              whileTap={{ scale: 1.2, x: 150 }}
              transition={{ duration: 0.5 }}
            >
              <FaArrowRight size={20} />
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.16)',
            }}
            className="h-[35px] w-[60px] flex backdrop-blur-xl bg-opacity-75 justify-center items-center rounded-full bg-white  dark:bg-black overflow-hidden"
            onClick={() => api?.scrollNext()}
            aria-label="Next slide"
            tabIndex={0}
          >
            <motion.div
              className="w-full h-full flex overflow-hidden justify-center items-center"
              whileTap={{ scale: 1.2, x: -150 }}
              transition={{ duration: 0.5 }}
            >
              <FaArrowLeft size={20} />
            </motion.div>
          </motion.button>
        </div>
        <div className="col-span-8 bg-white  dark:bg-black flex justify-center items-center border-b-2 border-slate-700">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'center',
              loop: false,
            }}
            className="w-full "
          >
            <CarouselContent>
              {data.map((step, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <TutorialCard
                    styleTitle="text-xl line-clamp-2"
                    styleDescript="line-clamp-2"
                    step={step}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
