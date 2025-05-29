'use client';

import { motion, MotionValue } from 'framer-motion';
import { Lottie } from '@skripsi/hooks/lottie';

import { LottieAnimationData } from '@/types/lottie';
import { HeroCarousel } from './HeroCarousel';

type TransformStyle = {
  scale: MotionValue<number> | number;
  y: MotionValue<string | number> | string | number;
  x: MotionValue<string | number> | string | number;
};

type HeroAnimatedDisplayProps = {
  transformStyle: TransformStyle;
  isTransformComplete: boolean;
  isTablet: boolean;
  mainLottieData: LottieAnimationData;
  dropletLottieData: LottieAnimationData;
  shapesLottieData: LottieAnimationData;
  line1_1: MotionValue<number> | number;
  line1_2: MotionValue<number> | number;
  line2_1: MotionValue<number> | number;
  line2_2: MotionValue<number> | number;
  line3_1: MotionValue<number> | number;
  line3_2: MotionValue<number> | number;
};

export const HeroAnimatedDisplay = ({
  transformStyle,
  isTransformComplete,
  isTablet,
  mainLottieData,
  dropletLottieData,
  shapesLottieData,
  line1_1,
  line1_2,
  line2_1,
  line2_2,
  line3_1,
  line3_2,
}: HeroAnimatedDisplayProps) => {
  return (
    <div className="lg:col-span-5 mb-10 md:mb-0 w-full lg:h-full md:h-full h-[200px] flex justify-center items-center relative">
      <div className="w-screen md:hidden lg:block lg:top-5 lg:-left-[1050px] h-screen max-w-[1800px] max-h-[1800px] absolute ">
        <svg
          viewBox="0 0 20 20"
          width="100vw"
          height="180vh"
          className="block"
          style={{
            maxWidth: '1800px',
            maxHeight: '1700px',
            minHeight: '200px',
            minWidth: '200px',
          }}
          aria-hidden="true"
        >
          <motion.path
            d="M 41 10 H 19 -280 L -290 30 V 350 L -260 380 H -250 -10 "
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0"
            strokeWidth="2"
            transform="scale(0.04) translate(300,58)"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d="M 41 10 H 19 -280 L -290 30 V 350 L -260 380 H -250 -10 "
            fill="none"
            stroke="url(#line1)"
            strokeWidth="2"
            className="motion-reduce:hidden"
            transform="scale(0.04) translate(300,58)"
            transition={{
              duration: 10,
            }}
          ></motion.path>

          <defs>
            <motion.linearGradient
              id="line1"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={line1_1}
              y2={line1_2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="0.325" stopColor="#6344F5"></stop>
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div className="w-screen md:hidden lg:block top-[60px] -left-[1030px] h-screen max-w-[1800px] max-h-[1800px] absolute">
        <svg
          viewBox="0 0 20 20"
          width="100vw"
          height="180vh"
          className="block"
          style={{
            maxWidth: '1800px',
            maxHeight: '1700px',
            minHeight: '200px',
            minWidth: '200px',
          }}
          aria-hidden="true"
        >
          <motion.path
            d="M 30 -20  L 19 -5 L 19 50  L 10  60 H -152 L -171.4 80 V 200 L -150 220 V 260 260 H -100 "
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.0"
            strokeWidth="2"
            transform="scale(0.04) translate(280, 160)"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d="M 30 -20  L 19 -5 L 19 50  L 10  60 H -152 L -171.4 80 V 200 L -150 220 V 260 260 H -100 "
            fill="none"
            stroke="url(#line2)"
            strokeWidth="2"
            className="motion-reduce:hidden"
            transform="scale(0.04) translate(280, 160)"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <defs>
            <motion.linearGradient
              id="line2"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={line2_1}
              y2={line2_2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="0.325" stopColor="#6344F5"></stop>
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div className="w-screen md:hidden lg:block top-2 -left-[900px] h-screen max-w-[1800px] max-h-[1800px] absolute">
        <svg
          viewBox="0 0 20 20"
          width="100vw"
          height="180vh"
          className="block"
          style={{
            maxWidth: '1800px',
            maxHeight: '1700px',
            minHeight: '200px',
            minWidth: '200px',
          }}
          aria-hidden="true"
        >
          <motion.path
            d="M 19 10 H 19 53 L 70 26 L 71 140  L 30  170 V 200 230 L -10 280 H -20 -180 "
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0"
            strokeWidth="2"
            transform="scale(0.04) translate(450, 165)"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d="M 19 10 H 19 53 L 70 26 L 71 140  L 30  170 V 200 230 L -10 280 H -20 -180 "
            fill="none"
            stroke="url(#line3)"
            strokeWidth="2"
            className="motion-reduce:hidden"
            transform="scale(0.04) translate(450, 165)"
            transition={{
              duration: 10,
            }}
          ></motion.path>

          <defs>
            <motion.linearGradient
              id="line3"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={line3_1}
              y2={line3_2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="0.325" stopColor="#6344F5"></stop>
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={
          isTablet
            ? { x: -203, y: 50, opacity: 1 }
            : { x: -223, y: 50, opacity: 1 }
        }
        exit={{ opacity: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: 'easeInOut' }}
        className="lg:w-[200px] bottom-[20px] -right-[110px] h-[50px] md:-bottom-[150px] md:-right-[20px] w-[50px] lg:h-[120px] md:h-[80px] md:w-[120px] rounded-md backdrop-blur-md bg-opacity-40 z-20 bg-gray-400 flex justify-center items-center relative"
      >
        <div className="w-[75%] h-[75%] flex justify-center items-center">
          <Lottie
            animationData={dropletLottieData.animationData}
            loop={dropletLottieData.loop ?? true}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ x: 200, y: 140, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: 'easeInOut' }}
        className="lg:w-[200px] h-[50px] right-[120px] bottom-[40px] md:bottom-0 md:right-[40px] w-[50px] lg:h-[120px] md:h-[80px] md:w-[120px] rounded-md backdrop-blur-md bg-opacity-40 z-20 bg-gray-400 flex justify-center items-center relative"
      >
        <Lottie
          animationData={shapesLottieData.animationData}
          loop={shapesLottieData.loop ?? true}
        />
      </motion.div>

      <motion.div
        style={{
          y: transformStyle.y,
          x: transformStyle.x,
          scale: transformStyle.scale,
        }}
        className="w-[70%] lg:w-full absolute rounded-xl flex justify-center items-center bg-gradient-to-tr from-purple-500 to-blue-500 h-full lg:h-[40%] p-4 md:p-5"
      >
        {isTransformComplete ? (
          <HeroCarousel />
        ) : (
          <div className="absolute top-0 lg:-top-10 w-full h-full flex justify-center items-center">
            <Lottie
              animationData={mainLottieData.animationData}
              loop={mainLottieData.loop ?? true}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
