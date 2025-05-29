'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menus';

import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/service';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
  theme?: string;
};

export default function LocaleSwitcher({ theme }: { theme?: string }) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  return (
    <LocaleSwitcherSelect
      theme={theme}
      defaultValue={locale}
      items={[
        {
          value: 'id',
          label: t('id'),
        },
        {
          value: 'en',
          label: t('en'),
        },
      ]}
      label={locale}
    />
  );
}

function LocaleSwitcherSelect({ defaultValue, items, label, theme }: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  const colorText =
    theme === 'dark'
      ? 'text-white'
      : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white ';

  return (
    <div id="change-locale" className="relative flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger defaultValue={defaultValue} asChild>
          <button
            className={` flex items-center gap-2 rounded-md text-sm font-medium focus:outline-none ${colorText} ${
              isPending && 'pointer-events-none opacity-60'
            }`}
            aria-label={`Ubah bahasa ke ${
              label === 'id' ? 'Indonesia' : 'English'
            }`}
          >
            <span aria-hidden="true">
              {label === 'id' ? (
                <Icon fontSize={25} icon="emojione:flag-for-indonesia" />
              ) : (
                <Icon fontSize={25} icon="circle-flags:us" />
              )}
            </span>
            <span className="sr-only">
              {`Ubah bahasa ke ${label === 'id' ? 'Indonesia' : 'English'}`}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {items.map((lang) => (
            <DropdownMenuItem
              key={lang.value}
              onSelect={() => onChange(lang.value)}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
