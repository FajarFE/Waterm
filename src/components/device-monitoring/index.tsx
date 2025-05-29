'use client';

import type React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@skripsi/components';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { ButtonDeleteDevice } from '../deleteDevice';
import type { sessionUser } from '@/types/session';
import { FaCopy } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { TbSlashes } from 'react-icons/tb';
import { Waves } from 'lucide-react';
import { DeviceChart } from './chart';
import { useSocket } from '@/contexts/SocketContext';

interface DeviceMonitorProps {
  deviceId: string;
  deviceName: string;
  LocationId: string;
  deviceNameId: string;
  useLimitId: string;
  codeDevice?: string;
  className: string;
  connectingId: string;
  deviceCode: string;
  minPhThreshold?: number;
  maxPhThreshold?: number;
  minTempThreshold?: number;
  maxTempThreshold?: number;
  minTurbidityThreshold?: number;
  maxTurbidityThreshold?: number;
  deleteId: string;
  session: sessionUser;
  children: React.ReactNode;
  deviceLocation?: string;
  category: string;
  name: string;
}

export default function DeviceMonitor({
  deviceId,
  deviceName,
  deviceCode,
  className,
  minPhThreshold,
  maxPhThreshold,
  minTempThreshold,
  maxTempThreshold,
  minTurbidityThreshold,
  maxTurbidityThreshold,
  LocationId,
  deviceNameId,
  useLimitId,
  connectingId,
  deleteId,
  codeDevice,
  children,
  session,
  category,
  name,
  deviceLocation = 'Unknown Location',
}: DeviceMonitorProps) {
  const t = useTranslations('dashboard.monitoring.monitoringDevice');
  const { isConnected, isDeviceActive } = useSocket();

  // Check if this specific device is active
  const deviceConnected = isConnected && isDeviceActive(deviceCode);

  const handleCopyCode = (codeDevice?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeDevice || '');
      toast.success('Code copied to clipboard');
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex flex-row *:gap-2 justify-between items-start">
          <div className="flex flex-col gap-2 text-md">
            <div
              className="flex flex-row  justify-between items-between"
              id={deviceNameId}
            >
              <div>{deviceName}</div>
              <div className=" md:hidden lg:hidden flex gap-2  flex-row ">
                <div className="flex flex-row gap-2">
                  <ButtonDeleteDevice
                    deleteDeviceId={deleteId}
                    size={20}
                    session={session}
                    id={deviceId}
                  />
                  {children}
                </div>
                <div
                  id={connectingId}
                  className="flex  flex-row gap-2 justify-center items-center"
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      deviceConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <div className="hidden md:flex lg:flex">
                    {deviceConnected ? (
                      <span className="text-sm text-muted-foreground">
                        {t('isConnected')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('isNotConnected')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              id={useLimitId}
              className="flex flex-row gap-2 justify-start items-center"
            >
              <Waves />
              <div>{name}</div>
              <span>
                <TbSlashes />
              </span>
              <div>{category}</div>
            </div>
            <div
              id={LocationId}
              className="flex flex-row justify-start items-center"
            >
              <FaLocationDot size={25} />
              <div>{deviceLocation}</div>
            </div>
          </div>
          <div className=" md:flex lg:flex hidden flex-row gap-10">
            <div className="flex flex-row gap-2">
              <ButtonDeleteDevice
                deleteDeviceId={deleteId}
                size={20}
                session={session}
                id={deviceId}
              />
              {children}
            </div>
            <div
              id={connectingId}
              className="flex  flex-row gap-2 justify-center items-center"
            >
              <span
                className={`h-3 w-3 rounded-full ${
                  deviceConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div>
                {deviceConnected ? (
                  <span className="text-sm text-muted-foreground">
                    {t('isConnected')}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('isNotConnected')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deviceConnected ? (
          <Tabs
            defaultValue={`phDevice-${deviceId}`}
            className="w-full h-[450px]"
          >
            <TabsList>
              <TabsTrigger value={`temperatureDevice-${deviceId}`}>
                {t('temperatureWater.title', { unit: ' °C' })}
              </TabsTrigger>
              <TabsTrigger value={`phDevice-${deviceId}`}>
                {t('phWater.title')}
              </TabsTrigger>
              <TabsTrigger value={`turbidityDevice-${deviceId}`}>
                {t('turbidityWater.title')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={`temperatureDevice-${deviceId}`}>
              <DeviceChart
                deviceCode={deviceCode}
                dataKey="temperatureWater" // Fixed: was using turbidityWater for temperature
                label={t('temperatureWater.title', { unit: ' °C' })}
                title={t('temperatureWater.title', { unit: ' °C' })}
                color="rgb(53, 162, 235)"
                maxThreshold={maxTempThreshold}
                minThreshold={minTempThreshold}
                minThresholdLabel={t('temperatureWater.min')}
                maxThresholdLabel={t('temperatureWater.max')}
              />
            </TabsContent>
            <TabsContent value={`phDevice-${deviceId}`}>
              <DeviceChart
                deviceCode={deviceCode}
                dataKey="phWater"
                label={t('phWater.title')}
                title={t('phWater.title')}
                color="rgb(255, 99, 132)"
                minThreshold={minPhThreshold}
                maxThreshold={maxPhThreshold}
                minThresholdLabel={t('phWater.min')}
                maxThresholdLabel={t('phWater.max')}
              />
            </TabsContent>
            <TabsContent value={`turbidityDevice-${deviceId}`}>
              <DeviceChart
                deviceCode={deviceCode}
                label={t('turbidityWater.title')}
                dataKey="turbidityWater"
                title={t('turbidityWater.title')}
                color="rgb(75, 192, 192)"
                minThreshold={minTurbidityThreshold}
                maxThreshold={maxTurbidityThreshold}
                minThresholdLabel={t('turbidityWater.min')}
                maxThresholdLabel={t('turbidityWater.max')}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex h-[300px] gap-5 flex-col items-center justify-center text-muted-foreground">
            <div>Tolong Hubungkan Perangkat Code Kedalam Perangkat</div>
            <div className="flex flex-row gap-5 justify-center items-center">
              <span>{codeDevice}</span>
              <Button
                onClick={() => {
                  handleCopyCode(codeDevice);
                }}
              >
                <FaCopy />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
