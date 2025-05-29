'use client';

import * as React from 'react';
import { Button } from '../ui';
import { Icon } from '@iconify/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CustomPopover } from '@/components/Popover Custom';

import { type Active } from '@/components/popover';

export function Localization() {
  const [activePopover, setActivePopover] = React.useState<Active>(null);

  const router = useRouter();
  const pathname = usePathname(); // Mendapatkan path saat ini
  const searchParams = useSearchParams();
  const [language, setLanguage] = React.useState('en');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const params = searchParams?.toString() ?? '';
    const newPath = `/${lang}${(pathname ?? '').replace(/^\/(en|id)/, '')}${
      params ? '?' + params : ''
    }`;
    router.replace(newPath, {
      scroll: false,
    });
  };

  return (
    <CustomPopover
      isOpen={activePopover === 'localization'}
      setIsOpen={(isOpen) => setActivePopover(isOpen ? 'localization' : null)}
      trigger={
        <Button className="bg-transparent hover:bg-transparent" size="icon">
          {language === 'id' ? (
            <Icon icon="emojione:flag-for-indonesia" />
          ) : (
            <Icon icon="circle-flags:us" />
          )}
        </Button>
      }
    >
      <div>
        <Button onClick={() => handleLanguageChange('id')}>
          <Icon icon="emojione:flag-for-indonesia" /> Bahasa Indonesia
        </Button>
        <Button onClick={() => handleLanguageChange('en')}>
          <Icon icon="circle-flags:us" /> English
        </Button>
      </div>
    </CustomPopover>
  );
}
