import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_ID = 'cmb86lt8u0000fhv80shotrb3';

interface MonitoringData {
  PHWater: number;
  TemperatureWater: number;
  TurbidityWater: number;
  createdAt: Date;
}

function generateHistoricalData(days: number): MonitoringData[] {
  const data: MonitoringData[] = [];
  const startDate = new Date('2024-01-01'); // Start from beginning of 2024
  const endDate = new Date('2025-12-31'); // Generate data until end of 2025

  // Calculate total days between start and end
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (let i = 0; i < totalDays; i++) {
    // Generate 24 readings per day (1 per hour)
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(hour, 0, 0, 0);

      const entry = {
        PHWater: 6.5 + Math.random() * 1.5, // pH between 6.5 and 8.0
        TemperatureWater: 20 + Math.random() * 8, // temp between 20-28°C
        TurbidityWater: Math.random() * 3, // turbidity between 0-3 NTU
        createdAt: date,
      };

      data.push(entry);
    }
  }

  return data;
}

export async function seedMonitoringData() {
  try {
    // Find existing monitoring device for the user
    const monitoring = await prisma.monitoring.findFirst({
      where: {
        userId: USER_ID,
      },
    });

    if (!monitoring) {
      console.error('No monitoring device found for user');
      return;
    }

    // Generate 30 days of historical data
    const historicalData = generateHistoricalData(30);

    console.log(`Generated ${historicalData.length} historical records`);

    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < historicalData.length; i += batchSize) {
      const batch = historicalData.slice(i, i + batchSize);
      await prisma.dataMonitoring.createMany({
        data: batch.map((entry) => ({
          ...entry,
          monitoringId: monitoring.id,
        })),
      });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(
      `Successfully seeded ${historicalData.length} monitoring records`,
    );
  } catch (error) {
    console.error('Error seeding monitoring data:', error);
  }
}
