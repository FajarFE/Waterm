'use server';
import { getTranslations } from 'next-intl/server';
import { monitoringSchema, MonitoringSchema } from '../types/monitoring';
import { generateCodeDevice, getUserById, prisma } from '@skripsi/libs';
import { revalidatePath } from 'next/cache';
import { ResponseAction } from '@/types/response-action';

export const createMonitoring = async (
  data: MonitoringSchema,
  userId: string,
  locale: 'id' | 'en',
): Promise<ResponseAction> => {
  const t = await getTranslations({
    locale: locale,
    namespace: 'dashboard',
  });
  const s = await getTranslations({
    locale: locale,
    namespace: 'serverAction',
  });
  const result = monitoringSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);
    return {
      code: 400,
      success: false,
      message: errors,
    };
  }
  const isUserExists = await getUserById(userId);
  if (!isUserExists) {
    return {
      code: 400,
      success: false,
      message: s('monitoring.createMonitoring.userNotFound'),
    };
  }
  try {
    const generate = generateCodeDevice(6);
    await prisma.monitoring.create({
      data: {
        nameMonitoring: result.data.nameMonitoring,
        limitId: result.data.limitId,
        userId: userId,
        locationDevices: result.data.locationDevice,
        codeDevices: generate,
      },
    });

    revalidatePath('/dashboard/monitoring');

    return {
      code: 200,
      success: true,
      message: s('monitoring.createMonitoring.success'),
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: s('monitoring.createMonitoring.error'),
      };
    }
    return {
      code: 500,
      success: false,
      message: s('monitoring.createMonitoring.serverError'),
    };
  }
};

export const deleteMonitoring = async (
  id: string,
  userId: string,
  locale: 'id' | 'en',
): Promise<ResponseAction> => {
  // const t = await getTranslations({
  //   locale: locale,
  //   namespace: 'dashboard',
  // });
  const s = await getTranslations({
    locale: locale,
    namespace: 'serverAction',
  });
  const isUserExists = await getUserById(userId);
  if (!isUserExists) {
    return {
      code: 400,
      success: false,
      message: s('monitoring.deleteMonitoring.userNotFound'),
    };
  }
  try {
    await prisma.monitoring.delete({
      where: {
        id: id,
      },
    });
    revalidatePath('/dashboard/monitoring');
    return {
      code: 200,
      success: true,
      message: s('monitoring.deleteMonitoring.success'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: s('monitoring.deleteMonitoring.error'),
      };
    } else {
      return {
        code: 500,
        success: false,
        message: s('monitoring.deleteMonitoring.serverError'),
      };
    }
  }
};
