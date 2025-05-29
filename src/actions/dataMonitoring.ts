'use server';
import type { DataMonitoringSchema } from '@/types/data-monitoring';
import type { ResponseAction } from '@/types/response-action';
import { prisma } from '@skripsi/libs';

export const CreateDataMonitoring = async (
  data: DataMonitoringSchema,
  codeDevices: string,
): Promise<ResponseAction> => {
  try {
    // Remove the user include since it's causing the error
    const checkedDeviceId = await prisma.monitoring.findFirst({
      where: {
        codeDevices: codeDevices,
      },
    });

    if (!checkedDeviceId) {
      console.log('Code Devices Not Found');
      return {
        code: 404,
        success: false,
        message: 'Code Devices Not Found',
      };
    }

    await prisma.dataMonitoring.create({
      data: {
        PHWater: data.phWater,
        TurbidityWater: data.TurbidityWater,
        TemperatureWater: data.TemperatureWater,
        monitorings: {
          connect: {
            id: checkedDeviceId.id,
          },
        },
      },
    });
    console.log('Data Successfully Created');
    return {
      code: 201,
      success: true,
      message: 'Data Successfully Created',
    };
  } catch (error) {
    console.log(error);
    return {
      code: 500,
      success: false,
      message: 'Internal Server Error',
    };
  }
};
