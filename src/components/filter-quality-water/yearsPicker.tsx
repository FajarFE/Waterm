'use client';

import * as React from 'react';
import { format } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skripsi/components';
import { useRouter, useSearchParams } from 'next/navigation';

export function YearPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [year, setYear] = React.useState(
    searchParams?.get('year') || format(new Date(), 'yyyy'),
  );

  const years = Array.from({ length: 10 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    const params = new URLSearchParams(searchParams?.toString());
    params.set('year', newYear);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid gap-2">
      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
