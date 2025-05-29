// components/MonitoringFilters.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format, parseISO, isValid, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  DatePickerWithRange,
  Label,
} from '@skripsi/components/ui'; // Pastikan path benar
import { useDebounce } from '@skripsi/hooks/useDebounce'; // Pastikan path benar

export interface FilterValues {
  filterType: 'month' | 'year' | '';
  limitId: string;
  dateFrom: string;
  dateTo: string;
  year: string;
  monthFrom: string;
  monthTo: string;
  minPh?: string;
  maxPh?: string;
  minTemp?: string;
  maxTemp?: string;
  minTurb?: string;
  maxTurb?: string;
}

export interface LimitOption {
  value: string;
  label: string;
}

const STATIC_LIMIT_OPTIONS: LimitOption[] = [
  {
    value: 'cmb86lt920002fhv8cpdqtw4w',
    label: 'Perangkat Default Utama (Static)',
  },
  { value: 'device_group_xyz', label: 'Kelompok Sensor XYZ (Static)' },
  { value: 'area_51_monitors', label: 'Pemantau Area 51 (Static)' },
];

interface MonitoringFiltersProps {
  isLoading: boolean;
  limitOptions?: LimitOption[];
  children?: React.ReactNode;
}

const YYYY_MM_DD_FORMAT = 'yyyy-MM-dd';
const DEBOUNCE_DELAY = 750;

const getEffectiveOptions = (
  propOptions?: LimitOption[],
  staticOptions?: LimitOption[],
): LimitOption[] => {
  return propOptions && propOptions.length > 0
    ? propOptions
    : staticOptions && staticOptions.length > 0
    ? staticOptions
    : [];
};

const getDefaultDateRangeStrings = (): { fromStr: string; toStr: string } => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return {
    fromStr: format(start, YYYY_MM_DD_FORMAT),
    toStr: format(end, YYYY_MM_DD_FORMAT),
  };
};

const parseDateRangeFromString = (
  fromStr?: string | null,
  toStr?: string | null,
): DateRange | undefined => {
  if (fromStr && toStr) {
    const fromDate = parseISO(fromStr);
    const toDate = parseISO(toStr);
    if (isValid(fromDate) && isValid(toDate)) {
      return { from: fromDate, to: toDate };
    }
  }
  return undefined;
};

