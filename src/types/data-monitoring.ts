import { z } from 'zod';

export const DataMonitoringSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    phWater: z.number({
      required_error: t('dataMonitoring.fields.validator.phWater'),
    }),
    TemperatureWater: z.number({
      required_error: t('dataMonitoring.fields.validator.TemperatureWater'),
    }),
    TurbidityWater: z.number({
      required_error: t('dataMonitoring.fields.validator.TurbidityWater'),
    }),
  });

export type DataMonitoringSchema = z.infer<
  ReturnType<typeof DataMonitoringSchema>
>;
