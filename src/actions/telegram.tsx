import { getTranslations } from 'next-intl/server';
import {
  idTelegramSchema,
  type IdTelegramSchema,
} from '../types/notifications';
import { prisma } from '@skripsi/libs';

export async function changeIdTelegram(
  data: IdTelegramSchema,
  locale: 'id' | 'en',
  id: string,
) {
  const t = await getTranslations({
    locale,
    namespace: 'otp',
  });
  const result = idTelegramSchema(t).safeParse(data);
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
        idTelegram: String(result.data),
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
