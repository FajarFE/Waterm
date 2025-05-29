'use server';
import { generatePasswordHash, getUserFromDb } from '@skripsi/libs';
import { prisma } from '@skripsi/libs';

import { type RegisterSchema, registerSchema } from '../types/signup';
import { ResponseAction } from '@/types/response-action';
import { getTranslations } from 'next-intl/server';
import { InjectDataAfterRegister } from '@skripsi/prisma/seeder';

export async function signUp(
  data: RegisterSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale,
    namespace: 'signUp',
  });
  const s = await getTranslations({
    locale,
    namespace: 'serverAction',
  });
  // Validate the data
  const result = registerSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }
  const isEmailExists = await getUserFromDb(result.data.email);
  if (isEmailExists) {
    return {
      code: 400,
      success: false,
      message: s('signUp.emailAlreadyExists'),
    };
  }
  const hashed = await generatePasswordHash(result.data.password);

  try {
    // create user data
    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashed,
      },
    });

    await InjectDataAfterRegister(user.id).catch((err) => {
      if (err instanceof Error) {
        return {
          code: 500,
          success: false,
          message: err.message,
        };
      }
    });
    return {
      code: 200,
      success: true,
      message: s('signUp.success'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: s('signUp.error'),
      };
    } else {
      return {
        code: 500,
        success: false,
        message: s('signUp.serverError'),
      };
    }
  }
}
