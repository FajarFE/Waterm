import { z } from 'zod';

export const registerSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z
    .object({
      name: z.string().min(2, t('fields.name.validator')),
      email: z.string().email(t('fields.email.validator')),

      noWhatsapp: z
        .string()
        .min(10, t('fields.noWhatsapp.validator.min'))
        .max(13, t('fields.noWhatsapp.validator.max'))
        .regex(/^08[0-9]{8,}$/, t('fields.noWhatsapp.validator.format')),
      idTelegram: z.string().optional(),
      password: z
        .string()
        .min(8, t('fields.password.validator.min'))
        .regex(/[A-Z]/, t('fields.password.validator.uppercase'))
        .regex(/[a-z]/, t('fields.password.validator.lowercase'))
        .regex(/[0-9]/, t('fields.password.validator.number'))
        .regex(/[^A-Za-z0-9]/, t('fields.password.validator.special')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('fields.confirmPassword.validator'),
      path: ['confirmPassword'],
    });

export type RegisterSchema = z.infer<ReturnType<typeof registerSchema>>;