export const MonitoringFilters: React.FC<MonitoringFiltersProps> = ({
  isLoading,
  children,
  limitOptions: propLimitOptions,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const effectiveLimitOptions = getEffectiveOptions(
    propLimitOptions,
    STATIC_LIMIT_OPTIONS,
  );

  const [uiLimitId, setUiLimitId] = useState(
    searchParams.get('limitId') ||
      (effectiveLimitOptions.length > 0 ? effectiveLimitOptions[0].value : ''),
  );
  const [uiFilterType, setUiFilterType] = useState<'month' | 'year' | ''>(
    (searchParams.get('filterType') as 'month' | 'year' | '') || 'month',
  );
  const [uiSelectedDateRange, setUiSelectedDateRange] = useState<
    DateRange | undefined
  >(
    parseDateRangeFromString(
      searchParams.get('dateFrom'),
      searchParams.get('dateTo'),
    ) ||
      parseDateRangeFromString(
        getDefaultDateRangeStrings().fromStr,
        getDefaultDateRangeStrings().toStr,
      ),
  );
  const [uiYear, setUiYear] = useState(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );
  const [uiMonthFrom, setUiMonthFrom] = useState(
    searchParams.get('monthFrom') || '01',
  );
  const [uiMonthTo, setUiMonthTo] = useState(
    searchParams.get('monthTo') || '12',
  );

  useEffect(() => {
    const urlLimitId = searchParams.get('limitId');
    let newLimitId =
      effectiveLimitOptions.length > 0 ? effectiveLimitOptions[0].value : '';
    if (
      urlLimitId &&
      effectiveLimitOptions.some((opt) => opt.value === urlLimitId)
    ) {
      newLimitId = urlLimitId;
    } else if (
      !urlLimitId &&
      effectiveLimitOptions.length > 0 &&
      !effectiveLimitOptions.some((opt) => opt.value === uiLimitId) // If current uiLimitId is not in new options
    ) {
      newLimitId = effectiveLimitOptions[0].value; // Fallback to first available if current one is gone
    } else if (urlLimitId) {
      newLimitId = urlLimitId; // If URL provides one, prefer it even if not in options initially (might load async)
    }
    setUiLimitId(newLimitId);

    const urlFilterType = (searchParams.get('filterType') || 'month') as
      | 'month'
      | 'year'
      | '';
    setUiFilterType(urlFilterType);

    if (urlFilterType === 'month') {
      const defaultDates = getDefaultDateRangeStrings();
      const fromStr = searchParams.get('dateFrom') || defaultDates.fromStr;
      const toStr = searchParams.get('dateTo') || defaultDates.toStr;
      setUiSelectedDateRange(parseDateRangeFromString(fromStr, toStr));
    } else {
      // Keep existing date range if filter type changes, or set to undefined if specifically cleared
      // setUiSelectedDateRange(undefined); // Optionally clear date range when not 'month'
    }

    const defaultYear = new Date().getFullYear().toString();
    setUiYear(searchParams.get('year') || defaultYear);
    setUiMonthFrom(searchParams.get('monthFrom') || '01');
    setUiMonthTo(searchParams.get('monthTo') || '12');
  }, [searchParams, effectiveLimitOptions]); // Removed uiLimitId from deps to avoid potential loop

  const internalDateFrom =
    uiFilterType === 'month' &&
    uiSelectedDateRange?.from &&
    isValid(uiSelectedDateRange.from)
      ? format(uiSelectedDateRange.from, YYYY_MM_DD_FORMAT)
      : '';
  const internalDateTo =
    uiFilterType === 'month' &&
    uiSelectedDateRange?.to &&
    isValid(uiSelectedDateRange.to)
      ? format(uiSelectedDateRange.to, YYYY_MM_DD_FORMAT)
      : '';

  const filtersToPush: Partial<FilterValues> = {
    limitId: uiLimitId,
    filterType: uiFilterType,
  };

  if (uiFilterType === 'month') {
    if (internalDateFrom) filtersToPush.dateFrom = internalDateFrom;
    if (internalDateTo) filtersToPush.dateTo = internalDateTo;
  } else if (uiFilterType === 'year') {
    filtersToPush.year = uiYear;
    filtersToPush.monthFrom = uiMonthFrom;
    filtersToPush.monthTo = uiMonthTo;
  }

  const debouncedFiltersToPush = useDebounce(filtersToPush, DEBOUNCE_DELAY);

  useEffect(() => {
    if (
      !debouncedFiltersToPush ||
      Object.keys(debouncedFiltersToPush).length === 0
    ) {
      return;
    }

    const params = new URLSearchParams();

    if (debouncedFiltersToPush.limitId) {
      params.set('limitId', debouncedFiltersToPush.limitId);
    }
    // Only set filterType if it's explicitly in debouncedFiltersToPush, or default to 'month'
    // if it's somehow missing (though it should always be present from uiFilterType)
    params.set('filterType', debouncedFiltersToPush.filterType || 'month');

    if (debouncedFiltersToPush.filterType === 'month') {
      if (debouncedFiltersToPush.dateFrom) {
        params.set('dateFrom', debouncedFiltersToPush.dateFrom);
      }
      if (debouncedFiltersToPush.dateTo) {
        params.set('dateTo', debouncedFiltersToPush.dateTo);
      }
    } else if (debouncedFiltersToPush.filterType === 'year') {
      if (debouncedFiltersToPush.year) {
        params.set('year', debouncedFiltersToPush.year);
      }
      if (debouncedFiltersToPush.monthFrom) {
        params.set('monthFrom', debouncedFiltersToPush.monthFrom);
      }
      if (debouncedFiltersToPush.monthTo) {
        params.set('monthTo', debouncedFiltersToPush.monthTo);
      }
    }

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (newQueryString !== currentQueryString) {
      router.push(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [debouncedFiltersToPush, router, pathname, searchParams]);

  const handleLimitIdChange = (newLimitId: string) => {
    setUiLimitId(newLimitId);
  };

  const handleFilterTypeChange = (newType: 'month' | 'year' | '') => {
    setUiFilterType(newType);
    if (newType === 'month') {
      if (!uiSelectedDateRange?.from || !uiSelectedDateRange?.to) {
        const defaultDates = getDefaultDateRangeStrings();
        setUiSelectedDateRange(
          parseDateRangeFromString(defaultDates.fromStr, defaultDates.toStr),
        );
      }
    }
    // No need to explicitly set uiSelectedDateRange to undefined here,
    // as the conditional rendering will hide it, and its value will be ignored
    // when filterType is 'year'.
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setUiSelectedDateRange(newRange);
  };

  const handleYearChange = (newYear: string) => {
    setUiYear(newYear);
  };
  const handleMonthFromChange = (newMonthFrom: string) => {
    setUiMonthFrom(newMonthFrom);
  };
  const handleMonthToChange = (newMonthTo: string) => {
    setUiMonthTo(newMonthTo);
  };

  const currentFullYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentFullYear - 5 + i).toString(),
  ).reverse();
  const monthLabels = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(2000, i, 15);
    return {
      value: (i + 1).toString().padStart(2, '0'),
      label: format(monthDate, 'MMMM'),
    };
  });

  const skeletonBaseClass = 'bg-muted animate-pulse rounded-md';
  const inputHeightClass = 'h-10'; // Standard height for SelectTrigger, Button (DatePicker)

  return (
    <div className="p-4 flex flex-wrap justify-start items-end gap-4 shadow-md rounded-lg mb-6">
      {/* Limit ID Filter */}
      <div className="w-full sm:w-64 min-w-[12rem] flex-grow">
        <Label
          htmlFor="limitIdSelect"
          className="block text-sm font-medium mb-1"
        >
          Limit ID
        </Label>
        {isLoading ? (
          <div
            className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
          ></div>
        ) : effectiveLimitOptions.length > 0 ? (
          <Select
            value={uiLimitId}
            onValueChange={handleLimitIdChange}
            disabled={isLoading}
          >
            <SelectTrigger id="limitIdSelect" className="w-full">
              <SelectValue placeholder="Select Limit ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Available Limit IDs</SelectLabel>
                {effectiveLimitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground mt-1 h-10 flex items-center">
            No Limit ID options.
          </p>
        )}
      </div>

      {/* Filter Type */}
      <div className="w-full sm:w-64 min-w-[12rem] flex-grow">
        <Label htmlFor="filterType" className="block text-sm font-medium mb-1">
          Filter Type
        </Label>
        {isLoading ? (
          <div
            className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
          ></div>
        ) : (
          <Select
            value={uiFilterType}
            onValueChange={handleFilterTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger id="filterType" className="w-full">
              <SelectValue placeholder="Select filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Daily Average (Date Range)</SelectItem>
              <SelectItem value="year">
                Monthly Average (Year/Month Range)
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Date Range Picker (Conditional) */}
      {uiFilterType === 'month' && (
        <div className="w-full sm:w-72 min-w-[16rem] flex-grow">
          <Label className="block text-sm font-medium mb-1">Date Range</Label>
          {isLoading ? (
            <div
              className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
            ></div>
          ) : (
            <DatePickerWithRange
              date={uiSelectedDateRange}
              onDateChange={handleDateRangeChange}
              className="w-full"
              disabled={isLoading}
            />
          )}
        </div>
      )}

      {/* Year/Month Filters (Conditional) */}
      {uiFilterType === 'year' && (
        // This container groups the year/month selectors
        <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
          {/* Year Select */}
          <div className="w-full sm:w-36 min-w-[8rem] flex-grow">
            <Label htmlFor="year" className="block text-sm font-medium mb-1">
              Year
            </Label>
            {isLoading ? (
              <div
                className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
              ></div>
            ) : (
              <Select
                value={uiYear}
                onValueChange={handleYearChange}
                disabled={isLoading}
              >
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Month From Select */}
          <div className="w-full sm:w-44 min-w-[10rem] flex-grow">
            <Label
              htmlFor="monthFrom"
              className="block text-sm font-medium mb-1"
            >
              Month From
            </Label>
            {isLoading ? (
              <div
                className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
              ></div>
            ) : (
              <Select
                value={uiMonthFrom}
                onValueChange={handleMonthFromChange}
                disabled={isLoading}
              >
                <SelectTrigger id="monthFrom" className="w-full">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthLabels.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Month To Select */}
          <div className="w-full sm:w-44 min-w-[10rem] flex-grow">
            <Label htmlFor="monthTo" className="block text-sm font-medium mb-1">
              Month To
            </Label>
            {isLoading ? (
              <div
                className={`${skeletonBaseClass} ${inputHeightClass} w-full`}
              ></div>
            ) : (
              <Select
                value={uiMonthTo}
                onValueChange={handleMonthToChange}
                disabled={isLoading}
              >
                <SelectTrigger id="monthTo" className="w-full">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthLabels.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Children (e.g., additional filters or a submit button) */}
      {children && <div className="self-end">{children}</div>}
    </div>
  );
};
