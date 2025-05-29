'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FilterValues, MonitoringFilters } from './filter'; // Adjust path
import { AggregatedMetricKey } from '@/types/avgPoint'; // Adjust path

import {
  getMonitoringData,
  type GetMonitoringDataParams,
  type ServerActionResult,
  type AggregatedDataPoint,
} from '@/actions/anjay'; // Adjust path

import {
  downloadMonitoringExcel,
  type DownloadExcelParams,
} from '@/actions/download'; // Adjust path

import { AggregatedDataChart } from './aggregated'; // Adjust path

// --- Helper Components ---
function ChartLoadingSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`${className} bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[450px] flex flex-col animate-pulse`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex flex-col items-end w-1/4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
      <div className="flex-grow bg-gray-200 dark:bg-gray-600 rounded"></div>
    </div>
  );
}

// --- Main Page Component ---
type UrlParams = Partial<FilterValues>; // Make sure FilterValues includes all date/year/month params

type ExcelThresholdKeys =
  | 'excelMinPh'
  | 'excelMaxPh'
  | 'excelMinTemperature'
  | 'excelMaxTemperature'
  | 'excelMinTurbidity'
  | 'excelMaxTurbidity';

interface ChartConfig {
  key: AggregatedMetricKey;
  titleKey: string;
  labelKey: string;
  color: string;
  defaultMinThreshold: number;
  defaultMaxThreshold: number;
  urlMinParam: string;
  urlMaxParam: string;
  backendMinParamKey: ExcelThresholdKeys;
  backendMaxParamKey: ExcelThresholdKeys;
}

const chartConfigurations: ChartConfig[] = [
  {
    key: 'avgPH',
    titleKey: 'charts.ph.title',
    labelKey: 'charts.ph.label',
    color: 'rgb(75, 192, 192)',
    defaultMinThreshold: 6.5,
    defaultMaxThreshold: 8.5,
    urlMinParam: 'minPh',
    urlMaxParam: 'maxPh',
    backendMinParamKey: 'excelMinPh',
    backendMaxParamKey: 'excelMaxPh',
  },
  {
    key: 'avgTemperature',
    titleKey: 'charts.temperature.title',
    labelKey: 'charts.temperature.label',
    color: 'rgb(255, 159, 64)',
    defaultMinThreshold: 25,
    defaultMaxThreshold: 30,
    urlMinParam: 'minTemp',
    urlMaxParam: 'maxTemp',
    backendMinParamKey: 'excelMinTemperature',
    backendMaxParamKey: 'excelMaxTemperature',
  },
  {
    key: 'avgTurbidity',
    titleKey: 'charts.turbidity.title',
    labelKey: 'charts.turbidity.label',
    color: 'rgb(153, 102, 255)',
    defaultMinThreshold: 0,
    defaultMaxThreshold: 20,
    urlMinParam: 'minTurb',
    urlMaxParam: 'maxTurb',
    backendMinParamKey: 'excelMinTurbidity',
    backendMaxParamKey: 'excelMaxTurbidity',
  },
];

