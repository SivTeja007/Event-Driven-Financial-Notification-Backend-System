import express, { Request, Response } from 'express';
import cors from 'cors';
import { NotificationEventProcessor } from '../engine/eventProcessor';
import { FINANCIAL_EVENTS, FinancialEventPayload } from '../types/event';

export function createExpressApp(processor: NotificationEventProcessor) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // 1. Ingest Single Event
  app.post('/api/events/trigger', async (req: Request, res: Response) => {
    try {
      const payload: FinancialEventPayload = {
        eventId: req.body.eventId || `EVT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        eventType: req.body.eventType || 'MARGIN_CALL_CRITICAL',
        category: req.body.category,
        classification: req.body.classification,
        priority: req.body.priority,
        userId: req.body.userId || 'USR_1001',
        timestamp: req.body.timestamp || new Date().toISOString(),
        templateData: req.body.templateData || {},
        metadata: req.body.metadata || {}
      };

      const result = await processor.processEvent(payload);
      res.json({ success: true, eventId: payload.eventId, dispatches: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Batch Event Generator
  app.post('/api/events/batch', async (req: Request, res: Response) => {
    try {
      const count = Math.min(500, Math.max(1, req.body.count || 10));
      const eventKeys = Object.keys(FINANCIAL_EVENTS);
      const results: any[] = [];

      for (let i = 0; i < count; i++) {
        const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        const eventDef = FINANCIAL_EVENTS[randomKey];
        const eventPayload: FinancialEventPayload = {
          eventId: `BAT_${Date.now()}_${i}`,
          eventType: randomKey,
          category: eventDef.category,
          classification: eventDef.classification,
          priority: eventDef.defaultPriority,
          userId: req.body.userId || 'USR_1001',
          timestamp: new Date().toISOString(),
          templateData: { ...eventDef.sampleData, userName: 'Tejal Patel' },
          metadata: { dltHeaderId: eventDef.dltHeaderId, dltTemplateId: eventDef.dltTemplateId }
        };

        const resPayloads = await processor.processEvent(eventPayload);
        results.push(...resPayloads);
      }

      res.json({ success: true, processedCount: count, totalDispatches: results.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. User Preference Management
  app.get('/api/preferences/:userId', (req: Request, res: Response) => {
    const user = processor.getUser(req.params.userId);
    res.json({ success: true, preferences: user });
  });

  app.post('/api/preferences/:userId', (req: Request, res: Response) => {
    try {
      const updated = req.body;
      processor.updateUser(updated);
      res.json({ success: true, preferences: processor.getUser(req.params.userId) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. DLQ Management & Manual Replay
  app.get('/api/dlq', (req: Request, res: Response) => {
    const dlqMessages = processor.dlqEngine.getDlqMessages();
    res.json({ success: true, count: dlqMessages.length, messages: dlqMessages });
  });

  app.post('/api/dlq/replay/:dispatchId', async (req: Request, res: Response) => {
    const { dispatchId } = req.params;
    const dlqMessages = processor.dlqEngine.getDlqMessages();
    const target = dlqMessages.find(m => m.dispatchId === dispatchId);

    if (!target) {
      return res.status(404).json({ success: false, error: 'Dispatch ID not found in DLQ' });
    }

    target.retryCount = 0;
    target.status = 'ENQUEUED';
    processor.dlqEngine.removeFromDlq(dispatchId);

    const provider = processor.providers.get(target.channel);
    if (provider) {
      const providerRes = await provider.dispatch(target);
      if (providerRes.success) {
        target.status = 'DELIVERED';
        processor.metricsCollector.recordStatusTransition({
          dispatchId: target.dispatchId,
          eventId: target.eventId,
          eventType: target.eventType,
          channel: target.channel,
          userId: target.userId,
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
          latencyMs: providerRes.latencyMs
        });
        return res.json({ success: true, message: 'DLQ message replayed and delivered successfully' });
      }
    }

    res.status(500).json({ success: false, error: 'Replay dispatch failed again' });
  });

  // 5. Provider Fault Injection (to test circuit breaker & fallback)
  app.post('/api/providers/simulate-failure', (req: Request, res: Response) => {
    const { channel, failureRate } = req.body; // e.g. channel: 'SMS', failureRate: 0.8
    const provider = processor.providers.get(channel as any);
    if (!provider) {
      return res.status(404).json({ success: false, error: `Channel ${channel} not found` });
    }

    provider.setFailureRate(failureRate);
    res.json({
      success: true,
      channel,
      failureRate,
      circuitState: provider.getCircuitState()
    });
  });

  app.post('/api/providers/reset-circuit', (req: Request, res: Response) => {
    const { channel } = req.body;
    if (channel) {
      const provider = processor.providers.get(channel as any);
      if (provider) provider.resetCircuit();
    } else {
      processor.providers.forEach(p => p.resetCircuit());
    }
    res.json({ success: true, message: 'Provider circuits reset to CLOSED' });
  });

  // 6. Metrics & Audit Logs
  app.get('/api/metrics', (req: Request, res: Response) => {
    const snapshot = processor.metricsCollector.getSnapshot();
    const audit = processor.metricsCollector.getAuditLog();
    res.json({ success: true, snapshot, auditLog: audit });
  });

  app.post('/api/metrics/reset', (req: Request, res: Response) => {
    processor.metricsCollector.resetMetrics();
    res.json({ success: true, message: 'Metrics reset' });
  });

  // 7. Event Catalog (25+ Events)
  app.get('/api/events/catalog', (req: Request, res: Response) => {
    res.json({ success: true, events: Object.values(FINANCIAL_EVENTS) });
  });

  // 8. User In-App Feed
  app.get('/api/notifications/inapp/:userId', (req: Request, res: Response) => {
    const feed = processor.getInAppFeed(req.params.userId);
    res.json({ success: true, feed });
  });

  return app;
}
