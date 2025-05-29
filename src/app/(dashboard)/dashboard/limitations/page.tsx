'use server';
import { LimitationsPage } from '@/modules/limitations';
import { auth, prisma } from '@skripsi/libs';

export default async function Page() {
  const session = await auth();
  const dataLimitations = await prisma.limitation.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      id: true,
      name: true,
      category: true,
      maxPh: true,
      minPh: true,
      maxTemperature: true,
      minTemperature: true,
      maxTurbidity: true,
      minTurbidity: true,
    },
  });
  return (
    <>
      <LimitationsPage
        userId={session?.user?.id ?? ''}
        emailVerified={session?.user.emailVerified ?? null}
        data={dataLimitations}
      />
    </>
  );
}
