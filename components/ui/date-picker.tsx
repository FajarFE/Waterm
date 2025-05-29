// components/ui/date-picker-with-range.tsx
'use client';

import * as React from 'react';
import { FaCalendarAlt } from 'react-icons/fa'; // Atau ikon pilihan Anda
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker'; // Tipe dari react-day-picker
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Button,
} from '@skripsi/components/ui';
import { cn } from '@skripsi/libs';

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  disabled?: boolean;
  className?: string; // Memungkinkan styling dari parent
  placeholder?: string; // Placeholder kustom
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
  disabled,
  placeholder = 'Pilih rentang tanggal', // Placeholder default
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker-trigger" // ID untuk pemicu
            variant={'outline'}
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <FaCalendarAlt size={25} />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range" // **PENTING**: Mengatur Calendar untuk mode rentang
            defaultMonth={date?.from} // Bulan awal yang ditampilkan
            selected={date} // Rentang tanggal yang terpilih
            onSelect={onDateChange} // Fungsi yang dipanggil saat rentang berubah
            numberOfMonths={2} // Menampilkan dua bulan untuk kemudahan pemilihan rentang
            disabled={disabled} // Meneruskan status disabled
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
