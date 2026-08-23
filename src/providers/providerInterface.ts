import { ChannelPayload, DeliveryStatus } from '../types/channel';
import { NotificationChannel } from '../types/event';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderResult {
  success: boolean;
  status: DeliveryStatus;
  providerResponse?: any;
  failureReason?: string;
  latencyMs: number;
}

export interface ChannelProviderAdapter {
  channel: NotificationChannel;
  name: string;
  circuitState: CircuitState;
  failureRateThreshold: number; // e.g. 0.3 for 30%
  simulateNetworkLatencyMs: number;
  
  dispatch(payload: ChannelPayload): Promise<ProviderResult>;
  getCircuitState(): CircuitState;
  resetCircuit(): void;
  setFailureRate(rate: number): void;
}

export abstract class BaseProviderAdapter implements ChannelProviderAdapter {
  public abstract channel: NotificationChannel;
  public abstract name: string;
  
  public circuitState: CircuitState = 'CLOSED';
  public failureRateThreshold: number = 0.3; // 30% failure rate triggers circuit breaker
  public simulateNetworkLatencyMs: number = 50;

  private recentResults: boolean[] = [];
  private openCircuitTimestamp: number = 0;
  private readonly circuitCooldownMs: number = 10000; // 10s cooldown before half-open
  private simulatedFailureRate: number = 0.05; // 5% default mock failure rate

  public setFailureRate(rate: number) {
    this.simulatedFailureRate = Math.min(1, Math.max(0, rate));
  }

  public getCircuitState(): CircuitState {
    if (this.circuitState === 'OPEN') {
      if (Date.now() - this.openCircuitTimestamp > this.circuitCooldownMs) {
        this.circuitState = 'HALF_OPEN';
      }
    }
    return this.circuitState;
  }

  public resetCircuit(): void {
    this.circuitState = 'CLOSED';
    this.recentResults = [];
    this.simulatedFailureRate = 0.05;
  }

  protected recordAttempt(success: boolean) {
    this.recentResults.push(success);
    if (this.recentResults.length > 20) {
      this.recentResults.shift();
    }

    if (this.recentResults.length >= 10) {
      const failures = this.recentResults.filter(r => !r).length;
      const rate = failures / this.recentResults.length;
      
      if (rate >= this.failureRateThreshold && this.circuitState === 'CLOSED') {
        this.circuitState = 'OPEN';
        this.openCircuitTimestamp = Date.now();
      } else if (this.circuitState === 'HALF_OPEN' && success) {
        this.circuitState = 'CLOSED';
      }
    }
  }

  public async dispatch(payload: ChannelPayload): Promise<ProviderResult> {
    const currentState = this.getCircuitState();
    if (currentState === 'OPEN') {
      return {
        success: false,
        status: 'FAILED',
        failureReason: `Circuit Breaker OPEN for provider ${this.name}. Rerouting or DLQ active.`,
        latencyMs: 5
      };
    }

    const start = Date.now();
    // Simulate network delay
    const delay = this.simulateNetworkLatencyMs + Math.floor(Math.random() * 40);
    await new Promise(res => setTimeout(res, delay));

    // Simulate occasional provider failure based on configured rate
    const isSuccess = Math.random() >= this.simulatedFailureRate;
    this.recordAttempt(isSuccess);

    const latencyMs = Date.now() - start;

    if (!isSuccess) {
      return {
        success: false,
        status: 'FAILED',
        failureReason: `Provider HTTP 503 Internal Server Error from ${this.name}`,
        latencyMs
      };
    }

    return this.executeProviderDispatch(payload, latencyMs);
  }

  protected abstract executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult>;
}
