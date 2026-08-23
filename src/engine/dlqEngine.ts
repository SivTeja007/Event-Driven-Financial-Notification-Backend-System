import { ChannelPayload, DeliveryStatus } from '../types/channel';
import { ChannelProviderAdapter } from '../providers/providerInterface';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export class DLQEngine {
  private dlqStore: Map<string, ChannelPayload> = new Map();
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 200,
    maxDelayMs: 5000
  };

  /**
   * Calculate exponential backoff delay with jitter
   */
  public calculateBackoffDelay(attempt: number): number {
    const exponent = Math.max(0, attempt - 1);
    const delay = this.retryConfig.baseDelayMs * Math.pow(2, exponent);
    const jitter = Math.floor(Math.random() * 50);
    return Math.min(this.retryConfig.maxDelayMs, delay + jitter);
  }

  /**
   * Handle failed message dispatch attempt. Either schedule retry or push to DLQ.
   */
  public async handleFailure(
    payload: ChannelPayload,
    reason: string,
    providers: Map<string, ChannelProviderAdapter>,
    onRetryExecute: (updatedPayload: ChannelPayload) => Promise<boolean>
  ): Promise<{ retried: boolean; movedToDlq: boolean; fallbackChannelUsed?: string }> {
    payload.retryCount += 1;
    payload.failureReason = reason;

    // Check if fallback channel can be used for HIGH / CRITICAL events
    if (payload.priority === 'CRITICAL' || payload.priority === 'HIGH') {
      const fallbackChannel = this.selectFallbackChannel(payload.channel);
      if (fallbackChannel && providers.has(fallbackChannel)) {
        const fallbackProvider = providers.get(fallbackChannel);
        if (fallbackProvider && fallbackProvider.getCircuitState() !== 'OPEN') {
          payload.channel = fallbackChannel as any;
          payload.status = 'ENQUEUED';
          payload.failureReason = `Primary channel failed (${reason}). Routing to fallback channel ${fallbackChannel}.`;
          
          const success = await onRetryExecute(payload);
          if (success) {
            return { retried: true, movedToDlq: false, fallbackChannelUsed: fallbackChannel };
          }
        }
      }
    }

    // Standard Exponential Retry Logic
    if (payload.retryCount <= payload.maxRetries) {
      payload.status = 'DLQ_RETRY';
      const delay = this.calculateBackoffDelay(payload.retryCount);
      
      // Wait backoff delay
      await new Promise(res => setTimeout(res, delay));
      
      const success = await onRetryExecute(payload);
      if (success) {
        return { retried: true, movedToDlq: false };
      }
    }

    // Max retries exhausted -> Move to Dead Letter Queue
    payload.status = 'DLQ_EXHAUSTED';
    payload.updatedAt = new Date().toISOString();
    this.dlqStore.set(payload.dispatchId, payload);

    return { retried: false, movedToDlq: true };
  }

  private selectFallbackChannel(failedChannel: string): string | null {
    switch (failedChannel) {
      case 'SMS': return 'WHATSAPP';
      case 'PUSH': return 'SMS';
      case 'WHATSAPP': return 'PUSH';
      case 'EMAIL': return 'IN_APP';
      default: return null;
    }
  }

  public getDlqMessages(): ChannelPayload[] {
    return Array.from(this.dlqStore.values());
  }

  public removeFromDlq(dispatchId: string): boolean {
    return this.dlqStore.delete(dispatchId);
  }

  public clearDlq(): void {
    this.dlqStore.clear();
  }
}
