import DeviceMonitor from '@/components/device-monitoring';
import { AddDevice } from '@/components/addDevice';
import { auth, prisma } from '@skripsi/libs';
import { sessionUser } from '@/types/session';
import { EditMonitoringComponents } from '@/components/edit-monitoring';
import MonitoringPage from '@/components/Aggregated';

interface Monitor {
  nameMonitoring: string;
  id: string;
  locationDevices: string;
  codeDevices: string;
  limit: {
    name: string;
    category: string;
    maxPh: number;
    minPh: number;
    maxTurbidity: number;
    minTurbidity: number;
    maxTemperature: number;
    minTemperature: number;
  };
}

interface DashboardProps {
  dataMonitoringDevice: Monitor[];
  emailVerified?: Date | null;
  session: sessionUser;
}

export default async function DashboardModule({
  dataMonitoringDevice,
  emailVerified,
  session,
}: DashboardProps) {
  const authSession = await auth();
  const DataLimit = await prisma.limitation.findMany({
    where: {
      user: { id: authSession?.user?.id },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="container mx-auto flex flex-col gap-2 md:gap-10 p-4">
      <MonitoringPage />
      <div className="flex flex-col gap-5 w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className=" text-lg md:text-2xl lg:text-2xl font-bold text-violet-700 dark:text-white uppercase">
            MUlti Device Monitoring
          </h1>

          <AddDevice
            emailVerified={emailVerified}
            id="input-data-monitoring"
            className="bg-purple-500 py-2 px-2 text-md lg:py-3 lg:px-5 md:py-3 md:px-5"
            data={DataLimit ?? null}
            idUser={authSession?.user?.id ?? ''}
          />
        </div>
        <div className="grid lg:grid-cols-12 grid-cols-1 md:grid-cols-2 gap-6">
          {dataMonitoringDevice &&
            dataMonitoringDevice.map((device, id) => (
              <DeviceMonitor
                maxPhThreshold={device.limit.maxPh}
                minPhThreshold={device.limit.minPh}
                maxTurbidityThreshold={device.limit.maxTurbidity}
                minTurbidityThreshold={device.limit.minTurbidity}
                maxTempThreshold={device.limit.maxTemperature}
                minTempThreshold={device.limit.minTemperature}
                deviceCode={device.codeDevices}
                LocationId={`location-device-${id + 1}`}
                useLimitId={`use-limit-device-${id + 1}`}
                connectingId={`connecting-device-${id + 1}`}
                deleteId={`delete-device-${id + 1}`}
                deviceNameId={`device-name-${id + 1}`}
                name={device.limit.name}
                deviceLocation={device.locationDevices}
                session={session}
                category={device.limit.category}
                className="col-span-6"
                key={device.id}
                deviceId={device.id}
                deviceName={device.nameMonitoring}
                codeDevice={device.codeDevices}
              >
                <EditMonitoringComponents
                  editId={`edit-device-${id + 1}`}
                  id={device.id}
                />
              </DeviceMonitor>
            ))}
        </div>
      </div>
    </div>
  );
}
