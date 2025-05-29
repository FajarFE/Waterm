import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const monitoringSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    nameMonitoring: z.string({
      required_error: t('monitoring.fields.nameMonitoring.validator'),
    }),
    limitId: z.string({
      required_error: t('monitoring.fields.limitId.validator'),
    }),
    locationDevice: z.string({
      required_error: t('monitoring.fields.locationDevice.validator'),
    }),
  });

export type MonitoringSchema = z.infer<ReturnType<typeof monitoringSchema>>;
