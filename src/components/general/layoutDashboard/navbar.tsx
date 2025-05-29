'use client';
import { usePathname } from 'next/navigation';

import React from 'react';

import { PopoverNavbar, popoverNavbarProps } from '@/components/popover';
import { ModeToggle } from '@skripsi/components';
import LocaleSwitcher from '@skripsi/components/ui/locale-switcher';

export const NavbarDashboard = (props: popoverNavbarProps) => {
  const pathname = usePathname();
  const SliceArrayNamePage = pathname?.split('/');
  const NamePage =
    SliceArrayNamePage?.[SliceArrayNamePage.length - 1] ?? 'Dashboard';

  return (
    <div className="flex justify-between md:px-0 px-0 lg:px-16 w-full items-center  dark:bg-black dark:text-white bg-white">
      <h1 className="md:text-lg lg:text-2xl font-bold uppercase">
        {NamePage} Page
      </h1>
      <div className="flex flex-row gap-5 justify-center items-center  text-black">
        <PopoverNavbar {...props} />
        <ModeToggle />
        <LocaleSwitcher />
      </div>
    </div>
  );
};
