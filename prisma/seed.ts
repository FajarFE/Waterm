import { PrismaClient } from '@prisma/client';
import { seedMonitoringData } from './data/monitoring-seeder.js';

const prisma = new PrismaClient();

const main = async () => {
  await seedMonitoringData();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
