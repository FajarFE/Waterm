'use client';

import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Plugin } from 'chart.js';

interface WaterQualityChartProps {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
  plugins: Plugin<'line'>[];
}

export function WaterQualityChart({
  data,
  options,
  plugins,
}: WaterQualityChartProps) {
  return (
    <div className="border border-slate-500 rounded-lg p-4 h-[400px] md:h-[500px] lg:h-[400px]">
      <Line options={options} data={data} plugins={plugins} />
    </div>
  );
}
