'use client';

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useSocket } from '@/contexts/SocketContext';
import type { Plugin } from 'chart.js';
import { useTranslations } from 'next-intl';

// Define the structure of the nested sensor data
interface DataSensor {
  temperatureWater: number;
  phWater: number;
  turbidityWater: number;
}

// Define the structure of the WebSocket reading
interface WebSocketReading {
  dataSensor: DataSensor;
  date: string | Date; // Assuming date can be string or Date object
  // Add other potential direct properties if they exist, e.g., deviceId: string;
}

// Update SensorMetricKey to be keys of DataSensor
// Ideally, DataSensor and WebSocketReading interfaces and this type should be in SocketContext.ts
export type SensorMetricKey = keyof DataSensor;

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

interface DeviceChartProps {
  deviceCode: string;
  label: string;
  dataKey: SensorMetricKey; // Changed from string to SensorMetricKey
  title: string;
  color?: string;
  limit?: number;
  minThreshold?: number;
  maxThreshold?: number;
  minThresholdLabel?: string;
  maxThresholdLabel?: string;
}

export const DeviceChart: React.FC<DeviceChartProps> = ({
  deviceCode,
  dataKey,
  label,
  title,
  color = 'rgb(75, 192, 192)',
  limit = 10, // Increased default limit for better visualization
  minThreshold,
  maxThreshold,
  minThresholdLabel = 'Min',
  maxThresholdLabel = 'Max',
}) => {
  const { isConnected, getChartData, lastReadings, debug } = useSocket();
  const [currentValue, setCurrentValue] = useState<number | string>('--');
  const [isBelowMin, setIsBelowMin] = useState(false);
  const [isAboveMax, setIsAboveMax] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const chartRef = useRef<ChartJS<'line', (number | string)[], string> | null>(
    null,
  );
  const t = useTranslations('dashboard.monitoring.monitoringDevice');

  // Get database save status for this device
  const dbStatus = debug.dbSaveStatus.get(deviceCode) || {
    status: 'idle',
    lastSaved: null,
  };

  // Format number to 1 decimal place
  const formatValue = (value: number | string): number | string => {
    if (typeof value === 'number') {
      return Number(value.toFixed(1));
    }
    return value;
  };

  // Effect to update current value from last readings
  useEffect(() => {
    console.log(`Checking last readings for device ${deviceCode}`);
    const lastReading = lastReadings.get(deviceCode) as
      | WebSocketReading
      | undefined; // Cast to WebSocketReading

    if (lastReading) {
      console.log('Last reading found:', lastReading);

      let value: number | string = '--';

      // Access data primarily through lastReading.dataSensor
      if (lastReading.dataSensor && dataKey in lastReading.dataSensor) {
        value = lastReading.dataSensor[dataKey];
        console.log(`Found value in dataSensor: ${value}`);
      } else {
        console.warn(
          `Could not find ${dataKey} in lastReading.dataSensor or directly in lastReading`,
          lastReading,
        );
      }

      // Format the value to 1 decimal place
      setCurrentValue(formatValue(value));

      // Set current date
      if (lastReading.date) {
        setCurrentDate(
          lastReading.date instanceof Date
            ? lastReading.date
            : new Date(lastReading.date),
        );
      }

      // Check if value is outside thresholds
      if (typeof value === 'number') {
        if (minThreshold !== undefined) {
          setIsBelowMin(value < minThreshold);
        }
        if (maxThreshold !== undefined) {
          setIsAboveMax(value > maxThreshold);
        }
      }
    } else {
      console.log(`No last reading found for device ${deviceCode}`);
    }
  }, [lastReadings, deviceCode, dataKey, minThreshold, maxThreshold]);

  // Get chart data with the specified limit
  const { labels, values: rawValues } = getChartData(
    deviceCode,
    dataKey,
    limit,
  );

  // Format all values to 1 decimal place
  const values = rawValues.map(formatValue);

  // Format the current date for display
  const formattedDate = currentDate
    ? `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`
    : '';

  // Format the last saved date for display
  const lastSavedDate = dbStatus.lastSaved
    ? `${dbStatus.lastSaved.toLocaleDateString()} ${dbStatus.lastSaved.toLocaleTimeString()}`
    : 'Never';

  // Determine if value is outside threshold range
  const isOutsideRange = isBelowMin || isAboveMax;

  // Get appropriate status text
  const getStatusText = () => {
    if (isBelowMin) return 'Too Low';
    if (isAboveMax) return 'Too High';
    return 'Normal';
  };

  // Create a plugin to draw the threshold areas with diagonal stripes
  const createThresholdPlugin = (): Plugin<'line'> => {
    return {
      id: 'thresholdPlugin',
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.y) return;
        const { top, bottom, left, right } = chartArea;

        // Only draw if thresholds are defined
        if (minThreshold === undefined && maxThreshold === undefined) return;

        // Calculate positions for thresholds on the chart
        const yMin =
          minThreshold !== undefined
            ? scales.y.getPixelForValue(minThreshold)
            : bottom;

        const yMax =
          maxThreshold !== undefined
            ? scales.y.getPixelForValue(maxThreshold)
            : top;

        // Create diagonal pattern for out-of-range areas
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        if (!patternContext) return;

        patternCanvas.width = 10;
        patternCanvas.height = 10;
        patternContext.fillStyle = 'rgba(0, 0, 0, 0)';
        patternContext.fillRect(0, 0, 10, 10);
        patternContext.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        patternContext.lineWidth = 1;
        patternContext.beginPath();
        patternContext.moveTo(0, 0);
        patternContext.lineTo(10, 10);
        patternContext.stroke();

        const pattern = ctx.createPattern(
          patternCanvas,
          'repeat',
        ) as CanvasPattern;
        if (!pattern) return;

        ctx.save();

        // Draw pattern for values above max threshold
        if (maxThreshold !== undefined && yMax > top && yMax < bottom) {
          ctx.fillStyle = pattern;
          ctx.fillRect(left, top, right - left, Math.min(yMax, bottom) - top);
        }

        // Draw pattern for values below min threshold
        if (minThreshold !== undefined && yMin < bottom && yMin > top) {
          ctx.fillStyle = pattern;
          ctx.fillRect(
            left,
            Math.max(yMin, top),
            right - left,
            bottom - Math.max(yMin, top),
          );
        }

        ctx.restore();
      },
    };
  };

  const createChartOptions = (): ChartOptions<'line'> => {
    // Calculate y-axis range with buffer
    const dataMin =
      values.length > 0
        ? Math.min(
            ...values.map((v) => (typeof v === 'number' ? v : 0)),
            minThreshold !== undefined
              ? minThreshold
              : Number.POSITIVE_INFINITY,
          )
        : minThreshold !== undefined
        ? minThreshold - 1
        : 0;

    const dataMax =
      values.length > 0
        ? Math.max(
            ...values.map((v) => (typeof v === 'number' ? v : 0)),
            maxThreshold !== undefined
              ? maxThreshold
              : Number.NEGATIVE_INFINITY,
          )
        : maxThreshold !== undefined
        ? maxThreshold + 1
        : 10;

    // Add buffer of about 10% of the range or at least 1 unit
    const buffer = Math.max(1, (dataMax - dataMin) * 0.1);
    const yMin = Math.max(0, dataMin - buffer); // Prevent negative if not needed
    const yMax = dataMax + buffer;

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500, // Faster animations for better performance
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: title,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const value = context.raw as number;
              const datasetLabel = context.dataset.label || '';

              if (
                datasetLabel.includes(minThresholdLabel) ||
                datasetLabel.includes(maxThresholdLabel)
              ) {
                return `${datasetLabel}: ${value.toFixed(1)}`;
              }

              const isOutOfRange =
                (minThreshold !== undefined && value < minThreshold) ||
                (maxThreshold !== undefined && value > maxThreshold);

              let label = `${datasetLabel}: ${value.toFixed(1)}`;
              if (isOutOfRange) {
                label += ' (Out of Range)';
              }

              return label;
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
                    borderDash: [5, 5],
                    label: {
                      content: minThresholdLabel,
                      display: true,
                      position: 'start',
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
                    borderDash: [5, 5],
                    label: {
                      content: maxThresholdLabel,
                      display: true,
                      position: 'start',
                    },
                  }
                : undefined,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: yMin,
          max: yMax,
          ticks: {
            // Format y-axis ticks to 1 decimal place
            callback: (value) =>
              typeof value === 'number' ? value.toFixed(1) : value,
          },
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    };
  };

  const createChartData = () => {
    // Format dates for labels if available
    const formattedLabels = labels.map((label: string | Date) => {
      if (label instanceof Date) {
        const dateLabel = label;
        return `${dateLabel.getHours()}:${dateLabel
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${dateLabel
          .getSeconds()
          .toString()
          .padStart(2, '0')}`;
      }
      return label;
    });

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: label,
          data: values,
          borderColor: color,
          backgroundColor: color.replace(')', ', 0.5)').replace('rgb', 'rgba'),
          tension: 0.1,
        },
        // Only add threshold lines if they are defined
        ...(minThreshold !== undefined
          ? [
              {
                label: minThresholdLabel,
                data: Array(labels.length).fill(minThreshold),
                borderColor: 'rgb(75, 192, 75)',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
              },
            ]
          : []),
        ...(maxThreshold !== undefined
          ? [
              {
                label: maxThresholdLabel,
                data: Array(labels.length).fill(maxThreshold),
                borderColor: 'rgb(255, 99, 71)',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
              },
            ]
          : []),
      ],
    };
  };

  const thresholdPlugin = createThresholdPlugin();

  // Force chart update when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [values, labels]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[400px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex flex-col items-end">
          <div
            className={`text-2xl font-bold ${
              isOutsideRange ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {currentValue}
            {isOutsideRange && (
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {getStatusText()}
              </span>
            )}
          </div>
          {minThreshold !== undefined && maxThreshold !== undefined && (
            <div className="text-xs text-gray-500">
              {t('range', {
                min: minThreshold.toFixed(1),
                max: maxThreshold.toFixed(1),
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        {currentDate && (
          <div className="text-xs text-gray-500">
            Last updated: {formattedDate}
          </div>
        )}
        <div className="text-xs">
          {dbStatus.status === 'saving' && (
            <span className="text-blue-500">Saving to DB...</span>
          )}
          {dbStatus.status === 'success' && (
            <span className="text-green-500">Last saved: {lastSavedDate}</span>
          )}
          {dbStatus.status === 'error' && (
            <span className="text-red-500">Error saving to DB</span>
          )}
        </div>
      </div>
      {isConnected ? (
        <div className="h-[300px]">
          {values.length > 0 ? (
            <Line
              ref={chartRef}
              data={createChartData()}
              options={createChartOptions()}
              plugins={[thresholdPlugin]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available for this device yet
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          Connecting to server...
        </div>
      )}

      {/* Debug section - remove in production */}
      {/* <div className="mt-2 text-xs text-gray-400 border-t pt-2">
        <div>
          Device: {deviceCode} | Data Key: {dataKey}
        </div>
        <div>DB Status: {dbStatus.status}</div>
        <div>Last Saved: {lastSavedDate}</div>
      </div> */}
    </div>
  );
};
