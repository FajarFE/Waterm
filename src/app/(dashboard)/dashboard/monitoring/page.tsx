'use server';
import { auth, prisma } from '@skripsi/libs';
import { sessionUser } from '@/types/session';
import DashboardModule from '@/modules/monitoring';

export default async function Page() {
  const session = await auth();

  const data = await prisma.monitoring.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      id: true,
      nameMonitoring: true,
      locationDevices: true,
      codeDevices: true,
      limit: {
        select: {
          name: true,
          category: true,
          maxPh: true,
          minPh: true,
          maxTurbidity: true,
          minTurbidity: true,
          maxTemperature: true,
          minTemperature: true,
        },
      },
    },
  });

  return (
    <div id="welcome-message" className="bg-white w-full h-full dark:bg-black">
      <DashboardModule
        session={session as sessionUser}
        emailVerified={session?.user.emailVerified}
        dataMonitoringDevice={data}
      />
    </div>
  );
}
