import { auth, prisma } from '@skripsi/libs';
import { EditMonitoring } from './editMonitoring';

export const EditMonitoringComponents = async ({
  id,
  editId,
}: {
  id: string;
  editId: string;
}) => {
  const session = await auth();
  const dataEdit = await prisma.monitoring.findUnique({
    where: { id },
    select: {
      id: true,
      nameMonitoring: true,
      locationDevices: true,
      limitId: true,
    },
  });

  const dataLimit = await prisma.limitation.findMany({
    where: {
      user: { id: session?.user.id },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <EditMonitoring
      editId={editId}
      emailVerified={session?.user.emailVerified}
      data={dataEdit}
      dataLimit={dataLimit ?? null}
    />
  );
};
