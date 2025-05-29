import { generateCodeDevice, prisma } from '@skripsi/libs';

export async function InjectDataAfterRegister(
  id?: string,
  retries = 3,
  delay = 1000,
) {
  if (!id) {
    throw new Error('User ID is required');
  }

  let user = null;
  let attempts = 0;

  // Retry logic for finding the user
  while (!user && attempts < retries) {
    user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      attempts++;
      if (attempts < retries) {
        // Wait before trying again
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  if (!user) {
    throw new Error('User not found after retries');
  }

  // Check if limitation already exists
  const checkLimitation = await prisma.limitation.findFirst({
    where: { userId: id },
  });

  if (checkLimitation) {
    return { success: true, message: 'Limitation already exists' };
  }

  try {
    const limit = await prisma.limitation.create({
      data: {
        name: 'Default Limit',
        maxPh: 8.5,
        minPh: 6.5,
        category: 'Lele',
        maxTemperature: 30,
        minTemperature: 20,
        maxTurbidity: 5,
        minTurbidity: 0,
        userId: id,
      },
    });

    await prisma.monitoring.create({
      data: {
        nameMonitoring: 'Default',
        limitId: limit.id,
        userId: id,
        locationDevices: 'Default Location',
        codeDevices: generateCodeDevice(6),
      },
    });

    return { success: true, message: 'Data injected successfully' };
  } catch (error) {
    throw new Error(
      typeof error === 'string' ? error : 'Failed to inject data',
    );
  }
}
