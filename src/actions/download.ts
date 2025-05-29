'use server';

import ExcelJS from 'exceljs'; // Ensure this is exceljs version 4.x.x or higher
import { prisma } from '@skripsi/libs';

// --- TYPE DEFINITIONS (assuming these are unchanged from previous correct version) ---
interface BaseExcelParams {
  limitId: string;
  excelMinPh?: number;
  excelMaxPh?: number;
  excelMinTemperature?: number;
  excelMaxTemperature?: number;
  excelMinTurbidity?: number;
  excelMaxTurbidity?: number;
}

interface DailyAverageParamsForExcel extends BaseExcelParams {
  filterType: 'month'; // 'month' now means a date range, leading to monthly then daily averages
  dateFrom: string;
  dateTo: string;
}

interface MonthlyAverageParamsForExcel extends BaseExcelParams {
  filterType: 'year'; // 'year' here means a year and month-range, leading to monthly averages
  year: string;
  monthFrom: string;
  monthTo: string;
}

export type DownloadExcelParams =
  | DailyAverageParamsForExcel
  | MonthlyAverageParamsForExcel;

interface DataMonitoringRecord {
  id: string;
  PHWater: number;
  TemperatureWater: number;
  TurbidityWater: number;
  createdAt: Date;
  monitoringId: string;
}

interface InternalAggregatedDataPoint {
  period: string; // YYYY-MM-DD or YYYY-MM
  avgPH: number | null;
  avgTemperature: number | null;
  avgTurbidity: number | null;
  count: number;
}

interface ExcelChartOptions {
  title: {
    text: string;
    font: { size: number; bold: boolean };
  };
  type: 'line';
  style: 'standard';
  anchor: {
    type: 'twoCellAnchor';
    from: {
      col: number;
      row: number;
      colOff: number;
      rowOff: number;
    };
    to: {
      col: number;
      row: number;
      colOff: number;
      rowOff: number;
    };
  };
  series: Array<{
    name: string;
    data: { categories: string; values: string };
    categories: string;
    line?: {
      color: { argb: string };
      dash: 'dash';
    };
    marker?: { style: 'none' };
  }>;
  xAxis: { title: { text: string; font: { bold: boolean } } };
  yAxis: { title: { text: string; font: { bold: boolean } } };
  legend: { position: 'bottom' };
}

// --- HELPER FUNCTIONS (getLimitStatus, getChartDataReferences, addLineChartWithThresholds - assumed correct from previous versions) ---
function getLimitStatus(
  value: number | null,
  min?: number,
  max?: number,
): string {
  if (value === null || value === undefined) return 'N/A';
  const numMin = typeof min === 'number' && !isNaN(min) ? min : undefined;
  const numMax = typeof max === 'number' && !isNaN(max) ? max : undefined;

  if (numMin !== undefined && value < numMin)
    return `Below Limit (< ${numMin})`;
  if (numMax !== undefined && value > numMax)
    return `Above Limit (> ${numMax})`;
  return 'Normal';
}

function getChartDataReferences(
  sheetName: string,
  categoryColumnLetter: string,
  valueColumnLetter: string,
  firstDataRow: number,
  lastDataRow: number,
): { categories: string; values: string } {
  const safeSheetName = `'${sheetName.replace(/'/g, "''")}'`;
  return {
    categories: `${safeSheetName}!$${categoryColumnLetter}$${firstDataRow}:$${categoryColumnLetter}$${lastDataRow}`,
    values: `${safeSheetName}!$${valueColumnLetter}$${firstDataRow}:$${valueColumnLetter}$${lastDataRow}`,
  };
}

