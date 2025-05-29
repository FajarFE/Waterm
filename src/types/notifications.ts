import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const idTelegramSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    telegram: z.string({
      required_error: t('notification.fields.telegram.validator'),
    }),
  });

export type IdTelegramSchema = z.infer<ReturnType<typeof idTelegramSchema>>;

export const whatappsSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    whatapps: z
      .string()
      .min(10, t('notification.fields.whatsapp.validator.min'))
      .max(13, t('notification.fields.whatsapp.validator.max'))
      .regex(
        /^08[0-9]{8,}$/,
        t('notification.fields.whatsapp.validator.format'),
      ),
  });

export type WhatappsSchema = z.infer<ReturnType<typeof whatappsSchema>>;
