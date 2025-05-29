'use client';

import React, { useEffect, useState } from 'react';
import { NavbarDashboard } from './navbar';
import { SidebarDashboard } from './sidebar';
import { popoverNavbarProps } from '@/components/popover';
import { VerifikasiEmailDashboard } from '@/components/verifikasiEmail';
import { Button } from '@skripsi/components';
import { useLocale, useTranslations } from 'next-intl';
import { TourStep, useTour } from '@skripsi/hooks/tour-guide';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MenuIcon, X } from 'lucide-react';
import { cn } from '@skripsi/libs';

export const Layout = ({ children, ...props }: popoverNavbarProps) => {
  const t = useTranslations('dashboard');
  const data = t.raw('layout.sidebar.menus');
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';
  const { startTour } = useTour();
  const dataLocazationStep = t.raw('tourGuide');
  const popoverTourSteps: TourStep[] = dataLocazationStep;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarExpanded');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'sidebarExpanded',
      JSON.stringify(desktopSidebarExpanded),
    );
  }, [desktopSidebarExpanded]);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar - always render with opacity transition */}
      <div
        className={cn(
          'h-screen border-r hidden md:block transition-all duration-300',
          'md:opacity-100', // Always show on desktop
          isMobile && 'hidden', // Hide on mobile
        )}
        style={{
          width: desktopSidebarExpanded ? '20rem' : '10rem',
        }}
      >
        <div className="h-full overflow-hidden relative">
          <SidebarDashboard data={data} isCollapsed={!desktopSidebarExpanded} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDesktopSidebarExpanded(!desktopSidebarExpanded)}
            className="absolute right-2 top-4 h-6 w-6"
            aria-label={
              desktopSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'
            }
          >
            {desktopSidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar with animation */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
            className="absolute z-30 h-screen w-[80%] max-w-[300px] border-r bg-background shadow-lg overflow-hidden"
          >
            <div className="flex h-16 items-center justify-end px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              <SidebarDashboard data={data} isCollapsed={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with scaling effect */}
      <motion.div
        className="relative flex w-full flex-1 flex-col overflow-hidden"
        animate={{
          scale: isMobile && sidebarOpen ? 0.9 : 1,
          x: isMobile && sidebarOpen ? '70%' : 0,
          borderRadius: isMobile && sidebarOpen ? '1rem' : '0',
        }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
      >
        {/* Header with sidebar toggle */}
        <header className="flex  h-16 items-center border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="mr-4 md:hidden flex"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <NavbarDashboard {...props} />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto ">
          {props.isVerified === null ? (
            <VerifikasiEmailDashboard
              t={t}
              locale={locale}
              button="underline decoration-1"
              className="flex w-full text-white dark:bg-opacity-45 items-center md:flex-row flex-col lg:flex-row justify-between px-10 bg-red-500 py-2"
              email={props.email}
            />
          ) : null}
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => startTour(popoverTourSteps)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Help ?
            </Button>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </motion.div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black"
        />
      )}
    </div>
  );
};
