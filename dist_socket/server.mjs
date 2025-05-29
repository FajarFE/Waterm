import { createServer } from 'node:http';
import { Server } from 'socket.io';
// Environment variables
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = Number.parseInt(process.env.SOCKET_PORT ?? '3001', 10);
// Data storage - in a production app, you would use a database
const deviceData = new Map();
// Create HTTP server
const httpServer = createServer();
// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Handle IoT device data
    socket.on('iot-data', (data) => {
        const { userId, deviceCode, dataSensor } = data;
        if (!deviceData.has(userId)) {
            deviceData.set(userId, new Map());
        }
        const userDevices = deviceData.get(userId);
        const currentDate = new Date();
        // Format data yang akan dikirim ke client
        const formattedData = {
            dataSensor: {
                temperatureWater: Number(dataSensor.temperatureWater),
                phWater: Number(dataSensor.phWater),
                turbidityWater: Number(dataSensor.turbidityWater),
            },
            date: currentDate,
        };
        userDevices.set(deviceCode, formattedData);
        // Broadcast ke client dengan format yang konsisten
        io.emit('device-update', {
            userId,
            deviceCode,
            data: formattedData,
        });
        console.log(`Data received from device ${deviceCode}:`, formattedData);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
// Start the server
httpServer.listen(port, hostname, () => {
    console.log(`> Socket.IO server running on http://${hostname}:${port}`);
});
