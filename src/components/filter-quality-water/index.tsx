'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, isValid } from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@skripsi/libs';

import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skripsi/components';
import type { DateRange } from 'react-day-picker';
import { useLocale, useTranslations } from 'next-intl';

export function FilterSelector({
  limits,
}: {
  limits: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations('dashboard.monitoring');
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  // Get filter parameters from URL
  const [filterType, setFilterType] = useState(
    searchParams?.get('filterType') || 'year',
  );

  // Initialize date range from URL parameters or defaults
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const dateFrom = searchParams?.get('dateFrom');
    const dateTo = searchParams?.get('dateTo');

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      if (isValid(fromDate) && isValid(toDate)) {
        return {
          from: fromDate,
          to: toDate,
        };
      }
    }

    // Default to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    return {
      from: firstDayOfMonth,
      to: lastDayOfMonth,
    };
  });

  // Initialize year and month range from URL parameters or defaults
  const [year, setYear] = useState(
    searchParams?.get('year') || new Date().getFullYear().toString(),
  );
  const [monthFrom, setMonthFrom] = useState(
    searchParams?.get('monthFrom') || '01',
  );
  const [monthTo, setMonthTo] = useState(searchParams?.get('monthTo') || '12');

  // Initialize selected limit with first item from limits array or from URL
  const [selectedLimit, setSelectedLimit] = useState(() => {
    const urlLimitId = searchParams?.get('limitId');
    if (urlLimitId) {
      return urlLimitId;
    }
    // Use first limit as default if available
    return limits.length > 0 ? limits[0].id : limits[0]?.id;
  });

  // Get the appropriate date-fns locale object based on the current locale
  const dateLocale = useMemo(() => {
    // Map your app's locale to date-fns locale
    const localeMap: Record<string, keyof typeof dateFnsLocales> = {
      en: 'enUS',
      id: 'id', // Indonesian locale
      // Add more mappings as needed
    };

    const localeKey = localeMap[currentLocale] || 'enUS';
    return dateFnsLocales[localeKey];
  }, [currentLocale]);

  // Generate localized month names using date-fns
  const localizedMonths = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      // Create a date for each month (using 1st day of month)
      const date = new Date(2023, i, 1);
      // Format the month name using the current locale
      const monthName = format(date, 'MMMM', { locale: dateLocale });
      months.push({
        value: (i + 1).toString().padStart(2, '0'),
        label: monthName,
      });
    }
    return months;
  }, [dateLocale]);

  // Update URL params and include limitId
  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('filterType', filterType);

    // Always include limitId if available
    if (selectedLimit) {
      params.set('limitId', selectedLimit);
    }

    if (filterType === 'month') {
      params.delete('year');
      if (dateRange?.from && dateRange?.to) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        console.log('Debug - Setting month filter params:', {
          fromDate,
          toDate,
          rawFrom: dateRange.from,
          rawTo: dateRange.to,
        });
        params.set('dateFrom', fromDate);
        params.set('dateTo', toDate);
      }
      params.delete('monthFrom');
      params.delete('monthTo');
    } else if (filterType === 'year') {
      params.set('year', year);
      params.set('monthFrom', monthFrom);
      params.set('monthTo', monthTo);
      params.delete('dateFrom');
      params.delete('dateTo');
    }

    router.replace(`/dashboard/monitoring?${params.toString()}`, {
      scroll: false,
    });
  }, [
    filterType,
    dateRange,
    year,
    monthFrom,
    monthTo,
    selectedLimit,
    searchParams,
    router,
  ]);

  // Update URL when filter parameters change
  useEffect(() => {
    updateSearchParams();
  }, [updateSearchParams]);

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
  };

  // Generate year options (10 years back from current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear; i++) {
      years.push(i.toString());
    }
    return years.reverse();
  };

  // Sync state with URL parameters when they change
  useEffect(() => {
    const urlFilterType = searchParams?.get('filterType');
    const urlYear = searchParams?.get('year');
    const urlMonthFrom = searchParams?.get('monthFrom');
    const urlMonthTo = searchParams?.get('monthTo');
    const urlDateFrom = searchParams?.get('dateFrom');
    const urlDateTo = searchParams?.get('dateTo');

    if (urlFilterType) setFilterType(urlFilterType);
    if (urlYear) setYear(urlYear);
    if (urlMonthFrom) setMonthFrom(urlMonthFrom);
    if (urlMonthTo) setMonthTo(urlMonthTo);

    if (urlDateFrom && urlDateTo) {
      const fromDate = new Date(urlDateFrom);
      const toDate = new Date(urlDateTo);

      if (isValid(fromDate) && isValid(toDate)) {
        setDateRange({
          from: fromDate,
          to: toDate,
        });
      }
    }
  }, [searchParams]);

  // Validate month range (ensure monthFrom <= monthTo)
  useEffect(() => {
    const mFrom = parseInt(monthFrom, 10);
    const mTo = parseInt(monthTo, 10);

    if (mFrom > mTo) {
      setMonthTo(monthFrom);
    }
  }, [monthFrom, monthTo]);

  return (
    <div className="flex flex-col md:flex-col lg:flex-row w-full gap-3 items-start md:items-center">
      <div className="flex flex-row gap-2">
        <div className="flex w-full flex-row gap-2 items-center">
          <Select value={filterType} onValueChange={handleFilterTypeChange}>
            <SelectTrigger
              id="date-popover"
              className="md:w-[180px] w-full sm:text-sm lg:text-md md:text-md lg:w-[180px]"
            >
              <SelectValue
                id="filter-type"
                placeholder={t('selectFilterType')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('dateRange')}</SelectItem>
              <SelectItem value="year">{t('monthRange')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filterType === 'month' && (
          <Popover>
            <PopoverTrigger asChild>
              <div
                id="date-range"
                className={cn(
                  'w-full md:w-auto justify-center sm:text-sm lg:text-md md:text-md py-2 flex border items-center rounded-md px-3 lg:py-[7px] text-left font-normal cursor-pointer',
                  !dateRange?.from && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />

                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y', {
                        locale: dateLocale,
                      })}{' '}
                      -{' '}
                      {format(dateRange.to, 'LLL dd, y', {
                        locale: dateLocale,
                      })}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y', { locale: dateLocale })
                  )
                ) : (
                  <span>{t('datePicker')}</span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={dateLocale}
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {filterType === 'year' && (
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                id="year-on-month"
                className="md:w-[80px] lg:w-[120px] w-full"
              >
                <SelectValue placeholder={t('year')} />
              </SelectTrigger>
              <SelectContent>
                {generateYearOptions().map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-row  gap-2">
              <Select value={monthFrom} onValueChange={setMonthFrom}>
                <SelectTrigger
                  id="start-month"
                  className="md:w-[110px] lg:w-[140px] w-full"
                >
                  <SelectValue placeholder={t('fromMonth')} />
                </SelectTrigger>
                <SelectContent>
                  {localizedMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={monthTo} onValueChange={setMonthTo}>
                <SelectTrigger
                  id="end-month"
                  className="md:w-[110px] lg:w-[140px] w-full"
                >
                  <SelectValue placeholder={t('toMonth')} />
                </SelectTrigger>
                <SelectContent>
                  {localizedMonths.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value}
                      disabled={parseInt(month.value) < parseInt(monthFrom)}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Modified Limit Selection */}
        <Select
          value={selectedLimit}
          onValueChange={setSelectedLimit}
          defaultValue={limits[0]?.id}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('selectLimit')} />
          </SelectTrigger>
          <SelectContent>
            {limits.map((limit) => (
              <SelectItem key={limit.id} value={limit.id}>
                {limit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
