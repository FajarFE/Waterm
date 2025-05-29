import { z } from 'zod';

export const signInSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    email: z.string().email(t('fields.email.validator')),
    password: z
      .string()
      .min(8, t('fields.password.validator.min'))
      .regex(/[A-Z]/, t('fields.password.validator.uppercase'))
      .regex(/[a-z]/, t('fields.password.validator.lowercase'))
      .regex(/[0-9]/, t('fields.password.validator.number'))
      .regex(/[^A-Za-z0-9]/, t('fields.password.validator.special')),
    rememberMe: z.boolean().optional().default(false),
  });

export type SignInSchema = z.infer<ReturnType<typeof signInSchema>>;
