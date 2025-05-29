'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { cn, signOut } from '@skripsi/libs';
import { Link as LinkScroll } from 'react-scroll';
import Link from 'next/link';
import LocaleSwitcher from '@skripsi/components/ui/locale-switcher';
import { useMediaQuery } from 'react-responsive';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from '@skripsi/components';
import { RxAvatar } from 'react-icons/rx';
import Image from 'next/image';
import { FaArrowUp } from 'react-icons/fa'; // Import scroll-to-top icon
import { useTranslations } from 'next-intl';

export default function AnimatedNavbar() {
  const session = useSession();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [showScrollToTop, setShowScrollToTop] = useState(false); // State untuk tombol scroll ke atas

  // Handle scroll change
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
      setShowScrollToTop(latest > 300); // Tampilkan tombol jika scrollY > 300
    });

    return () => unsubscribe();
  }, [scrollY]);

  // Scroll to top on refresh
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll ke atas saat komponen mount (refresh)
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple toggle function to avoid any issues
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Explicit close function
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Menu items array for reusability

  // Background animation variants
  const backgroundVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Floating particles animation
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 5,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  // Dark mode specific particles
  const darkModeParticles = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 100, // Different IDs from regular particles
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 2,
  }));

  const isDark = mounted && theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Opsi smooth scrolling
    });
  };
  const t = useTranslations('layout.navbar');
  const menuItems = t.raw('menus');

  return (
    <>
      <motion.nav
        className={cn(
          'fixed z-[101] top-0 left-1/2 dark:text-white text-gray-900 -translate-x-1/2  flex items-center justify-between px-2  max-w-[1920px] mx-auto transition-all duration-300 ease-in-out',
          isScrolled && (!isTablet || !isDesktop)
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md mt-2'
            : 'bg-transparent dark:bg-transparent',
        )}
        initial={{ width: '100%', borderRadius: '0px' }}
        animate={{
          width:
            isScrolled && isDesktop
              ? 'calc(100% - 25%)'
              : isScrolled && isTablet
              ? 'calc(100% - 20%)'
              : isScrolled && isMobile
              ? 'calc(100% - 10%)'
              : isTablet
              ? '95%'
              : isDesktop
              ? '90%'
              : '100%',
          borderRadius: isScrolled ? '9999px' : '0px',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xl font-bold flex flex-row justify-center items-center">
          <Image
            className="w-[60px] h-[60px]"
            alt="logo"
            width={100}
            height={100}
            src="/logo.png"
            aria-hidden="true" // Add this since it's decorative
          />
          <div className="-ml-5 text-[15px] font-semibold text-sky-600 ">
            <Link href="/" aria-label="WaterM Homepage">
              aterm
            </Link>
          </div>
        </div>

        {/* Desktop Menu */}
        <ul className="space-x-4 hidden md:flex lg:flex">
          {menuItems.map(
            (item: { name: string; to: string }, index: number) => (
              <li key={index}>
                <LinkScroll
                  activeClass="active"
                  to={item.to}
                  href={`#${item.to}`} // Add href for crawlability
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:text-primary font-semibold transition-colors cursor-pointer"
                  aria-label={`Navigasi ke ${item.name}`}
                  role="button"
                >
                  {item.name}
                </LinkScroll>
              </li>
            ),
          )}
        </ul>

        <div className="flex justify-evenly items-center gap-2 md:gap-5 lg:gap-10">
          {!session.data?.user ? (
            <>
              <div className="lg:flex md:flex hidden justify-center items-center md:gap-2 gap-5">
                <Link
                  href="/signin"
                  className={cn(
                    'rounded-full px-4 py-2 transition-all dark:bg-gradient-to-tr dark:from-purple-400 dark:to-blue-400 dark:text-white dark:font-semibold dark:hover:bg-gray-200 bg-gray-900 text-white hover:bg-gray-800',
                  )}
                  aria-label={t('signInButton')}
                >
                  {t('signInButton')}
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    'rounded-full px-4 py-2 transition-all border-2 dark:border-transparent dark:bg-gradient-border dark:from-blue-400 dark:to-purple-400 dark:text-white dark:font-semibold hover:opacity-80 border-gray-900 text-gray-900',

                    'dark:[background:linear-gradient(#000,#000)_padding-box,linear-gradient(to_right,#60a5fa,#a78bfa)_border-box]',
                  )}
                  aria-label={t('getStartedButton')}
                >
                  {t('getStartedButton')}
                </Link>
              </div>
            </>
          ) : (
            <Link
              href="/dashboard/monitoring"
              className={cn('flex justify-center items-center')}
              aria-label="Go to dashboard monitoring"
            >
              <Avatar>
                <AvatarImage
                  src={session.data.user.image ?? ''}
                  alt={
                    `${session.data.user.name}'s profile picture` ||
                    'User profile picture'
                  }
                />
                <AvatarFallback>
                  <RxAvatar aria-hidden="true" />
                  <span className="sr-only">User profile picture</span>
                </AvatarFallback>
              </Avatar>
            </Link>
          )}

          <div className="flex justify-center items-center space-x-2">
            {/* Custom Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-full transition-colors',
                isDark
                  ? 'dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={false}
              animate={{
                rotate: mounted ? (isDark ? 0 : 180) : 0,
              }}
              transition={{ duration: 0.5, type: 'spring' }}
              aria-label={
                isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'
              }
            >
              <span className="sr-only">
                {isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              </span>
              {mounted && (
                <span aria-hidden="true">
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </span>
              )}
            </motion.button>

            <LocaleSwitcher />

            {/* Mobile Menu Toggle */}
            <motion.button
              className="md:hidden flex items-center justify-center p-2"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 1 }}
              animate={{
                rotate: isMenuOpen ? 90 : 0,
                scale: isMenuOpen ? 0.8 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay with Animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={cn(
              'fixed inset-0 z-[100] flex flex-col  items-center justify-center overflow-hidden',
              isDark
                ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg'
                : 'bg-gradient-to-br from-primary/90 to-primary-foreground/90 backdrop-blur-lg',
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backgroundVariants}
          >
            {/* Animated background particles - different for light/dark mode */}
            {isDark
              ? // Dark mode particles (star-like)
                darkModeParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white opacity-70"
                    initial={{
                      x: `${particle.x}vw`,
                      y: `${particle.y}vh`,
                      scale: 0,
                    }}
                    animate={{
                      x: [
                        `${particle.x}vw`,
                        `${(particle.x + 10) % 100}vw`,
                        `${(particle.x - 5) % 100}vw`,
                      ],
                      y: [
                        `${particle.y}vh`,
                        `${(particle.y - 10) % 100}vh`,
                        `${(particle.y + 5) % 100}vh`,
                      ],
                      scale: [0, 1, 0],
                      opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: 'reverse',
                      delay: particle.delay,
                    }}
                    style={{
                      width: particle.size,
                      height: particle.size,
                      boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.3)',
                    }}
                  />
                ))
              : // Light mode particles
                particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white dark:bg-primary-foreground opacity-20"
                    initial={{
                      x: `${particle.x}vw`,
                      y: `${particle.y}vh`,
                      scale: 0,
                      opacity: particle.opacity,
                    }}
                    animate={{
                      x: [
                        `${particle.x}vw`,
                        `${(particle.x + 20) % 100}vw`,
                        `${(particle.x - 10) % 100}vw`,
                      ],
                      y: [
                        `${particle.y}vh`,
                        `${(particle.y - 30) % 100}vh`,
                        `${(particle.y + 20) % 100}vh`,
                      ],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                      opacity: [
                        particle.opacity,
                        particle.opacity + 0.2,
                        particle.opacity,
                      ],
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: 'reverse',
                      delay: particle.delay,
                    }}
                    style={{
                      width: particle.size,
                      height: particle.size,
                    }}
                  />
                ))}

            {/* Menu Content */}
            <motion.div
              className="relative z-50 flex flex-col items-center justify-center space-y-8 text-white"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                duration: 0.5,
                ease: [0.19, 1, 0.22, 1],
              }}
            >
              {/* Mobile Menu Items */}
              <ul className="flex flex-col items-center space-y-6 text-xl font-medium">
                {menuItems.map(
                  (item: { name: string; to: string }, index: number) => (
                    <motion.li
                      key={item.to}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{
                        delay: 0.1 * index,
                        duration: 0.4,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                      whileHover={{
                        scale: 1.1,
                        rotate: [-1, 1, 0],
                        transition: { rotate: { duration: 0.3, repeat: 0 } },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LinkScroll
                        activeClass="active"
                        to={item.to}
                        href={`#${item.to}`}
                        spy={true}
                        smooth={true}
                        duration={500}
                        onClick={closeMenu}
                        className={cn(
                          'text-2xl font-bold transition-colors',
                          isDark
                            ? 'text-white hover:text-yellow-300'
                            : 'text-white hover:text-primary-foreground/70',
                        )}
                        aria-label={`Navigate to ${item.name} section`}
                        role="button"
                      >
                        {item.name}
                      </LinkScroll>
                    </motion.li>
                  ),
                )}
              </ul>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-4 mt-8 w-full items-center">
                {!session.data?.user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.4,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: isDark
                          ? '0 0 15px rgba(255, 255, 255, 0.3)'
                          : '0 0 15px rgba(255, 255, 255, 0.5)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/signin"
                        className={cn(
                          'font-semibold px-8 py-3 rounded-full block text-center transition-colors',
                          isDark
                            ? 'bg-white text-gray-900 hover:bg-gray-200'
                            : 'bg-white text-primary hover:bg-gray-100',
                        )}
                        onClick={closeMenu}
                        aria-label={t('signInButton')}
                      >
                        {t('signInButton')}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{
                        delay: 0.4,
                        duration: 0.4,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: isDark
                          ? '0 0 15px rgba(79, 70, 229, 0.5)'
                          : '0 0 15px rgba(255, 255, 255, 0.5)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/signup"
                        className={cn(
                          'font-semibold px-8 py-3 rounded-full block text-center border transition-colors',
                          isDark
                            ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
                            : 'bg-primary-foreground text-white border-white hover:bg-primary-foreground/90',
                        )}
                        onClick={closeMenu}
                        aria-label={t('getStartedButton')}
                      >
                        {t('getStartedButton')}
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <div>
                    <Button
                      onClick={() => signOut({ redirectTo: '/' })}
                      className="bg-red-500 text-2xl text-white hover:bg-red-600 transition-colors"
                    >
                      {t('signOutButton')}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll To Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 p-3 rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer z-50"
            aria-label="Kembali ke atas halaman"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <span className="sr-only">Kembali ke atas halaman</span>
            <FaArrowUp size={20} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
