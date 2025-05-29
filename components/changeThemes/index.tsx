'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '../ui';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const handleChangeMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <Button
      id="theme-switcher"
      onClick={handleChangeMode}
      size={'icon'}
      variant={null}
    >
      <Sun className=" h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute dark:text-white h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
