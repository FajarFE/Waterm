'use client';

import { CreateDataMonitoring } from '@/actions/dataMonitoring';
import type React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';

// Types for our IoT data
interface DeviceReading {
  dataSensor?: {
    temperatureWater: number;
    phWater: number;
    turbidityWater: number;
    [key: string]: unknown;
  };
  temperatureWater?: number;
  phWater?: number;
  turbidityWater?: number;
  date: Date;
  [key: string]: unknown;
}

interface IoTContextType {
  isConnected: boolean;
  deviceData: Map<string, DeviceReading[]>;
  lastReadings: Map<string, DeviceReading>;
  activeDevices: Set<string>;
  error: Error | null;
  disconnectSocket: () => void;
  getChartData: (
    deviceCode: string,
    dataKey: string,
    limit?: number,
  ) => {
    labels: string[];
    values: number[];
  };
  isDeviceActive: (deviceCode: string) => boolean;
  debug: {
    lastReceivedData: unknown;
    dataStructure: string;
    dbSaveStatus: Map<
      string,
      {
        status: 'idle' | 'saving' | 'success' | 'error';
        lastSaved: Date | null;
        error?: string;
      }
    >;
  };
}

// Default context value
const defaultContextValue: IoTContextType = {
  isConnected: false,
  deviceData: new Map(),
  lastReadings: new Map(),
  activeDevices: new Set(),
  error: null,
  disconnectSocket: () => {},
  getChartData: () => ({ labels: [], values: [] }),
  isDeviceActive: () => false,
  debug: {
    lastReceivedData: null,
    dataStructure: 'unknown',
    dbSaveStatus: new Map(),
  },
};

// Create context
const IoTDataContext = createContext<IoTContextType>(defaultContextValue);

// Provider props
interface IoTDataProviderProps {
  children: ReactNode;
  socketUrl?: string;
  maxDataPoints?: number;
  deviceInactivityTimeout?: number;
  enableDatabaseSaving?: boolean;
  saveInterval?: number; // How often to save data (in ms)
}

