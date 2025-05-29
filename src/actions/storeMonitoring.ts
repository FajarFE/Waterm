'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@skripsi/libs';

interface DeviceData {
  deviceId: string;
  temperature: number;
  ph: number;
  turbidity: number;
}

export async function storeDeviceData(data: DeviceData) {
  try {
    const getIdMonitoring = await prisma.monitoring.findFirst({
      where: {
        id: data.deviceId,
      },
    });

    if (!getIdMonitoring) {
      throw new Error('Monitoring device not found');
    }

    await prisma.dataMonitoring.create({
      data: {
        PHWater: data.ph,
        TemperatureWater: data.temperature,
        TurbidityWater: data.turbidity,
        monitoringId: getIdMonitoring.id,
      },
    });

    revalidatePath('/dashboard/monitoring');
    return { success: true };
  } catch (error) {
    console.error('Error storing device data:', error);
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Monitoring device not found') {
        return { success: false, error: 'Device not found' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to store device data' };
  }
}
