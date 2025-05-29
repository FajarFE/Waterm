'use server';

import { contactFormSchema, ContactFormSchema } from '@/types/contact-form';
import { ResponseAction } from '@/types/response-action';
import { sendContactForm } from '@skripsi/libs/mail';
import { getTranslations } from 'next-intl/server';

export const ActionContactForm = async (
  data: ContactFormSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> => {
  const t = await getTranslations({
    locale,
    namespace: 'contactForm',
  });
  const result = contactFormSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }
  try {
    await sendContactForm(data);
    return {
      code: 200,
      success: true,
      message: 'Sucess',
    };
  } catch {
    return {
      code: 500,
      success: true,
      message: 'Error',
    };
  }
};
