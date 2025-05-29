// app/actions/monitoringActions.ts
'use server';
import { prisma } from '@skripsi/libs';

// Define types for the parameters based on your URL examples
interface DailyAverageParams {
  filterType: 'month'; // As per your example, "month" means daily averages in a date range
  limitId: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
}

interface MonthlyAverageParams {
  filterType: 'year'; // As per your example, "year" means monthly averages in a year/month range
  limitId: string;
  year: string; // YYYY
  monthFrom: string; // MM (1-12)
  monthTo: string; // MM (1-12)
}

// A union type for the function parameter
export type GetMonitoringDataParams = DailyAverageParams | MonthlyAverageParams;

// Define the expected output structure for aggregated data
export interface AggregatedDataPoint {
  period: string; // Date string (YYYY-MM-DD) or Month string (YYYY-MM)
  avgPH: number | null;
  avgTemperature: number | null;
  avgTurbidity: number | null;
  count: number;
}

export interface ServerActionResult {
  data: AggregatedDataPoint[] | null;
  error: string | null;
  message?: string;
}

export async function getMonitoringData(
  params: GetMonitoringDataParams,
): Promise<ServerActionResult> {
  try {
    if (!params.limitId) {
      return { data: null, error: 'limitId is required.' };
    }

    // 1. Find all monitoring setups linked to the given limitId
    const monitorings = await prisma.monitoring.findMany({
      where: {
        limitId: params.limitId,
      },
      select: {
        id: true, // We only need the IDs to filter DataMonitoring
      },
    });

    if (monitorings.length === 0) {
      return {
        data: [],
        error: null,
        message: 'No monitoring configurations found for the given limitId.',
      };
    }
    const monitoringIds = monitorings.map((m) => m.id);

    let startDate: Date;
    let endDate: Date;

    // 2. Determine date range based on filterType
    if (params.filterType === 'month') {
      // Daily averages for a date range
      if (!params.dateFrom || !params.dateTo) {
        return {
          data: null,
          error: "dateFrom and dateTo are required for filterType 'month'.",
        };
      }
      startDate = new Date(params.dateFrom);
      // Adjust endDate to include the entire day
      endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else if (params.filterType === 'year') {
      // Monthly averages for a year and month range
      if (!params.year || !params.monthFrom || !params.monthTo) {
        return {
          data: null,
          error:
            "year, monthFrom, and monthTo are required for filterType 'year'.",
        };
      }
      const year = parseInt(params.year);
      const monthFrom = parseInt(params.monthFrom); // 1-indexed (e.g., 3 for March)
      const monthTo = parseInt(params.monthTo); // 1-indexed (e.g., 12 for December)

      if (
        isNaN(year) ||
        isNaN(monthFrom) ||
        isNaN(monthTo) ||
        monthFrom < 1 ||
        monthFrom > 12 ||
        monthTo < 1 ||
        monthTo > 12 ||
        monthFrom > monthTo
      ) {
        return { data: null, error: 'Invalid year or month range.' };
      }

      // startDate: First day of the monthFrom (e.g., March 1, 2025)
      startDate = new Date(year, monthFrom - 1, 1); // Date month is 0-indexed

      // endDate: Last day of the monthTo (e.g., December 31, 2025)
      // We go to the first day of the month *after* monthTo, and then subtract a day.
      // For monthTo = 12 (December), we want monthTo + 1 = 13, which is January of the next year.
      // new Date(year, monthTo, 1) would be the 1st of the next month (0-indexed).
      // So, new Date(year, monthTo, 0) gives the last day of the *current* monthTo (0-indexed).
      // For 1-indexed monthTo, `new Date(year, monthTo, 0)` is correct for getting the last day of that month.
      endDate = new Date(year, monthTo, 0);
      endDate.setHours(23, 59, 59, 999); // Ensure it includes the entire last day
    } else {
      // This case should ideally not be hit if types are used correctly, but good for robustness
      return { data: null, error: 'Invalid filterType provided.' };
    }

    // 3. Fetch raw DataMonitoring records within the date range for the identified monitorings
    const rawData = await prisma.dataMonitoring.findMany({
      where: {
        monitoringId: {
          in: monitoringIds,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        PHWater: true,
        TemperatureWater: true,
        TurbidityWater: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc', // Important for chronological grouping if needed later
      },
    });

    if (rawData.length === 0) {
      return {
        data: [],
        error: null,
        message: 'No data found for the selected criteria.',
      };
    }

    // 4. Process and aggregate data in JavaScript
    const aggregatedResult: AggregatedDataPoint[] = [];

    if (params.filterType === 'month') {
      // Daily aggregation
      const dailyMap = new Map<
        string,
        { phSum: number; tempSum: number; turbSum: number; count: number }
      >();

      rawData.forEach((record) => {
        const dayKey = record.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

        let dayData = dailyMap.get(dayKey);
        if (!dayData) {
          dayData = { phSum: 0, tempSum: 0, turbSum: 0, count: 0 };
        }

        dayData.phSum += record.PHWater;
        dayData.tempSum += record.TemperatureWater;
        dayData.turbSum += record.TurbidityWater;
        dayData.count++;
        dailyMap.set(dayKey, dayData);
      });

      dailyMap.forEach((value, key) => {
        aggregatedResult.push({
          period: key,
          avgPH:
            value.count > 0
              ? parseFloat((value.phSum / value.count).toFixed(2))
              : null,
          avgTemperature:
            value.count > 0
              ? parseFloat((value.tempSum / value.count).toFixed(2))
              : null,
          avgTurbidity:
            value.count > 0
              ? parseFloat((value.turbSum / value.count).toFixed(2))
              : null,
          count: value.count,
        });
      });
      // Sort by date
      aggregatedResult.sort(
        (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
      );
    } else if (params.filterType === 'year') {
      // Monthly aggregation
      const monthlyMap = new Map<
        string,
        { phSum: number; tempSum: number; turbSum: number; count: number }
      >();

      rawData.forEach((record) => {
        // Corrected: Ensure monthKey is generated correctly to be YYYY-MM
        const year = record.createdAt.getFullYear();
        // getMonth() is 0-indexed, so add 1 to get 1-indexed month
        const month = (record.createdAt.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        const monthKey = `${year}-${month}`; // YYYY-MM

        let monthData = monthlyMap.get(monthKey);
        if (!monthData) {
          monthData = { phSum: 0, tempSum: 0, turbSum: 0, count: 0 };
        }

        monthData.phSum += record.PHWater;
        monthData.tempSum += record.TemperatureWater;
        monthData.turbSum += record.TurbidityWater;
        monthData.count++;
        monthlyMap.set(monthKey, monthData);
      });

      monthlyMap.forEach((value, key) => {
        aggregatedResult.push({
          period: key,
          avgPH:
            value.count > 0
              ? parseFloat((value.phSum / value.count).toFixed(2))
              : null,
          avgTemperature:
            value.count > 0
              ? parseFloat((value.tempSum / value.count).toFixed(2))
              : null,
          avgTurbidity:
            value.count > 0
              ? parseFloat((value.turbSum / value.count).toFixed(2))
              : null,
          count: value.count,
        });
      });
      // Sort by month
      aggregatedResult.sort(
        (a, b) =>
          new Date(a.period + '-01').getTime() -
          new Date(b.period + '-01').getTime(),
      );
    }

    return { data: aggregatedResult, error: null };
  } catch (error) {
    console.error('Error in getMonitoringData server action:', error);
    // Type guard for error
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    return { data: null, error: errorMessage };
  }
}
