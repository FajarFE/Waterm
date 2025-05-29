export interface WaterQualityData {
  date: string;
  temperature: number | null;
  pH: number | null;
  turbidity: number | null;
}

export interface FetchResult {
  data?: WaterQualityData[];
  message?: string;
  error?: string;
}

export interface FilterState {
  filterType: string;
  year?: string;
  monthFrom?: string;
  monthTo?: string;
  dateFrom?: string;
  dateTo?: string;
  deviceCode?: string;
}

export const thresholds = {
  temperature: { min: 20, max: 28 },
  pH: { min: 6.5, max: 8.0 },
  TurbidityWater: { min: 0, max: 3.0 },
} as const;
