import { NotificationChannel, EventPriority, FinancialCategory } from './event';
import { DeliveryStatus } from './channel';

export interface DeliveryMetricSnapshot {
  totalIngested: number;
  totalDispatched: number;
  totalDelivered: number;
  totalFailed: number;
  totalTraiBlocked: number;
  totalFreqCapBlocked: number;
  totalQuietHoursDeferred: number;
  totalDlq: number;
  channelBreakdown: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    dlq: number;
    avgLatencyMs: number;
    costEstInr: number;
  }>;
  priorityBreakdown: Record<EventPriority, number>;
  categoryBreakdown: Record<FinancialCategory, number>;
  throughputTps: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  deliverySuccessRate: number; // percentage e.g. 98.4
}

export interface StatusTransitionEvent {
  dispatchId: string;
  eventId: string;
  eventType: string;
  channel: NotificationChannel;
  userId: string;
  status: DeliveryStatus;
  timestamp: string;
  latencyMs?: number;
  reason?: string;
}
