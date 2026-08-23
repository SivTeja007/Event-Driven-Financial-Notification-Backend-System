import http from 'http';
import { createExpressApp } from './expressApp';
import { setupWebSocketServer } from './websocketServer';
import { NotificationEventProcessor } from '../engine/eventProcessor';

const PORT = process.env.PORT || 5000;

export const processor = new NotificationEventProcessor();
const app = createExpressApp(processor);
const server = http.createServer(app);
setupWebSocketServer(server, processor);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Financial Notification Engine Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket telemetry stream live on ws://localhost:${PORT}/ws`);
  });
}
