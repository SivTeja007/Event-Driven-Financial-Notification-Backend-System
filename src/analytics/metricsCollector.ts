import { DeliveryMetricSnapshot, StatusTransitionEvent } from '../types/analytics';
import { NotificationChannel, EventPriority, FinancialCategory } from '../types/event';

export class MetricsCollector {
  private totalIngested: number = 0;
  private totalDispatched: number = 0;
  private totalDelivered: number = 0;
  private totalFailed: number = 0;
  private totalTraiBlocked: number = 0;
  private totalFreqCapBlocked: number = 0;
  private totalQuietHoursDeferred: number = 0;
  private totalDlq: number = 0;

  private channelMetrics: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    dlq: number;
    latencies: number[];
    costEstInr: number;
  }> = {
    SMS: { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 },
    EMAIL: { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 },
    PUSH: { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 },
    WHATSAPP: { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 },
    IN_APP: { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 }
  };

  private priorityCounts: Record<EventPriority, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  private categoryCounts: Record<FinancialCategory, number> = {
    TRANSACTION: 0,
    MARGIN_RISK: 0,
    WEALTH_SIP: 0,
    PRICE_MARKET: 0,
    REGULATORY_SAFETY: 0
  };

  private allLatencies: number[] = [];
  private startTime: number = Date.now();
  private auditLog: StatusTransitionEvent[] = [];

  // Cost estimates per dispatch (INR)
  private readonly CHANNEL_COSTS: Record<NotificationChannel, number> = {
    SMS: 0.18,
    EMAIL: 0.02,
    PUSH: 0.00,
    WHATSAPP: 0.45,
    IN_APP: 0.00
  };

  public recordIngest(category: FinancialCategory, priority: EventPriority) {
    this.totalIngested += 1;
    this.categoryCounts[category] = (this.categoryCounts[category] || 0) + 1;
    this.priorityCounts[priority] = (this.priorityCounts[priority] || 0) + 1;
  }

  public recordStatusTransition(event: StatusTransitionEvent) {
    this.auditLog.unshift(event);
    if (this.auditLog.length > 200) {
      this.auditLog.pop();
    }

    const channel = event.channel;

    switch (event.status) {
      case 'TRAI_BLOCKED':
        this.totalTraiBlocked += 1;
        break;
      case 'FREQ_CAP_BLOCKED':
        this.totalFreqCapBlocked += 1;
        break;
      case 'QUIET_HOURS_DEFERRED':
        this.totalQuietHoursDeferred += 1;
        break;
      case 'DISPATCHED':
        this.totalDispatched += 1;
        if (channel && this.channelMetrics[channel]) {
          this.channelMetrics[channel].sent += 1;
          this.channelMetrics[channel].costEstInr += this.CHANNEL_COSTS[channel] || 0;
        }
        break;
      case 'DELIVERED':
        this.totalDelivered += 1;
        if (channel && this.channelMetrics[channel]) {
          this.channelMetrics[channel].delivered += 1;
          if (event.latencyMs) {
            this.channelMetrics[channel].latencies.push(event.latencyMs);
            this.allLatencies.push(event.latencyMs);
          }
        }
        break;
      case 'FAILED':
        this.totalFailed += 1;
        if (channel && this.channelMetrics[channel]) {
          this.channelMetrics[channel].failed += 1;
        }
        break;
      case 'DLQ_EXHAUSTED':
        this.totalDlq += 1;
        if (channel && this.channelMetrics[channel]) {
          this.channelMetrics[channel].dlq += 1;
        }
        break;
    }
  }

  public getSnapshot(): DeliveryMetricSnapshot {
    const elapsedSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
    const throughputTps = parseFloat((this.totalDispatched / elapsedSeconds).toFixed(2));

    const sortedLatencies = [...this.allLatencies].sort((a, b) => a - b);
    const p50 = this.getPercentile(sortedLatencies, 50);
    const p95 = this.getPercentile(sortedLatencies, 95);
    const p99 = this.getPercentile(sortedLatencies, 99);

    const totalProcessed = this.totalDelivered + this.totalFailed + this.totalDlq;
    const deliverySuccessRate = totalProcessed > 0 
      ? parseFloat(((this.totalDelivered / totalProcessed) * 100).toFixed(1))
      : 100.0;

    const channelBreakdown: any = {};
    (Object.keys(this.channelMetrics) as NotificationChannel[]).forEach(ch => {
      const metrics = this.channelMetrics[ch];
      const avgLat = metrics.latencies.length > 0
        ? Math.round(metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length)
        : 0;

      channelBreakdown[ch] = {
        sent: metrics.sent,
        delivered: metrics.delivered,
        failed: metrics.failed,
        dlq: metrics.dlq,
        avgLatencyMs: avgLat,
        costEstInr: parseFloat(metrics.costEstInr.toFixed(2))
      };
    });

    return {
      totalIngested: this.totalIngested,
      totalDispatched: this.totalDispatched,
      totalDelivered: this.totalDelivered,
      totalFailed: this.totalFailed,
      totalTraiBlocked: this.totalTraiBlocked,
      totalFreqCapBlocked: this.totalFreqCapBlocked,
      totalQuietHoursDeferred: this.totalQuietHoursDeferred,
      totalDlq: this.totalDlq,
      channelBreakdown,
      priorityBreakdown: { ...this.priorityCounts },
      categoryBreakdown: { ...this.categoryCounts },
      throughputTps,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      deliverySuccessRate
    };
  }

  public getAuditLog(): StatusTransitionEvent[] {
    return this.auditLog;
  }

  public resetMetrics(): void {
    this.totalIngested = 0;
    this.totalDispatched = 0;
    this.totalDelivered = 0;
    this.totalFailed = 0;
    this.totalTraiBlocked = 0;
    this.totalFreqCapBlocked = 0;
    this.totalQuietHoursDeferred = 0;
    this.totalDlq = 0;
    this.allLatencies = [];
    this.auditLog = [];
    this.startTime = Date.now();

    (Object.keys(this.channelMetrics) as NotificationChannel[]).forEach(ch => {
      this.channelMetrics[ch] = { sent: 0, delivered: 0, failed: 0, dlq: 0, latencies: [], costEstInr: 0 };
    });
  }

  private getPercentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}
