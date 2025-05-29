export type Locale = (typeof locales)[number];

export const locales = ['id', 'en'] as const;
export const defaultLocale: Locale = 'id';
