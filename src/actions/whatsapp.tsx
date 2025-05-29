import { WhatappsSchema, whatappsSchema } from '@/types/notifications';
import { prisma } from '@skripsi/libs';
import { getTranslations } from 'next-intl/server';
export async function changeNumber(
  data: WhatappsSchema,
  locale: 'id' | 'en',
  id: string,
) {
  const t = await getTranslations({
    locale,
    namespace: 'otp',
  });
  const result = whatappsSchema(t).safeParse(data);
  if (!result.success) {
    return {
      code: 400,
      success: false,
      message: result.error.errors[0].message,
    };
  }
  try {
    const user = await prisma.user.update({
      data: {
        noWhatsapp: String(result.data),
      },
      where: {
        id: id,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'User created successfully',
      data: user,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        code: 500,
        status: 'error',
        message: error.message,
      };
    } else {
      return {
        code: 500,
        status: 'error',
        message: 'Internal server error',
      };
    }
  }
}