export const SocketProvider: React.FC<IoTDataProviderProps> = ({
  children,
  socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  maxDataPoints = 50,
  deviceInactivityTimeout = 30000,
  enableDatabaseSaving = true,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deviceData, setDeviceData] = useState<Map<string, DeviceReading[]>>(
    new Map(),
  );
  const [lastReadings, setLastReadings] = useState<Map<string, DeviceReading>>(
    new Map(),
  );
  const [activeDevices, setActiveDevices] = useState<Set<string>>(new Set());
  const [deviceTimers, setDeviceTimers] = useState<Map<string, NodeJS.Timeout>>(
    new Map(),
  );
  const [lastSavedReadings, setLastSavedReadings] = useState<
    Map<string, string>
  >(new Map());
  const [dbSaveStatus, setDbSaveStatus] = useState<
    Map<
      string,
      {
        status: 'idle' | 'saving' | 'success' | 'error';
        lastSaved: Date | null;
        error?: string;
      }
    >
  >(new Map());

  const [debug, setDebug] = useState<{
    lastReceivedData: unknown;
    dataStructure: string;
    dbSaveStatus: Map<
      string,
      {
        status: 'idle' | 'saving' | 'success' | 'error';
        lastSaved: Date | null;
        error?: string;
      }
    >;
  }>({
    lastReceivedData: null,
    dataStructure: 'unknown',
    dbSaveStatus: new Map(),
  });

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection to:', socketUrl);
    const socketInstance = io(socketUrl, {
      transports: ['websocket'], // Add this line
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('connect_error', (err) => {
      console.error(
        'Socket connection error (server might be down or unreachable, or a WebSocket issue occurred):',
        err,
      );
      setIsConnected(false);
      setError(err);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
      setActiveDevices(new Set());
    });

    setSocket(socketInstance);

    return () => {
      deviceTimers.forEach((timer) => clearTimeout(timer));
      socketInstance.disconnect();
    };
  }, [socketUrl, deviceTimers]);

  // Function to mark a device as inactive after timeout
  const setDeviceInactive = useCallback((deviceCode: string) => {
    setActiveDevices((prev) => {
      const updated = new Set(prev);
      updated.delete(deviceCode);
      return updated;
    });
  }, []);

  // Function to save reading to database
  const saveReadingToDatabase = useCallback(
    async (deviceCode: string, reading: DeviceReading) => {
      if (!enableDatabaseSaving) return;

      try {
        setDbSaveStatus((prev) => {
          const updated = new Map(prev);
          updated.set(deviceCode, {
            status: 'saving',
            lastSaved: prev.get(deviceCode)?.lastSaved || null,
          });
          return updated;
        });

        const readingSignature = JSON.stringify({
          deviceCode,
          timestamp: reading.date,
          values: {
            phWater: reading.phWater || reading.dataSensor?.phWater,
            turbidityWater:
              reading.turbidityWater || reading.dataSensor?.turbidityWater,
            temperatureWater:
              reading.temperatureWater || reading.dataSensor?.temperatureWater,
          },
        });

        if (lastSavedReadings.get(deviceCode) === readingSignature) {
          console.log(
            `Skipping save for device ${deviceCode} - already saved this reading`,
          );
          return;
        }

        const dataToSave = {
          phWater: Number(reading.phWater || reading.dataSensor?.phWater || 0),
          TurbidityWater: Number(
            reading.turbidityWater || reading.dataSensor?.turbidityWater || 0,
          ),
          TemperatureWater: Number(
            reading.temperatureWater ||
              reading.dataSensor?.temperatureWater ||
              0,
          ),
        };

        if (
          isNaN(dataToSave.phWater) ||
          isNaN(dataToSave.TurbidityWater) ||
          isNaN(dataToSave.TemperatureWater)
        ) {
          console.error(`Invalid data for device ${deviceCode}:`, dataToSave);

          setDbSaveStatus((prev) => {
            const updated = new Map(prev);
            updated.set(deviceCode, {
              status: 'error',
              lastSaved: prev.get(deviceCode)?.lastSaved || null,
              error: 'Invalid data: Contains NaN values',
            });
            return updated;
          });

          return;
        }

        console.log(
          `Saving data for device ${deviceCode} to database:`,
          dataToSave,
        );

        try {
          const result = await CreateDataMonitoring(dataToSave, deviceCode);
          console.log(result.code, result.message);
          if (result.success) {
            console.log(`Successfully saved data for device ${deviceCode}`);

            setDbSaveStatus((prev) => {
              const updated = new Map(prev);
              updated.set(deviceCode, {
                status: 'success',
                lastSaved: new Date(),
              });
              return updated;
            });

            setLastSavedReadings((prev) => {
              const updated = new Map(prev);
              updated.set(deviceCode, readingSignature);
              return updated;
            });
          } else {
            console.error(
              `Failed to save data for device ${deviceCode}:`,
              result.message,
            );

            setDbSaveStatus((prev) => {
              const updated = new Map(prev);
              updated.set(deviceCode, {
                status: 'error',
                lastSaved: prev.get(deviceCode)?.lastSaved || null,
                error: Array.isArray(result.message)
                  ? result.message.join(', ')
                  : result.message,
              });
              return updated;
            });
          }
        } catch (error) {
          console.error(`Error saving data for device ${deviceCode}:`, error);

          setDbSaveStatus((prev) => {
            const updated = new Map(prev);
            updated.set(deviceCode, {
              status: 'error',
              lastSaved: prev.get(deviceCode)?.lastSaved || null,
              error: error instanceof Error ? error.message : String(error),
            });
            return updated;
          });
        }
      } catch (error) {
        console.error(`Error saving data for device ${deviceCode}:`, error);

        setDbSaveStatus((prev) => {
          const updated = new Map(prev);
          updated.set(deviceCode, {
            status: 'error',
            lastSaved: prev.get(deviceCode)?.lastSaved || null,
            error: error instanceof Error ? error.message : String(error),
          });
          return updated;
        });
      }
    },
    [enableDatabaseSaving, lastSavedReadings],
  );

  // Handle device updates
  useEffect(() => {
    if (!socket) return;

    const handleDeviceUpdate = (update: unknown) => {
      console.log('Received device update:', update);

      if (typeof update !== 'object' || update === null) {
        console.error('Invalid update format: not an object', update);
        return;
      }

      // Use type assertion or check properties safely
      const potentialUpdate = update as Record<string, unknown>; // Changed from any to unknown

      setDebug((prev) => ({
        ...prev,
        lastReceivedData: update,
        dataStructure:
          typeof potentialUpdate.data === 'object'
            ? potentialUpdate.data &&
              (potentialUpdate.data as Record<string, unknown>).dataSensor // Added type assertion here too
              ? 'nested'
              : 'flat'
            : 'unknown',
      }));

      // Extract deviceCode and data from the update
      // Handle both possible formats: {deviceCode, data} or just the data with deviceCode inside
      const deviceCode =
        potentialUpdate.deviceCode ||
        potentialUpdate.codeDevices ||
        (potentialUpdate.data &&
          (potentialUpdate.data as Record<string, unknown>).codeDevices); // Added type assertion
      const data = potentialUpdate.data || potentialUpdate;

      if (!deviceCode || typeof deviceCode !== 'string') {
        console.error(
          'Invalid update format, missing or invalid deviceCode/codeDevices',
          update,
        );
        return;
      }

      // Ensure data is an object before proceeding
      if (typeof data !== 'object' || data === null) {
        console.error('Invalid data format within update', data);
        return;
      }
      const dataRecord = data as Record<string, unknown>; // Assert data as Record<string, unknown> for easier access

      // Normalize the data structure to ensure we have both nested and flat access
      const normalizedData: DeviceReading = {
        date:
          dataRecord.date instanceof Date
            ? dataRecord.date
            : new Date(
                (dataRecord.date as string | number | undefined) || Date.now(),
              ), // Added type assertion for date
      };

      // Handle nested data structure
      if (dataRecord.dataSensor && typeof dataRecord.dataSensor === 'object') {
        const dataSensor = dataRecord.dataSensor as Record<string, unknown>; // Assert dataSensor
        normalizedData.dataSensor = {
          ...dataSensor,
          temperatureWater: Number(dataSensor.temperatureWater ?? 0),
          phWater: Number(dataSensor.phWater ?? 0),
          turbidityWater: Number(dataSensor.turbidityWater ?? 0),
        };
        // Also add flat properties for easier access
        normalizedData.temperatureWater = dataSensor.temperatureWater as number; // Assert type
        normalizedData.phWater = dataSensor.phWater as number; // Assert type
        normalizedData.turbidityWater = dataSensor.turbidityWater as number; // Assert type
      }
      // Handle flat data structure
      else {
        normalizedData.temperatureWater = (dataRecord.temperatureWater ||
          dataRecord.TemperatureWater) as number; // Assert type
        normalizedData.phWater = (dataRecord.phWater ||
          dataRecord.PHWater) as number; // Assert type
        normalizedData.turbidityWater = (dataRecord.turbidityWater ||
          dataRecord.TurbidityWater) as number; // Assert type
        // Also add nested structure for compatibility
        normalizedData.dataSensor = {
          temperatureWater: Number(normalizedData.temperatureWater ?? 0),
          phWater: Number(normalizedData.phWater ?? 0),
          turbidityWater: Number(normalizedData.turbidityWater ?? 0),
        };
      }

      // ... rest of the function
      console.log('Normalized data:', normalizedData);

      // Mark device as active
      setActiveDevices((prev) => {
        const updated = new Set(prev);
        updated.add(deviceCode);
        return updated;
      });

      // Clear any existing timer for this device
      if (deviceTimers.has(deviceCode)) {
        clearTimeout(deviceTimers.get(deviceCode));
      }

      // Set a new timer to mark the device as inactive after the timeout
      const timer = setTimeout(() => {
        setDeviceInactive(deviceCode);
      }, deviceInactivityTimeout);

      setDeviceTimers((prev) => {
        const updated = new Map(prev);
        updated.set(deviceCode, timer);
        return updated;
      });

      setDeviceData((prevData) => {
        const newData = new Map(prevData);
        const deviceHistory = newData.get(deviceCode) || [];
        const updatedHistory = [...deviceHistory, normalizedData].slice(
          -maxDataPoints,
        );
        newData.set(deviceCode, updatedHistory);
        return newData;
      });

      setLastReadings((prevReadings) => {
        const newReadings = new Map(prevReadings);
        newReadings.set(deviceCode, normalizedData);
        return newReadings;
      });

      // Save this reading to the database immediately
      // This ensures data is saved as soon as it's received
      saveReadingToDatabase(deviceCode, normalizedData);
    };

    socket.on('device-update', handleDeviceUpdate);

    return () => {
      socket.off('device-update', handleDeviceUpdate);
    };
  }, [
    socket,
    maxDataPoints,
    deviceInactivityTimeout,
    deviceTimers,
    setDeviceInactive,
    saveReadingToDatabase,
  ]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  const isDeviceActive = useCallback(
    (deviceCode: string) => {
      return activeDevices.has(deviceCode);
    },
    [activeDevices],
  );

  const getChartData = useCallback(
    (deviceCode: string, dataKey: string, limit = maxDataPoints) => {
      console.log(
        `Getting chart data for device ${deviceCode}, key ${dataKey}, limit ${limit}`,
      );

      const deviceHistory = deviceData.get(deviceCode) || [];
      console.log(`Device history length: ${deviceHistory.length}`);

      if (deviceHistory.length === 0) {
        console.log('No history data found for device');
        return { labels: [], values: [] };
      }

      const limitedData = deviceHistory.slice(-limit);

      const labels = limitedData.map((reading) => {
        const date =
          reading.date instanceof Date ? reading.date : new Date(reading.date);
        return date.toLocaleTimeString();
      });

      const values = limitedData.map((reading) => {
        if (typeof reading[dataKey] === 'number') {
          return reading[dataKey] as number;
        }

        if (
          reading.dataSensor &&
          typeof reading.dataSensor[dataKey] === 'number'
        ) {
          return reading.dataSensor[dataKey] as number;
        }

        console.warn(`Could not find ${dataKey} in reading`, reading);
        return 0;
      });

      console.log(`Chart data for ${dataKey}:`, { labels, values });
      return { labels, values };
    },
    [deviceData, maxDataPoints],
  );

  const value = {
    isConnected,
    deviceData,
    lastReadings,
    activeDevices,
    error,
    disconnectSocket,
    getChartData,
    isDeviceActive,
    debug: {
      ...debug,
      dbSaveStatus,
    },
  };

  return (
    <IoTDataContext.Provider value={value}>{children}</IoTDataContext.Provider>
  );
};

// Custom hook to use the IoT data context
export const useSocket = () => useContext(IoTDataContext);
