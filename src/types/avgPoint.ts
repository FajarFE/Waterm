// Can be in a shared types file or defined where needed
export interface AggregatedDataPoint {
  period: string; // Date string (YYYY-MM-DD) or Month string (YYYY-MM)
  avgPH: number | null;
  avgTemperature: number | null;
  avgTurbidity: number | null;
  count: number;
}

// Define the keys we can plot from AggregatedDataPoint
export type AggregatedMetricKey = 'avgPH' | 'avgTemperature' | 'avgTurbidity';
