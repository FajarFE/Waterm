'use server';
import { getTranslations } from 'next-intl/server';
import {
  type LimitationsSchema,
  deleteLimitations,
  deleteLimitationsSchema,
  limitationSchema,
} from '../types/limit';
import { getUserById, prisma } from '@skripsi/libs';
import { revalidatePath } from 'next/cache';
import { ResponseAction } from '@/types/response-action';

export async function createOrUpdateLimitation({
  data,
  userId,
  locale,
  limitationId,
}: {
  data: LimitationsSchema;
  userId: string;
  locale: 'id' | 'en';
  limitationId?: string;
}) {
  const t = await getTranslations({
    locale,
    namespace: 'dashboard',
  });

  const s = await getTranslations({
    locale,
    namespace: 'serverAction',
  });

  // Validate the data
  const result = limitationSchema(t).safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((error) => {
      return error.message;
    });
    return {
      code: 400,
      success: false,
      message: message,
    };
  }
  // Check if the user exists
  const isUserExists = await getUserById(userId);
  if (!isUserExists) {
    return {
      code: 400,
      success: false,
      message: s('limit.userNotFound'),
    };
  }

  try {
    if (limitationId !== undefined) {
      await prisma.limitation.update({
        where: { id: limitationId },
        data: {
          name: data.name,
          maxPh: data.maxPh,
          minPh: data.minPh,
          maxTemperature: data.maxTemperature,
          minTemperature: data.minTemperature,
          maxTurbidity: data.maxTurbidity,
          minTurbidity: data.minTurbidity,
        },
      });
      revalidatePath('/dashboard/limitations');
      return {
        code: 200,
        success: true,
        message: s('limit.updateLimit.success'),
      };
    } else {
      await prisma.limitation.create({
        data: {
          name: data.name,
          maxPh: data.maxPh,
          minPh: data.minPh,
          category: data.category,
          maxTemperature: data.maxTemperature,
          minTemperature: data.minTemperature,
          maxTurbidity: data.maxTurbidity,
          minTurbidity: data.minTurbidity,
          userId: userId,
        },
      });
      revalidatePath('/dashboard/limitations');
      return {
        code: 200,
        success: true,
        message: s('limit.createLimit.success'),
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (limitationId !== undefined) {
        return {
          code: 500,
          success: false,
          message: s('limit.updateLimit.error'),
        };
      } else {
        return {
          code: 500,
          success: false,
          message: s('limit.createLimit.error'),
        };
      }
    } else {
      return {
        code: 500,
        success: false,
        message: s('limit.createLimit.serverError'),
      };
    }
  }
}

export const DeleteLimitations = async (
  data: deleteLimitationsSchema,
  locale: 'id' | 'en',
  userId: string,
): Promise<ResponseAction> => {
  const t = await getTranslations({
    locale: locale,
    namespace: 'dashboard',
  });
  const s = await getTranslations({
    locale: locale,
    namespace: 'serverAction',
  });
  const result = deleteLimitations(t).safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((error) => {
      return error.message;
    });
    return {
      code: 400,
      success: false,
      message: message,
    };
  }
  // Check if the user exists
  const isUserExists = await getUserById(userId);
  if (!isUserExists) {
    return {
      code: 400,
      success: false,
      message: s('limit.userNotFound'),
    };
  }
  try {
    await prisma.limitation.delete({
      where: {
        id: data.id,
      },
    });
    revalidatePath('/dashboard/limitations');
    return {
      code: 200,
      success: true,
      message: s('limit.deleteLimit.success'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: error.message,
      };
    } else {
      return {
        code: 500,
        success: false,
        message: s('limit.deleteLimit.error'),
      };
    }
  }
};
