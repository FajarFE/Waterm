import { z } from 'zod';

export const contactFormSchema = (
  t: ReturnType<typeof import('next-intl').useTranslations>,
) =>
  z.object({
    name: z.string().min(1, t('fields.name.validator')),
    email: z.string().min(1, t('fields.email.validator')),
    topic: z.string().min(1, t('fields.topic.validator')),
    priority: z.string().min(1, t('fields.priority.validator')),
    message: z.string().min(1, t('fields.message.validator')),
    attachments: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: t('fields.attachments.validator'),
      })
      .array()
      .optional(),
  });

export type ContactFormSchema = z.infer<ReturnType<typeof contactFormSchema>>;
