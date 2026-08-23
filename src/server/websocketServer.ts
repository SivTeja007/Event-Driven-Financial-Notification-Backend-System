import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { NotificationEventProcessor } from '../engine/eventProcessor';

export function setupWebSocketServer(httpServer: Server, processor: NotificationEventProcessor) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients: Set<WebSocket> = new Set();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    // Send initial snapshot on connect
    const initialSnapshot = processor.metricsCollector.getSnapshot();
    const initialAudit = processor.metricsCollector.getAuditLog();
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      data: {
        snapshot: initialSnapshot,
        auditLog: initialAudit,
        dlqMessages: processor.dlqEngine.getDlqMessages()
      }
    }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Attach broadcast hook to processor
  processor.setBroadcastCallback((message: any) => {
    const payload = JSON.stringify(message);
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  });

  return wss;
}