function addLineChartWithThresholds(
  worksheet: ExcelJS.Worksheet,
  chartTitle: string,
  categoryColumnLetter: string,
  valueColumnLetter: string,
  minThresholdColumnLetter: string,
  maxThresholdColumnLetter: string,
  firstDataRow: number,
  lastDataRow: number,
  xAxisTitle: string,
  yAxisTitle: string,
  chartAnchorTopLeftCol: number,
  chartAnchorTopLeftRow: number,
  mainSeriesName: string,
  minThresholdSeriesName: string,
  maxThresholdSeriesName: string,
) {
  if (firstDataRow > lastDataRow) {
    console.warn(
      `Skipping chart "${chartTitle}" due to no data rows (first: ${firstDataRow}, last: ${lastDataRow}) on sheet ${worksheet.name}`,
    );
    return;
  }

  const chartData = getChartDataReferences(
    worksheet.name,
    categoryColumnLetter,
    valueColumnLetter,
    firstDataRow,
    lastDataRow,
  );
  const minThresholdData = getChartDataReferences(
    worksheet.name,
    categoryColumnLetter,
    minThresholdColumnLetter,
    firstDataRow,
    lastDataRow,
  );
  const maxThresholdData = getChartDataReferences(
    worksheet.name,
    categoryColumnLetter,
    maxThresholdColumnLetter,
    firstDataRow,
    lastDataRow,
  );

  try {
    (
      worksheet as unknown as { addChart(opt: ExcelChartOptions): void }
    ).addChart({
      title: { text: chartTitle, font: { size: 14, bold: true } },
      type: 'line',
      style: 'standard',
      anchor: {
        type: 'twoCellAnchor',
        from: {
          col: chartAnchorTopLeftCol,
          row: chartAnchorTopLeftRow,
          colOff: 0,
          rowOff: 0,
        },
        to: {
          col: chartAnchorTopLeftCol + 7,
          row: chartAnchorTopLeftRow + 15,
          colOff: 0,
          rowOff: 0,
        },
      },
      series: [
        {
          name: mainSeriesName,
          data: chartData,
          categories: chartData.categories,
        },
        {
          name: minThresholdSeriesName,
          data: minThresholdData,
          categories: minThresholdData.categories,
          line: { color: { argb: 'FFFF0000' }, dash: 'dash' },
          marker: { style: 'none' },
        },
        {
          name: maxThresholdSeriesName,
          data: maxThresholdData,
          categories: maxThresholdData.categories,
          line: { color: { argb: 'FF00B050' }, dash: 'dash' },
          marker: { style: 'none' },
        },
      ],
      xAxis: { title: { text: xAxisTitle, font: { bold: true } } },
      yAxis: { title: { text: yAxisTitle, font: { bold: true } } },
      legend: { position: 'bottom' },
    });
  } catch (e) {
    console.error(
      `Error adding chart "${chartTitle}" to sheet "${worksheet.name}":`,
      e,
    );
  }
}

// --- Constants for Sheet Layout ---
const LIMIT_INFO_START_ROW = 1;
const LIMIT_INFO_START_COL_INDEX = 16; // Column P
const LIMIT_INFO_COLS_COUNT = 3;
const MAIN_TABLE_HEADER_ROW = 1; // Row 7
const MAIN_TABLE_FIRST_DATA_ROW = MAIN_TABLE_HEADER_ROW + 1; // Row 8