function MonitoringPageContent() {
  const searchParamsHook = useSearchParams();
  const t = useTranslations('dashboard.monitoring');

  const [currentFilters, setCurrentFilters] = useState<UrlParams>({});
  const [monitoringData, setMonitoringData] = useState<
    AggregatedDataPoint[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageFromServer, setMessageFromServer] = useState<string | null>(
    null,
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const parseUrlParams = useCallback((): UrlParams => {
    const params: UrlParams = {};
    const filterTypeParam = searchParamsHook.get('filterType');
    if (filterTypeParam === 'month' || filterTypeParam === 'year') {
      params.filterType = filterTypeParam;
    } // No 'else', let it be undefined if not 'month' or 'year'

    params.limitId = searchParamsHook.get('limitId') || undefined;
    params.dateFrom = searchParamsHook.get('dateFrom') || undefined;
    params.dateTo = searchParamsHook.get('dateTo') || undefined;
    params.year = searchParamsHook.get('year') || undefined;
    params.monthFrom = searchParamsHook.get('monthFrom') || undefined;
    params.monthTo = searchParamsHook.get('monthTo') || undefined;

    chartConfigurations.forEach((config) => {
      const minVal = searchParamsHook.get(config.urlMinParam);
      const maxVal = searchParamsHook.get(config.urlMaxParam);
      if (minVal !== null)
        (params as Record<string, string>)[config.urlMinParam] = minVal;
      if (maxVal !== null)
        (params as Record<string, string>)[config.urlMaxParam] = maxVal;
    });
    return params;
  }, [searchParamsHook]);

  const fetchData = useCallback(
    async (filters: UrlParams) => {
      setIsLoading(true);
      setError(null);
      setMessageFromServer(null);
      setMonitoringData(null);

      let actionParameters: GetMonitoringDataParams | null = null;

      if (
        filters.filterType === 'month' &&
        filters.limitId &&
        filters.dateFrom &&
        filters.dateTo
      ) {
        actionParameters = {
          filterType: 'month',
          limitId: filters.limitId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        };
      } else if (
        filters.filterType === 'year' &&
        filters.limitId &&
        filters.year &&
        filters.monthFrom &&
        filters.monthTo
      ) {
        actionParameters = {
          filterType: 'year',
          limitId: filters.limitId,
          year: filters.year,
          monthFrom: filters.monthFrom,
          monthTo: filters.monthTo,
        };
      }

      if (!actionParameters) {
        setIsLoading(false);
        return;
      }

      try {
        const result: ServerActionResult = await getMonitoringData(
          actionParameters,
        );
        if (result.error) {
          setError(result.error);
        } else {
          setMonitoringData(result.data);
          if (result.message) setMessageFromServer(result.message);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch monitoring data:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage || t('errors.unexpectedFetchError'));
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  const processUrlChange = useCallback(() => {
    const parsedFilters = parseUrlParams();
    setCurrentFilters(parsedFilters);

    const { limitId, filterType, dateFrom, dateTo, year, monthFrom, monthTo } =
      parsedFilters;
    const isMonthFilterValid =
      filterType === 'month' && limitId && dateFrom && dateTo;
    const isYearFilterValid =
      filterType === 'year' && limitId && year && monthFrom && monthTo;

    const canFetchData = isMonthFilterValid || isYearFilterValid;

    if (canFetchData) {
      fetchData(parsedFilters);
    } else {
      setMonitoringData(null);
      setMessageFromServer(null);
      setError(null);
      setIsLoading(false);
    }
  }, [parseUrlParams, fetchData]);

  useEffect(() => {
    processUrlChange();
  }, [processUrlChange]); // Dependency on processUrlChange is fine, it contains parseUrlParams and fetchData

  const handleDownloadExcel = async () => {
    if (!currentFilters.limitId || !currentFilters.filterType) {
      setDownloadError(t('errors.applyFiltersBeforeDownload'));
      return;
    }
    // ... (rest of the download logic remains the same)
    if (
      currentFilters.filterType === 'month' &&
      (!currentFilters.dateFrom || !currentFilters.dateTo)
    ) {
      setDownloadError(t('errors.dateRangeRequiredForDownload'));
      return;
    }
    if (
      currentFilters.filterType === 'year' &&
      (!currentFilters.year ||
        !currentFilters.monthFrom ||
        !currentFilters.monthTo)
    ) {
      setDownloadError(t('errors.yearMonthRangeRequiredForDownload'));
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    let downloadActionParams: DownloadExcelParams;

    if (currentFilters.filterType === 'month') {
      downloadActionParams = {
        filterType: 'month',
        limitId: currentFilters.limitId!,
        dateFrom: currentFilters.dateFrom!,
        dateTo: currentFilters.dateTo!,
      };
    } else if (currentFilters.filterType === 'year') {
      downloadActionParams = {
        filterType: 'year',
        limitId: currentFilters.limitId!,
        year: currentFilters.year!,
        monthFrom: currentFilters.monthFrom!,
        monthTo: currentFilters.monthTo!,
      };
    } else {
      setDownloadError(
        t('errors.invalidFilterTypeForDownload') ||
          'Invalid filter type for download.',
      );
      setIsDownloading(false);
      return;
    }

    chartConfigurations.forEach((config) => {
      const minValueStr = searchParamsHook.get(config.urlMinParam);
      const maxValueStr = searchParamsHook.get(config.urlMaxParam);

      const minValue =
        minValueStr !== null
          ? parseFloat(minValueStr)
          : config.defaultMinThreshold;
      const maxValue =
        maxValueStr !== null
          ? parseFloat(maxValueStr)
          : config.defaultMaxThreshold;

      if (!isNaN(minValue)) {
        (downloadActionParams as any)[config.backendMinParamKey] = minValue;
      }
      if (!isNaN(maxValue)) {
        (downloadActionParams as any)[config.backendMaxParamKey] = maxValue;
      }
    });

    console.log('Params for download Excel:', downloadActionParams);

    try {
      const result = await downloadMonitoringExcel(downloadActionParams);

      if (result.success && result.fileBufferB64 && result.fileName) {
        const byteCharacters = atob(result.fileBufferB64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        setDownloadError(result.error || t('errors.excelGenerationFailed'));
      }
    } catch (error: unknown) {
      console.error('Download Excel error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setDownloadError(errorMessage || t('errors.unexpectedDownloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  const hasSufficientFiltersForDisplay = useMemo(() => {
    const { limitId, filterType, dateFrom, dateTo, year, monthFrom, monthTo } =
      currentFilters;
    if (!limitId || !filterType) return false;
    if (filterType === 'month') return !!(dateFrom && dateTo);
    if (filterType === 'year') return !!(year && monthFrom && monthTo);
    return false;
  }, [currentFilters]);

  const displayLoadingSkeletons = isLoading && hasSufficientFiltersForDisplay;
  const displayChartGrid =
    !isLoading && !error && hasSufficientFiltersForDisplay;
  const displayInitialOrIncompleteFilterPrompt =
    !isLoading && !error && !hasSufficientFiltersForDisplay;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('title')}
        </h1>
      </header>
      <MonitoringFilters isLoading={isLoading || isDownloading}>
        {currentFilters.filterType && currentFilters.limitId && (
          <div className=" flex justify-center">
            <button
              onClick={handleDownloadExcel}
              disabled={
                isDownloading ||
                isLoading ||
                !monitoringData ||
                monitoringData.length === 0
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isDownloading
                ? t('buttons.generatingExcel')
                : t('buttons.downloadExcel')}
            </button>
          </div>
        )}
      </MonitoringFilters>

      {currentFilters.limitId && downloadError && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-1 text-right">
          {downloadError}
        </p>
      )}

      {displayLoadingSkeletons && (
        <div className="grid md:grid-cols-1 lg:grid-cols-4 gap-5">
          {chartConfigurations.map((config) => (
            <ChartLoadingSkeleton
              key={config.key}
              className={
                config.key === 'avgTurbidity'
                  ? 'lg:col-start-2 md:col-span-1 lg:col-span-2'
                  : 'md:col-span-1 lg:col-span-2'
              }
            />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <h3 className="font-semibold text-lg">
            {t('errors.fetchErrorTitle', {
              defaultValue: 'Data Fetch Error',
            })}
          </h3>
          <p>{error}</p>
        </div>
      )}

      {displayChartGrid && (
        <section className="grid md:grid-cols-1 lg:grid-cols-4 gap-5">
          {chartConfigurations.map((config) => {
            const minThresholdStr = searchParamsHook.get(config.urlMinParam);
            const maxThresholdStr = searchParamsHook.get(config.urlMaxParam);

            const minThreshold =
              minThresholdStr !== null
                ? parseFloat(minThresholdStr)
                : config.defaultMinThreshold;
            const maxThreshold =
              maxThresholdStr !== null
                ? parseFloat(maxThresholdStr)
                : config.defaultMaxThreshold;

            // currentFilters.filterType is guaranteed to be 'month' or 'year' here
            // by hasSufficientFiltersForDisplay
            const validFilterType = currentFilters.filterType as
              | 'month'
              | 'year';

            return (
              <AggregatedDataChart
                className={
                  config.key === 'avgTurbidity'
                    ? 'lg:col-start-2 md:col-span-1 lg:col-span-2'
                    : 'md:col-span-1 lg:col-span-2'
                }
                key={config.key}
                data={monitoringData || []} // Pass empty array if null
                filterType={validFilterType}
                dataKey={config.key}
                title={t(config.titleKey)}
                label={t(config.labelKey)}
                color={config.color}
                minThreshold={
                  !isNaN(minThreshold)
                    ? minThreshold
                    : config.defaultMinThreshold
                }
                maxThreshold={
                  !isNaN(maxThreshold)
                    ? maxThreshold
                    : config.defaultMaxThreshold
                }
                // Pass relevant filter parameters for default label generation
                dateFrom={currentFilters.dateFrom}
                dateTo={currentFilters.dateTo}
                year={currentFilters.year}
                monthFrom={currentFilters.monthFrom}
                monthTo={currentFilters.monthTo}
              />
            );
          })}
        </section>
      )}

      {displayInitialOrIncompleteFilterPrompt && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md shadow">
          <p className="text-lg">
            {t('prompts.applyFiltersToViewData', {
              defaultValue: 'Please select filters to view monitoring data.',
            })}
          </p>
          {messageFromServer && ( // Display server messages here too if relevant
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              {messageFromServer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={<PageLoadingIndicator />}>
      <MonitoringPageContent />
    </Suspense>
  );
}

function PageLoadingIndicator() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-3 text-indigo-600 dark:text-indigo-400">
        Loading Page...
      </p>
    </div>
  );
}
