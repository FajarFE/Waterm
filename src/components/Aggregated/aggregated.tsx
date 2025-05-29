// components/AggregatedDataChart.tsx
'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
  type Plugin,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useTranslations, useLocale } from 'next-intl';
import type {
  AggregatedDataPoint,
  AggregatedMetricKey,
} from '@/types/avgPoint'; // Ensure path is correct

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface AggregatedDataChartProps {
  data: AggregatedDataPoint[];
  dataKey: AggregatedMetricKey;
  label: string;
  title: string;
  filterType: 'month' | 'year';
  className?: string;
  color?: string;
  minThreshold?: number;
  maxThreshold?: number;
  minThresholdLabel?: string;
  maxThresholdLabel?: string;
  // NEW PROPS to pass filter parameters for default labels
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  year?: string; // YYYY
  monthFrom?: string; // MM (1-indexed, e.g., "01", "12")
  monthTo?: string; // MM (1-indexed, e.g., "01", "12")
}

// Helper to generate date strings in DD format
const generateDateLabels = (
  startDateStr: string,
  endDateStr: string,
  locale: string,
): string[] => {
  const labels: string[] = [];
  // Ensure UTC interpretation to avoid off-by-one day issues due to local timezone
  let currentDate = new Date(startDateStr + 'T00:00:00Z');
  const endDate = new Date(endDateStr + 'T00:00:00Z');

  if (
    isNaN(currentDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    currentDate > endDate
  ) {
    console.warn(
      'Invalid date range for generateDateLabels:',
      startDateStr,
      endDateStr,
    );
    return ['Invalid Date Range'];
  }

  while (currentDate <= endDate) {
    labels.push(
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        timeZone: 'UTC',
      }).format(currentDate),
    );
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  return labels.length > 0 ? labels : ['N/A'];
};

// Helper to generate month strings in 'Month Short' format
const generateMonthLabels = (
  yearStr: string,
  startMonthStr: string, // 1-indexed
  endMonthStr: string, // 1-indexed
  locale: string,
): string[] => {
  const labels: string[] = [];
  const year = parseInt(yearStr, 10);
  const startMonth = parseInt(startMonthStr, 10); // e.g., 1 for Jan
  const endMonth = parseInt(endMonthStr, 10); // e.g., 12 for Dec

  if (
    isNaN(year) ||
    isNaN(startMonth) ||
    isNaN(endMonth) ||
    startMonth > endMonth ||
    startMonth < 1 ||
    endMonth > 12
  ) {
    console.warn(
      'Invalid month range for generateMonthLabels:',
      yearStr,
      startMonthStr,
      endMonthStr,
    );
    return ['Invalid Month Range'];
  }

  for (let month = startMonth; month <= endMonth; month++) {
    // month - 1 because Date constructor month is 0-indexed
    const date = new Date(Date.UTC(year, month - 1, 1)); // Use day 1 of the month
    labels.push(
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
    );
  }
  return labels.length > 0 ? labels : ['N/A'];
};