// --- HELPER: Month Name ---
function getMonthName(
  yearStr: string,
  monthNumStr: string,
  locale: string = 'id-ID',
): string {
  const monthNumber = parseInt(monthNumStr);
  const yearNumber = parseInt(yearStr);
  if (
    isNaN(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    isNaN(yearNumber)
  ) {
    return monthNumStr;
  }
  const date = new Date(yearNumber, monthNumber - 1, 1);
  return date.toLocaleString(locale, { month: 'long' });
}

// --- NEW HELPER: Month Range Name ---
function getMonthRangeName(
  startDate: Date,
  endDate: Date,
  locale: string = 'id-ID',
): string {
  const startMonthName = startDate.toLocaleString(locale, { month: 'short' }); // Using 'short' for brevity in sheet names
  const startYear = startDate.getFullYear();
  const endMonthName = endDate.toLocaleString(locale, { month: 'short' });
  const endYear = endDate.getFullYear();

  if (startYear === endYear) {
    if (startMonthName === endMonthName) {
      return `${startMonthName} ${startYear}`;
    }
    return `${startMonthName}-${endMonthName} ${startYear}`;
  }
  return `${startMonthName} ${startYear}-${endMonthName} ${endYear}`;
}

// --- HELPER: Setup for Aggregated Data Sheets (Daily/Monthly) ---
function setupAggregatedSheet(
  sheet: ExcelJS.Worksheet,
  periodColumnHeader: string,
  limitConfig: {
    minPh?: number;
    maxPh?: number;
    minTemp?: number;
    maxTemp?: number;
    minTurb?: number;
    maxTurb?: number;
  },
) {
  const limitTitleCell = sheet.getCell(
    LIMIT_INFO_START_ROW,
    LIMIT_INFO_START_COL_INDEX,
  );
  limitTitleCell.value = 'Limit Configuration Applied for this Report:';
  limitTitleCell.font = { bold: true, size: 13 };
  sheet.mergeCells(
    LIMIT_INFO_START_ROW,
    LIMIT_INFO_START_COL_INDEX,
    LIMIT_INFO_START_ROW,
    LIMIT_INFO_START_COL_INDEX + LIMIT_INFO_COLS_COUNT - 1,
  );

  const limitHeaderRowIndex = LIMIT_INFO_START_ROW + 1;
  const limitHeaderRowObj = sheet.getRow(limitHeaderRowIndex);
  limitHeaderRowObj.getCell(LIMIT_INFO_START_COL_INDEX).value = 'Parameter';
  limitHeaderRowObj.getCell(LIMIT_INFO_START_COL_INDEX + 1).value = 'Min Value';
  limitHeaderRowObj.getCell(LIMIT_INFO_START_COL_INDEX + 2).value = 'Max Value';
  limitHeaderRowObj.font = { bold: true };
  for (let i = 0; i < LIMIT_INFO_COLS_COUNT; i++) {
    const cell = limitHeaderRowObj.getCell(LIMIT_INFO_START_COL_INDEX + i);
    if (cell) cell.alignment = { horizontal: 'center' };
  }

  const limitDataStartRowIndex = limitHeaderRowIndex + 1;
  sheet.getCell(limitDataStartRowIndex, LIMIT_INFO_START_COL_INDEX).value =
    'pH';
  sheet.getCell(limitDataStartRowIndex, LIMIT_INFO_START_COL_INDEX + 1).value =
    limitConfig.minPh;
  sheet.getCell(limitDataStartRowIndex, LIMIT_INFO_START_COL_INDEX + 2).value =
    limitConfig.maxPh;
  sheet.getCell(limitDataStartRowIndex + 1, LIMIT_INFO_START_COL_INDEX).value =
    'Temperature (°C)';
  sheet.getCell(
    limitDataStartRowIndex + 1,
    LIMIT_INFO_START_COL_INDEX + 1,
  ).value = limitConfig.minTemp;
  sheet.getCell(
    limitDataStartRowIndex + 1,
    LIMIT_INFO_START_COL_INDEX + 2,
  ).value = limitConfig.maxTemp;
  sheet.getCell(limitDataStartRowIndex + 2, LIMIT_INFO_START_COL_INDEX).value =
    'Turbidity (NTU)';
  sheet.getCell(
    limitDataStartRowIndex + 2,
    LIMIT_INFO_START_COL_INDEX + 1,
  ).value = limitConfig.minTurb;
  sheet.getCell(
    limitDataStartRowIndex + 2,
    LIMIT_INFO_START_COL_INDEX + 2,
  ).value = limitConfig.maxTurb;

  const mainTableColumnConfigs = [
    { key: 'period', header: periodColumnHeader, width: 18 },
    { key: 'avgPH', header: 'Avg. pH', width: 12, style: { numFmt: '0.00' } },
    { key: 'phStatus', header: 'pH Status', width: 22 },
    {
      key: 'minPHT',
      header: 'Min pH Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    {
      key: 'maxPHT',
      header: 'Max pH Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    {
      key: 'avgTemp',
      header: 'Avg. Temp (°C)',
      width: 15,
      style: { numFmt: '0.00' },
    },
    { key: 'tempStatus', header: 'Temp Status', width: 22 },
    {
      key: 'minTempT',
      header: 'Min Temp Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    {
      key: 'maxTempT',
      header: 'Max Temp Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    {
      key: 'avgTurb',
      header: 'Avg. Turb (NTU)',
      width: 15,
      style: { numFmt: '0.00' },
    },
    { key: 'turbStatus', header: 'Turb Status', width: 22 },
    {
      key: 'minTurbT',
      header: 'Min Turb Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    {
      key: 'maxTurbT',
      header: 'Max Turb Th.',
      width: 12,
      style: { numFmt: '0.00##;-0.00##;-' },
    },
    { key: 'count', header: 'Data Points', width: 12 },
  ];
  mainTableColumnConfigs.forEach((colConfig, index) => {
    const col = sheet.getColumn(index + 1);
    col.key = colConfig.key;
    col.width = colConfig.width;
    if (colConfig.style) col.style = colConfig.style;
  });
  const mainTableHeaderActualRow = sheet.getRow(MAIN_TABLE_HEADER_ROW);
  mainTableColumnConfigs.forEach((colConfig, index) => {
    mainTableHeaderActualRow.getCell(index + 1).value = colConfig.header;
  });
  mainTableHeaderActualRow.font = { bold: true };
  mainTableHeaderActualRow.eachCell((cell) => {
    if (cell) cell.alignment = { horizontal: 'center' };
  });
}

// --- MAIN ACTION FUNCTION ---
export async function downloadMonitoringExcel(
  params: DownloadExcelParams,
): Promise<{
  success: boolean;
  error?: string;
  fileName?: string;
  fileBufferB64?: string;
}> {
  console.log(
    'downloadMonitoringExcel received params:',
    JSON.stringify(params, null, 2),
  );

  try {
    if (!params.limitId)
      return { success: false, error: 'limitId is required.' };
    const dbLimitData = await prisma.limitation.findUnique({
      where: { id: params.limitId },
    });
    if (!dbLimitData)
      return {
        success: false,
        error: `Limit configuration with ID ${params.limitId} not found.`,
      };

    const effectiveLimits = {
      minPh: params.excelMinPh ?? dbLimitData.minPh,
      maxPh: params.excelMaxPh ?? dbLimitData.maxPh,
      minTemp: params.excelMinTemperature ?? dbLimitData.minTemperature,
      maxTemp: params.excelMaxTemperature ?? dbLimitData.maxTemperature,
      minTurb: params.excelMinTurbidity ?? dbLimitData.minTurbidity,
      maxTurb: params.excelMaxTurbidity ?? dbLimitData.maxTurbidity,
    };

    const monitorings = await prisma.monitoring.findMany({
      where: { limitId: params.limitId },
      select: { id: true },
    });
    if (monitorings.length === 0)
      return {
        success: false,
        error: 'No monitoring configurations found for this limitId.',
      };
    const monitoringIds = monitorings.map((m) => m.id);

    let startDate: Date, endDate: Date;
    let fileNameBase = `monitoring_data_${params.limitId}`;
    let reportRangeNameForCharts: string = ''; // For chart titles

    if (params.filterType === 'month') {
      if (!params.dateFrom || !params.dateTo)
        return {
          success: false,
          error: "Date range required for 'month' filter.",
        };
      startDate = new Date(params.dateFrom);
      endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999);
      fileNameBase += `_range_${params.dateFrom}_to_${params.dateTo}`; // Changed from _daily_
      reportRangeNameForCharts = getMonthRangeName(startDate, endDate);
    } else if (params.filterType === 'year') {
      if (!params.year || !params.monthFrom || !params.monthTo)
        return { success: false, error: 'Year and month range required.' };
      const yearNum = parseInt(params.year);
      const monthFromNum = parseInt(params.monthFrom);
      const monthToNum = parseInt(params.monthTo);
      startDate = new Date(yearNum, monthFromNum - 1, 1);
      endDate = new Date(yearNum, monthToNum, 0, 23, 59, 59, 999);
      const monthNameFrom = getMonthName(params.year, params.monthFrom);
      const monthNameTo = getMonthName(params.year, params.monthTo);
      fileNameBase += `_monthly_${params.year}_${monthNameFrom}-${monthNameTo}`;
      reportRangeNameForCharts = `${monthNameFrom}-${monthNameTo} ${params.year}`;
    } else {
      return { success: false, error: 'Invalid filterType.' };
    }

    const allRawDataInRange: DataMonitoringRecord[] =
      await prisma.dataMonitoring.findMany({
        where: {
          monitoringId: { in: monitoringIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          PHWater: true,
          TemperatureWater: true,
          TurbidityWater: true,
          createdAt: true,
          monitoringId: true,
        },
      });

    if (allRawDataInRange.length === 0)
      return {
        success: false,
        error: 'No data found for the selected criteria.',
      };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Monitoring System';
    workbook.created = new Date();
    const sanitizeSheetName = (name: string) =>
      name.replace(/[\[\]\*\/\\\?\:]/g, '').substring(0, 31);

    // Common logic for monthly aggregates (Sheet 1)
    const monthlyAggregatesMap = new Map<
      string,
      { phSum: number; tempSum: number; turbSum: number; count: number }
    >();
    allRawDataInRange.forEach((r) => {
      const key = r.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const d = monthlyAggregatesMap.get(key) || {
        phSum: 0,
        tempSum: 0,
        turbSum: 0,
        count: 0,
      };
      d.phSum += r.PHWater;
      d.tempSum += r.TemperatureWater;
      d.turbSum += r.TurbidityWater;
      d.count++;
      monthlyAggregatesMap.set(key, d);
    });
    const monthlyAggregates: InternalAggregatedDataPoint[] = [];
    monthlyAggregatesMap.forEach((val, key) =>
      monthlyAggregates.push({
        period: key,
        avgPH:
          val.count > 0 ? parseFloat((val.phSum / val.count).toFixed(2)) : null,
        avgTemperature:
          val.count > 0
            ? parseFloat((val.tempSum / val.count).toFixed(2))
            : null,
        avgTurbidity:
          val.count > 0
            ? parseFloat((val.turbSum / val.count).toFixed(2))
            : null,
        count: val.count,
      }),
    );
    monthlyAggregates.sort((a, b) => a.period.localeCompare(b.period));

    // --- Sheet 1: Monthly Averages ---
    let firstSheetNameSuffix = '';
    if (params.filterType === 'year') {
      const monthNameFrom = getMonthName(params.year, params.monthFrom);
      const monthNameTo = getMonthName(params.year, params.monthTo);
      firstSheetNameSuffix = `${monthNameFrom}-${monthNameTo} ${params.year}`;
    } else {
      // params.filterType === 'month' (date range)
      firstSheetNameSuffix = getMonthRangeName(
        new Date(params.dateFrom),
        new Date(params.dateTo),
      );
    }
    const overallMonthlySheetName = sanitizeSheetName(
      `Monthly Avgs ${firstSheetNameSuffix}`,
    );
    const overallMonthlySheet = workbook.addWorksheet(overallMonthlySheetName);
    setupAggregatedSheet(
      overallMonthlySheet,
      'Month (YYYY-MM)',
      effectiveLimits,
    );

    monthlyAggregates.forEach((agg) =>
      overallMonthlySheet.addRow({
        period: agg.period,
        avgPH: agg.avgPH,
        phStatus: getLimitStatus(
          agg.avgPH,
          effectiveLimits.minPh,
          effectiveLimits.maxPh,
        ),
        minPHT: effectiveLimits.minPh,
        maxPHT: effectiveLimits.maxPh,
        avgTemp: agg.avgTemperature,
        tempStatus: getLimitStatus(
          agg.avgTemperature,
          effectiveLimits.minTemp,
          effectiveLimits.maxTemp,
        ),
        minTempT: effectiveLimits.minTemp,
        maxTempT: effectiveLimits.maxTemp,
        avgTurb: agg.avgTurbidity,
        turbStatus: getLimitStatus(
          agg.avgTurbidity,
          effectiveLimits.minTurb,
          effectiveLimits.maxTurb,
        ),
        minTurbT: effectiveLimits.minTurb,
        maxTurbT: effectiveLimits.maxTurb,
        count: agg.count,
      }),
    );

    if (monthlyAggregates.length > 0) {
      const lastDataRow =
        MAIN_TABLE_FIRST_DATA_ROW + monthlyAggregates.length - 1;
      let chartStartRow = lastDataRow + 3;
      const chartTitleSuffix =
        params.filterType === 'year' ? params.year : reportRangeNameForCharts;
      addLineChartWithThresholds(
        overallMonthlySheet,
        `Monthly Avg. pH - ${chartTitleSuffix}`,
        'A',
        'B',
        'D',
        'E',
        MAIN_TABLE_FIRST_DATA_ROW,
        lastDataRow,
        'Month',
        'pH',
        1,
        chartStartRow,
        'Avg. pH',
        `Min pH (${effectiveLimits.minPh ?? 'N/A'})`,
        `Max pH (${effectiveLimits.maxPh ?? 'N/A'})`,
      );
      addLineChartWithThresholds(
        overallMonthlySheet,
        `Monthly Avg. Temp - ${chartTitleSuffix}`,
        'A',
        'F',
        'H',
        'I',
        MAIN_TABLE_FIRST_DATA_ROW,
        lastDataRow,
        'Month',
        'Temp (°C)',
        9,
        chartStartRow,
        'Avg. Temp',
        `Min Temp (${effectiveLimits.minTemp ?? 'N/A'})`,
        `Max Temp (${effectiveLimits.maxTemp ?? 'N/A'})`,
      );
      chartStartRow += 18;
      addLineChartWithThresholds(
        overallMonthlySheet,
        `Monthly Avg. Turbidity - ${chartTitleSuffix}`,
        'A',
        'J',
        'L',
        'M',
        MAIN_TABLE_FIRST_DATA_ROW,
        lastDataRow,
        'Month',
        'Turb (NTU)',
        1,
        chartStartRow,
        'Avg. Turbidity',
        `Min Turb (${effectiveLimits.minTurb ?? 'N/A'})`,
        `Max Turb (${effectiveLimits.maxTurb ?? 'N/A'})`,
      );
    }

    // --- Subsequent Sheets: Daily Averages for each relevant month ---
    const uniqueMonthsInData = Array.from(
      new Set(
        allRawDataInRange.map((r) => r.createdAt.toISOString().substring(0, 7)),
      ),
    ).sort();

    let relevantMonthsForDailySheets: string[] = [];
    if (params.filterType === 'year') {
      const fromMonthNum = parseInt(params.monthFrom);
      const toMonthNum = parseInt(params.monthTo);
      relevantMonthsForDailySheets = uniqueMonthsInData.filter((monthKey) => {
        const [yearStr, monthNumStr] = monthKey.split('-');
        const currentMonthNum = parseInt(monthNumStr);
        return (
          yearStr === params.year &&
          currentMonthNum >= fromMonthNum &&
          currentMonthNum <= toMonthNum
        );
      });
    } else {
      // params.filterType === 'month'
      relevantMonthsForDailySheets = uniqueMonthsInData; // All months with data in the range are relevant
    }

    for (const monthKey of relevantMonthsForDailySheets) {
      // monthKey is YYYY-MM
      const [yearStrFromData, monthNumStrFromData] = monthKey.split('-');
      const currentMonthName = getMonthName(
        yearStrFromData,
        monthNumStrFromData,
      );
      const dailyAvgSheetName = sanitizeSheetName(
        `Daily Avgs ${currentMonthName} ${yearStrFromData}`,
      );
      const dailyAvgSheetForMonth = workbook.addWorksheet(dailyAvgSheetName);
      setupAggregatedSheet(
        dailyAvgSheetForMonth,
        'Date (YYYY-MM-DD)',
        effectiveLimits,
      );

      const dailyDataForThisMonth = allRawDataInRange.filter(
        (r) => r.createdAt.toISOString().substring(0, 7) === monthKey,
      );
      const dailyAggregatesMap = new Map<
        string,
        { phSum: number; tempSum: number; turbSum: number; count: number }
      >();
      dailyDataForThisMonth.forEach((r) => {
        const dayKey = r.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        const d = dailyAggregatesMap.get(dayKey) || {
          phSum: 0,
          tempSum: 0,
          turbSum: 0,
          count: 0,
        };
        d.phSum += r.PHWater;
        d.tempSum += r.TemperatureWater;
        d.turbSum += r.TurbidityWater;
        d.count++;
        dailyAggregatesMap.set(dayKey, d);
      });

      const dailyAggregates: InternalAggregatedDataPoint[] = [];
      dailyAggregatesMap.forEach((val, key) =>
        dailyAggregates.push({
          period: key,
          avgPH:
            val.count > 0
              ? parseFloat((val.phSum / val.count).toFixed(2))
              : null,
          avgTemperature:
            val.count > 0
              ? parseFloat((val.tempSum / val.count).toFixed(2))
              : null,
          avgTurbidity:
            val.count > 0
              ? parseFloat((val.turbSum / val.count).toFixed(2))
              : null,
          count: val.count,
        }),
      );
      dailyAggregates.sort((a, b) => a.period.localeCompare(b.period));

      dailyAggregates.forEach((agg) =>
        dailyAvgSheetForMonth.addRow({
          period: agg.period,
          avgPH: agg.avgPH,
          phStatus: getLimitStatus(
            agg.avgPH,
            effectiveLimits.minPh,
            effectiveLimits.maxPh,
          ),
          minPHT: effectiveLimits.minPh,
          maxPHT: effectiveLimits.maxPh,
          avgTemp: agg.avgTemperature,
          tempStatus: getLimitStatus(
            agg.avgTemperature,
            effectiveLimits.minTemp,
            effectiveLimits.maxTemp,
          ),
          minTempT: effectiveLimits.minTemp,
          maxTempT: effectiveLimits.maxTemp,
          avgTurb: agg.avgTurbidity,
          turbStatus: getLimitStatus(
            agg.avgTurbidity,
            effectiveLimits.minTurb,
            effectiveLimits.maxTurb,
          ),
          minTurbT: effectiveLimits.minTurb,
          maxTurbT: effectiveLimits.maxTurb,
          count: agg.count,
        }),
      );

      if (dailyAggregates.length > 0) {
        const lastDataRow =
          MAIN_TABLE_FIRST_DATA_ROW + dailyAggregates.length - 1;
        let chartStartRow = lastDataRow + 3;
        const chartTitle = `${currentMonthName} ${yearStrFromData}`;
        addLineChartWithThresholds(
          dailyAvgSheetForMonth,
          `Daily Avg. pH - ${chartTitle}`,
          'A',
          'B',
          'D',
          'E',
          MAIN_TABLE_FIRST_DATA_ROW,
          lastDataRow,
          'Date',
          'pH',
          1,
          chartStartRow,
          'Avg. pH',
          `Min pH (${effectiveLimits.minPh ?? 'N/A'})`,
          `Max pH (${effectiveLimits.maxPh ?? 'N/A'})`,
        );
        addLineChartWithThresholds(
          dailyAvgSheetForMonth,
          `Daily Avg. Temp - ${chartTitle}`,
          'A',
          'F',
          'H',
          'I',
          MAIN_TABLE_FIRST_DATA_ROW,
          lastDataRow,
          'Date',
          'Temp (°C)',
          9,
          chartStartRow,
          'Avg. Temp',
          `Min Temp (${effectiveLimits.minTemp ?? 'N/A'})`,
          `Max Temp (${effectiveLimits.maxTemp ?? 'N/A'})`,
        );
        chartStartRow += 18;
        addLineChartWithThresholds(
          dailyAvgSheetForMonth,
          `Daily Avg. Turbidity - ${chartTitle}`,
          'A',
          'J',
          'L',
          'M',
          MAIN_TABLE_FIRST_DATA_ROW,
          lastDataRow,
          'Date',
          'Turb (NTU)',
          1,
          chartStartRow,
          'Avg. Turbidity',
          `Min Turb (${effectiveLimits.minTurb ?? 'N/A'})`,
          `Max Turb (${effectiveLimits.maxTurb ?? 'N/A'})`,
        );
      }
    }
    // NO LONGER GENERATING RAW DATA SHEETS FOR filterType === 'month'

    const buffer = await workbook.xlsx.writeBuffer();
    const fileBufferB64 = Buffer.from(buffer).toString('base64');
    return { success: true, fileName: `${fileNameBase}.xlsx`, fileBufferB64 };
  } catch (error: unknown) {
    console.error('Error generating Excel file with charts:', error);
    const msg =
      error instanceof Error
        ? error.message
        : 'Unknown server error during Excel generation.';
    return { success: false, error: msg };
  }
}
