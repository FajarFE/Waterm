import { Framer } from '@skripsi/hooks/framer';
import { useRef, useState } from 'react';
import { motion, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { FlipWords } from '@/components/flipword';
import { useTranslations } from 'next-intl';

function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ref.current.style.setProperty('--mouse-x', `${x}px`);
    ref.current.style.setProperty('--mouse-y', `${y}px`);
    ref.current.style.setProperty('--spotlight-color', '#60a5fa');
  };

  return { ref, handleMouseMove };
}

type HeroCallToActionProps = {
  scrollYProgress: MotionValue<number>;
};
export default function AnimatedGrid({
  scrollYProgress,
}: HeroCallToActionProps) {
  const [leftImageHovered, setLeftImageHovered] = useState(false);
  const [rightImageHovered, setRightImageHovered] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1025px)' });
  const transitionProps = {
    duration: 0.5,
    ease: 'easeInOut',
  };

  const spotlight1 = useSpotlight();
  const spotlight2 = useSpotlight();
  const spotlight3 = useSpotlight();
  const spotlight4 = useSpotlight();

  const t = useTranslations('landingPage.featureSection');
  const dataFeature = t.raw('features');
  return (
    <div className="h-auto mb-10 md:mb-20  flex gap-5 md:gap-20 flex-col lg:mb-20 w-full ">
      <div className="grid grid-cols-12 w-full h-auto">
        <div className="col-span-8 md:py-5 overflow-hidden border-slate-500 dark:border-white border-r-2 border-y-2 h-full bg-slate-100 flex justify-center items-center z-10 backdrop-blur-md bg-opacity-[0.2] ">
          <FlipWords
            Start={0.1}
            End={0.18}
            words={t('title')}
            scrollYProgress={scrollYProgress}
            className="lg:text-6xl text-2xl break-words uppercase font-semibold px-[10px] lg:px-[250px] text-center"
          />
        </div>
        <div className="col-span-4   flex justify-center items-center"></div>
      </div>
      <div className="flex container mx-auto w-full lg:flex-row h-[800px] flex-col gap-5">
        <div className="flex px-4 w-full h-full">
          <div className="w-full h-full flex flex-col gap-5">
            {/* Top Row - Has Image */}
            <motion.div
              className="w-full relative"
              initial={{ flex: 2 }}
              animate={{
                flex: leftImageHovered ? 2 : 1,
              }}
              transition={transitionProps}
              onHoverStart={() => setLeftImageHovered(true)}
              onHoverEnd={() => setLeftImageHovered(false)}
              onTapStart={() => setLeftImageHovered(true)}
              onTap={() => setLeftImageHovered(!leftImageHovered)}
            >
              <Framer className="w-full h-full">
                <div
                  className={`absolute text-lg pr-[150px] lg:pr-[270px]  leading-5 lg:text-3xl z-30 top-5  left-5 font-bold lg:font-semibold`}
                >
                  {dataFeature[0].title}
                </div>
                <div
                  ref={spotlight1.ref}
                  onMouseMove={spotlight1.handleMouseMove}
                  className="card-spotlight z-20 flex justify-center items-end overflow-hidden relative h-full w-full rounded-md  bg-gradient-to-br from-transparent  to-purple-500"
                >
                  <motion.div
                    className="absolute w-full h-full -right-[175px] -top-[173px] lg:-right-[260px]"
                    animate={{
                      y: isMobile
                        ? leftImageHovered
                          ? 180
                          : 200
                        : isTablet
                        ? leftImageHovered
                          ? 0
                          : 200
                        : isDesktop
                        ? leftImageHovered
                          ? 220
                          : 190
                        : 200,
                    }}
                    transition={transitionProps}
                  >
                    <Image
                      src={dataFeature[0].image}
                      width={isMobile ? 400 : 800}
                      height={isMobile ? 400 : 800}
                      alt="Figma-1"
                    />
                  </motion.div>
                </div>
              </Framer>
            </motion.div>

            {/* Bottom Row - No Image */}
            <motion.div
              className="w-full flex justify-start items-end"
              initial={{ flex: 2 }}
              animate={{
                flex: leftImageHovered ? 1 : 2,
              }}
              transition={transitionProps}
            >
              <Framer className="h-full w-full rounded-md flex flex-col  relative justify-start items-start">
                <div className="absolute text-lg pr-[150px] lg:pr-[270px]  leading-5 md:text-3xl lg:text-3xl z-30 top-5  left-5 font-bold lg:font-semibold">
                  {dataFeature[1].title}
                </div>
                <div
                  ref={spotlight2.ref}
                  onMouseMove={spotlight2.handleMouseMove}
                  className="card-spotlight z-20 flex justify-center items-end overflow-hidden relative h-full w-full rounded-md  bg-gradient-to-br from-transparent  to-purple-500"
                >
                  <motion.div
                    className="absolute -right-[580px] w-[200%] h-[200%] top-[10px] md:-right-[645px] md:top-[13px] lg:-right-[1100px]"
                    animate={{
                      y: !leftImageHovered ? 40 : 0,
                    }}
                    transition={transitionProps}
                  >
                    <Image
                      src={dataFeature[1].image}
                      width={isMobile ? 800 : 1500}
                      height={isMobile ? 800 : 1500}
                      alt="Figma-1"
                    />
                  </motion.div>
                </div>
              </Framer>
            </motion.div>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex px-4  h-full w-full">
          <div className="w-full h-full flex  lg:flex-col flex-col-reverse gap-5">
            {/* Top Row - No Image */}
            <motion.div
              className="w-full relative"
              initial={{ flex: 2 }}
              animate={{
                flex: rightImageHovered ? 1 : 2,
              }}
              transition={transitionProps}
            >
              <Framer className="h-full w-full rounded-md flex justify-start items-end">
                <div className="absolute text-lg pr-[150px] lg:pr-[350px] leading-5 lg:text-3xl z-30 top-5  left-5 font-bold lg:font-semibold">
                  {dataFeature[2].title}
                </div>
                <div
                  ref={spotlight3.ref}
                  onMouseMove={spotlight3.handleMouseMove}
                  className="card-spotlight z-20 flex justify-center items-end overflow-hidden relative h-full w-full rounded-md  bg-gradient-to-br from-transparent  to-purple-500"
                >
                  <motion.div
                    className="absolute w-[70%] h-full -top-[80px] -right-[40px] lg:-right-[80px]"
                    animate={{
                      y: isMobile
                        ? rightImageHovered
                          ? 120
                          : 145
                        : rightImageHovered
                        ? 100
                        : 130,
                    }}
                    transition={transitionProps}
                  >
                    <Image
                      src={dataFeature[2].image}
                      width={isMobile ? 200 : 400}
                      height={isMobile ? 200 : 400}
                      alt="Figma-1"
                    />
                  </motion.div>
                </div>
              </Framer>
            </motion.div>

            {/* Bottom Row - Has Image */}
            <motion.div
              className="w-full flex justify-center items-start overflow-hidden relative"
              initial={{ flex: 1 }}
              animate={{
                flex: rightImageHovered ? 2 : 1,
              }}
              transition={transitionProps}
              onHoverStart={() => setRightImageHovered(true)}
              onHoverEnd={() => setRightImageHovered(false)}
              onTapStart={() => setRightImageHovered(true)}
              onTap={() => setRightImageHovered(!rightImageHovered)}
            >
              <Framer className="h-full w-full relative rounded-md dark:bg-transparent ">
                <div className="absolute text-lg pr-[150px] lg:pr-[270px] leading-5 lg:text-3xl z-30 top-5  left-5 font-bold lg:font-semibold">
                  {dataFeature[3].title}
                </div>

                <div
                  ref={spotlight4.ref}
                  onMouseMove={spotlight4.handleMouseMove}
                  className="card-spotlight z-20 flex justify-center items-end overflow-hidden relative h-full w-full rounded-md  bg-gradient-to-br from-transparent  to-purple-500"
                >
                  <motion.div
                    className="absolute z-10  w-[80%] h-full -right-[120px] top-[10px] lg:-right-[207px] lg:top-[10px]"
                    animate={{
                      y: isMobile
                        ? rightImageHovered
                          ? 20
                          : 0
                        : rightImageHovered
                        ? 80
                        : 0,
                    }}
                    transition={transitionProps}
                  >
                    <Image
                      src={dataFeature[3].image}
                      width={isMobile ? 300 : 700}
                      height={isMobile ? 300 : 700}
                      alt="Figma-1"
                    />
                  </motion.div>
                </div>
              </Framer>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