export const AggregatedDataChart: React.FC<AggregatedDataChartProps> = ({
  data,
  dataKey,
  label,
  title,
  className,
  filterType,
  color = 'rgb(54, 162, 235)',
  minThreshold,
  maxThreshold,
  minThresholdLabel: customMinLabel,
  maxThresholdLabel: customMaxLabel,
  dateFrom,
  dateTo,
  year,
  monthFrom,
  monthTo,
}) => {
  const chartRef = useRef<ChartJS<'line', (number | null)[], string> | null>(
    null,
  );
  const t = useTranslations('dashboard.monitoring.aggregatedChart');
  const locale = useLocale();

  const finalMinThresholdLabel =
    customMinLabel || t('thresholds.minDefaultLabel');
  const finalMaxThresholdLabel =
    customMaxLabel || t('thresholds.maxDefaultLabel');

  const isDataEmpty = !data || data.length === 0;

  const formatValue = useCallback(
    (value: number | null | string): string => {
      if (typeof value === 'number') return value.toFixed(1);
      return value === null ? t('status.notAvailable') : String(value);
    },
    [t],
  );

  const chartLabels = useMemo(() => {
    if (isDataEmpty) {
      if (filterType === 'month' && dateFrom && dateTo) {
        return generateDateLabels(dateFrom, dateTo, locale);
      }
      if (filterType === 'year' && year && monthFrom && monthTo) {
        return generateMonthLabels(year, monthFrom, monthTo, locale);
      }
      // Fallback if specific params are missing for the filterType
      // This indicates an issue in how props are passed from the parent.
      console.warn(
        'AggregatedDataChart: Missing date/year/month params for default labels with filterType:',
        filterType,
      );
      return [t('axisLabels.noDataPoints')];
    }
    return data.map((item) => item.period);
  }, [
    data,
    isDataEmpty,
    filterType,
    locale,
    t,
    dateFrom,
    dateTo,
    year,
    monthFrom,
    monthTo,
  ]);

  const chartValues = useMemo(() => {
    if (isDataEmpty) {
      // Create an array of 0s matching the length of generated default labels
      return Array(chartLabels.length).fill(0);
    }
    return data
      .map((item) => item[dataKey] as number | null | undefined)
      .map((val) => (typeof val === 'number' ? val : null));
  }, [data, dataKey, isDataEmpty, chartLabels]);

  const createThresholdAreaPlugin = useCallback((): Plugin<'line'> => {
    return {
      id: 'aggregatedThresholdAreaPlugin',
      beforeDraw: (chartInstance) => {
        const { ctx, chartArea, scales } = chartInstance;
        if (!chartArea || !scales.y) return;
        const { top, bottom, left, right } = chartArea;

        if (minThreshold === undefined && maxThreshold === undefined) return;

        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        if (!patternContext) return;

        patternCanvas.width = 8;
        patternCanvas.height = 8;
        patternContext.strokeStyle = 'rgba(255, 0, 0, 0.25)';
        patternContext.lineWidth = 1.5;
        patternContext.beginPath();
        patternContext.moveTo(0, 8);
        patternContext.lineTo(8, 0);
        patternContext.stroke();

        const fillPattern = ctx.createPattern(patternCanvas, 'repeat');
        if (!fillPattern) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, right - left, bottom - top);
        ctx.clip();

        if (maxThreshold !== undefined) {
          const yMaxPixel = scales.y.getPixelForValue(maxThreshold);
          if (yMaxPixel > top) {
            ctx.fillStyle = fillPattern;
            ctx.fillRect(left, top, right - left, Math.max(0, yMaxPixel - top));
          }
        }

        if (minThreshold !== undefined) {
          const yMinPixel = scales.y.getPixelForValue(minThreshold);
          if (yMinPixel < bottom) {
            ctx.fillStyle = fillPattern;
            ctx.fillRect(
              left,
              yMinPixel,
              right - left,
              Math.max(0, bottom - yMinPixel),
            );
          }
        }
        ctx.restore();
      },
    };
  }, [minThreshold, maxThreshold]);

  const thresholdAreaPluginInstance = useMemo(
    () => createThresholdAreaPlugin(),
    [createThresholdAreaPlugin],
  );

  const createChartOptions = useCallback((): ChartOptions<'line'> => {
    const numericValues = chartValues.filter(
      (v) => typeof v === 'number',
    ) as number[];

    const yRangePoints = [...numericValues];
    if (minThreshold !== undefined) yRangePoints.push(minThreshold);
    if (maxThreshold !== undefined) yRangePoints.push(maxThreshold);
    if (yRangePoints.length === 0) yRangePoints.push(0);

    const effectiveDataMin = Math.min(...yRangePoints);
    const effectiveDataMax = Math.max(...yRangePoints);

    const range = Math.max(1, effectiveDataMax - effectiveDataMin);
    const buffer = range * 0.15;

    let yMinSuggested = effectiveDataMin - buffer;
    if (
      effectiveDataMin >= 0 &&
      (minThreshold === undefined || minThreshold >= 0)
    ) {
      yMinSuggested = Math.max(0, yMinSuggested);
    }
    yMinSuggested = Math.floor(yMinSuggested);
    const yMaxSuggested = Math.ceil(effectiveDataMax + buffer);

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: title, font: { size: 16 } },
        tooltip: {
          enabled: !isDataEmpty,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0]?.label
                ? `${t('tooltip.period', { defaultValue: 'Period' })}: ${
                    tooltipItems[0].label
                  }`
                : '';
            },
            label: (context: TooltipItem<'line'>) => {
              const value = context.raw as number | null;
              const currentDatasetLabel = context.dataset.label || '';
              const formattedVal = formatValue(value);

              if (
                currentDatasetLabel.includes(finalMinThresholdLabel) ||
                currentDatasetLabel.includes(finalMaxThresholdLabel)
              ) {
                return `${currentDatasetLabel}: ${formattedVal}`;
              }

              let labelStr = `${currentDatasetLabel}: ${formattedVal}`;
              if (typeof value === 'number') {
                if (
                  (minThreshold !== undefined && value < minThreshold) ||
                  (maxThreshold !== undefined && value > maxThreshold)
                ) {
                  labelStr += ` (${t('status.outOfRange')})`;
                }
              }
              return labelStr;
            },
          },
        },
        annotation: {
          annotations: {
            minLine:
              minThreshold !== undefined
                ? {
                    type: 'line',
                    yMin: minThreshold,
                    yMax: minThreshold,
                    borderColor: 'rgb(75, 192, 75)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    label: {
                      content: `${finalMinThresholdLabel}: ${formatValue(
                        minThreshold,
                      )}`,
                      display: true,
                      position: 'start',
                      backgroundColor: 'rgba(75, 192, 75, 0.7)',
                      font: { size: 10, weight: 'bold' },
                      color: 'white',
                      padding: 3,
                      xAdjust: 5,
                    },
                  }
                : undefined,
            maxLine:
              maxThreshold !== undefined
                ? {
                    type: 'line',
                    yMin: maxThreshold,
                    yMax: maxThreshold,
                    borderColor: 'rgb(255, 99, 71)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    label: {
                      content: `${finalMaxThresholdLabel}: ${formatValue(
                        maxThreshold,
                      )}`,
                      display: true,
                      position: 'end',
                      backgroundColor: 'rgba(255, 99, 71, 0.7)',
                      font: { size: 10, weight: 'bold' },
                      color: 'white',
                      padding: 3,
                      xAdjust: -5,
                    },
                  }
                : undefined,
          },
        },
      },
      scales: {
        y: {
          min: yMinSuggested,
          max: yMaxSuggested,
          ticks: {
            callback: (value) =>
              typeof value === 'number' ? value.toFixed(1) : value,
          },
          title: { display: true, text: label },
        },
        x: {
          title: {
            display: true,
            text:
              filterType === 'month'
                ? t('axisLabels.daily')
                : t('axisLabels.monthly'),
          },
          ticks: {
            maxRotation: chartLabels.length > 10 ? 45 : 0,
            minRotation: chartLabels.length > 10 ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: (() => {
              if (isDataEmpty) {
                if (chartLabels.length <= 7) return chartLabels.length;
                return filterType === 'month'
                  ? Math.min(chartLabels.length, 10)
                  : Math.min(chartLabels.length, 12);
              }
              if (chartLabels.length > 20) {
                return filterType === 'month' ? 15 : 12;
              }
              return undefined;
            })(),
          },
        },
      },
    };
  }, [
    chartValues,
    minThreshold,
    maxThreshold,
    title,
    label,
    filterType,
    t,
    isDataEmpty,
    formatValue,
    finalMinThresholdLabel,
    finalMaxThresholdLabel,
    chartLabels, // Added chartLabels explicitly for ticks configuration
  ]);

  const chartDataConfig = useMemo(() => {
    return {
      labels: chartLabels,
      datasets: [
        {
          label,
          data: chartValues,
          borderColor: color,
          backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
          tension: 0.1,
          fill: true,
          pointRadius: isDataEmpty ? 0 : chartLabels.length <= 30 ? 3 : 1,
          pointHoverRadius: isDataEmpty ? 0 : 5,
        },
      ],
    };
  }, [chartLabels, chartValues, label, color, isDataEmpty]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.options = createChartOptions();
      chartRef.current.data = chartDataConfig;
      chartRef.current.update('none');
    }
  }, [createChartOptions, chartDataConfig]);

  const plugins = useMemo(() => {
    const activePlugins: Plugin<'line'>[] = [];
    if (minThreshold !== undefined || maxThreshold !== undefined) {
      activePlugins.push(thresholdAreaPluginInstance);
    }
    return activePlugins;
  }, [minThreshold, maxThreshold, thresholdAreaPluginInstance]);

  return (
    <div
      className={`${
        className || ''
      } bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[450px] flex flex-col`}
    >
      <div className="flex-grow relative h-[calc(100%-2rem)]">
        <Line
          ref={chartRef}
          data={chartDataConfig}
          options={createChartOptions()}
          plugins={plugins}
        />
        {isDataEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 dark:text-gray-500 text-center px-4">
              {t('status.noDataToDisplayInChart')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
