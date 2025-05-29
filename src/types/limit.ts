import { useTranslations } from 'next-intl';
import { z } from 'zod';

enum CategoryFish {
  Lele = 'Lele',
  Gurame = 'Gurame',
  Arwana = 'Arwana',
}

// Helper function to create a number field schema
const createNumberFieldSchema = (errorMessages: {
  required: string;
  number: string;
}) => {
  return z.preprocess(
    // First preprocess to handle null/undefined and convert to string
    (val) => (val === null || val === undefined ? '' : String(val)),
    // Then validate as string and convert to number
    z
      .string()
      .min(1, { message: errorMessages.required })
      .transform((val) => {
        const parsed = Number(val);
        return isNaN(parsed) ? undefined : parsed;
      })
      .refine((val) => val !== undefined, { message: errorMessages.number }),
  );
};

export const limitationSchema = (t: ReturnType<typeof useTranslations>) => {
  return z
    .object({
      name: z.string({
        required_error: t('limitations.fields.name.validator'),
      }),
      category: z.nativeEnum(CategoryFish, {
        required_error: t('limitations.fields.name.validator'),
      }),
      maxPh: createNumberFieldSchema({
        required: t('limitations.fields.maxPh.validator.isRequired'),
        number: t('limitations.fields.maxPh.validator.isNumber'),
      }),
      minPh: createNumberFieldSchema({
        required: t('limitations.fields.minPh.validator.isRequired'),
        number: t('limitations.fields.minPh.validator.isNumber'),
      }),
      maxTemperature: createNumberFieldSchema({
        required: t('limitations.fields.maxTemperature.validator.isRequired'),
        number: t('limitations.fields.maxTemperature.validator.isNumber'),
      }),
      minTemperature: createNumberFieldSchema({
        required: t('limitations.fields.minTemperature.validator.isRequired'),
        number: t('limitations.fields.minTemperature.validator.isNumber'),
      }),
      maxTurbidity: createNumberFieldSchema({
        required: t('limitations.fields.maxTurbidity.validator.isRequired'),
        number: t('limitations.fields.maxTurbidity.validator.isNumber'),
      }),
      minTurbidity: createNumberFieldSchema({
        required: t('limitations.fields.minTurbidity.validator.isRequired'),
        number: t('limitations.fields.minTurbidity.validator.isNumber'),
      }),
    })
    .refine((data) => data.maxPh >= data.minPh, {
      message: t('limitations.fields.maxPh.validator.refine'),
      path: ['maxPh'],
    })
    .refine((data) => data.maxTemperature >= data.minTemperature, {
      message: t('limitations.fields.maxTemperature.validator.refine'),
      path: ['maxTemperature'],
    })
    .refine((data) => data.maxTurbidity >= data.minTurbidity, {
      message: t('limitations.fields.maxTurbidity.validator.refine'),
      path: ['maxTurbidity'],
    })
    .refine((data) => data.minTemperature <= data.maxTemperature, {
      message: t('limitations.fields.minTemperature.validator.refine'),
      path: ['minTemperature'],
    })
    .refine((data) => data.minTurbidity <= data.maxTurbidity, {
      message: t('limitations.fields.minTurbidity.validator.refine'),
      path: ['minTurbidity'],
    })
    .refine((data) => data.minPh <= data.maxPh, {
      message: t('limitations.fields.minPh.validator.refine'),
      path: ['minPh'],
    });
};

export const deleteLimitations = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    id: z.string().min(1, { message: t('limitations.fields.id.validator') }),
  });

export type LimitationsSchema = z.infer<ReturnType<typeof limitationSchema>>;
export type deleteLimitationsSchema = z.infer<
  ReturnType<typeof deleteLimitations>
>;
