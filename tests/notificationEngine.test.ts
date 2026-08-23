import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationEventProcessor } from '../src/engine/eventProcessor';
import { FINANCIAL_EVENTS, FinancialEventPayload } from '../src/types/event';
import { DEFAULT_USER_PREFERENCES, UserPreferences } from '../src/types/user';

describe('Event-Driven Financial Notification Engine Test Suite', () => {
  let processor: NotificationEventProcessor;

  beforeEach(() => {
    processor = new NotificationEventProcessor();
    processor.metricsCollector.resetMetrics();
  });

  it('1. Should load catalog of 25+ financial event types', () => {
    const eventCount = Object.keys(FINANCIAL_EVENTS).length;
    expect(eventCount).toBeGreaterThanOrEqual(25);
  });

  it('2. Should process Margin Call Critical alert and override quiet hours & DND', async () => {
    const event: FinancialEventPayload = {
      eventId: 'EVT_MARGIN_01',
      eventType: 'MARGIN_CALL_CRITICAL',
      category: 'MARGIN_RISK',
      classification: 'SERVICE_IMPLICIT',
      priority: 'CRITICAL',
      userId: 'USR_1001',
      timestamp: new Date().toISOString(),
      templateData: {
        userName: 'Tejal Patel',
        shortfallAmount: 50000,
        deadline: '11:30 AM'
      }
    };

    const dispatches = await processor.processEvent(event);
    expect(dispatches.length).toBeGreaterThan(0);
    const delivered = dispatches.filter(d => d.status === 'DELIVERED');
    expect(delivered.length).toBeGreaterThan(0);
  });

  it('3. Should block promotional events under TRAI DND rules when DND status is active', async () => {
    const user: UserPreferences = {
      ...DEFAULT_USER_PREFERENCES,
      userId: 'USR_DND_TEST',
      traiDndStatus: 'PROMOTIONAL_BLOCKED'
    };
    processor.updateUser(user);

    const promoEvent: FinancialEventPayload = {
      eventId: 'EVT_PROMO_01',
      eventType: 'MUTUAL_FUND_NAV',
      category: 'WEALTH_SIP',
      classification: 'PROMOTIONAL',
      priority: 'LOW',
      userId: 'USR_DND_TEST',
      timestamp: new Date().toISOString(),
      templateData: { userName: 'Tejal Patel' }
    };

    const dispatches = await processor.processEvent(promoEvent);
    expect(dispatches.length).toBe(0);
    const snapshot = processor.metricsCollector.getSnapshot();
    expect(snapshot.totalTraiBlocked).toBe(1);
  });

  it('4. Should enforce frequency capping sliding window for promotional notifications', async () => {
    const user: UserPreferences = {
      ...DEFAULT_USER_PREFERENCES,
      userId: 'USR_FREQ_TEST',
      traiDndStatus: 'OPT_IN',
      quietHours: { ...DEFAULT_USER_PREFERENCES.quietHours, enabled: false },
      maxFrequencyCapPerDay: { PROMOTIONAL: 2, SERVICE_EXPLICIT: 10 }
    };
    processor.updateUser(user);

    const promoEvent: FinancialEventPayload = {
      eventId: 'EVT_FREQ',
      eventType: 'PORTFOLIO_REBALANCE',
      category: 'WEALTH_SIP',
      classification: 'PROMOTIONAL',
      priority: 'LOW',
      userId: 'USR_FREQ_TEST',
      timestamp: new Date().toISOString(),
      templateData: { userName: 'Tejal Patel' }
    };

    // First 2 dispatches should pass
    await processor.processEvent({ ...promoEvent, eventId: 'P1' });
    await processor.processEvent({ ...promoEvent, eventId: 'P2' });

    // 3rd dispatch should be blocked by frequency cap engine
    await processor.processEvent({ ...promoEvent, eventId: 'P3' });

    const snapshot = processor.metricsCollector.getSnapshot();
    expect(snapshot.totalFreqCapBlocked).toBe(1);
  });

  it('5. Should render templates in Hindi (hi) and Tamil (ta)', () => {
    const renderedHindi = processor.templateEngine.render(
      'MARGIN_CALL_CRITICAL',
      'SMS',
      'hi',
      { userName: 'Tejal Patel', shortfallAmount: 25000, deadline: '5:00 PM' }
    );
    expect(renderedHindi.body).toContain('प्रिय Tejal Patel');
    expect(renderedHindi.body).toContain('मार्जिन');

    const renderedTamil = processor.templateEngine.render(
      'TXN_HIGH_VALUE_DEBIT',
      'SMS',
      'ta',
      { userName: 'Tejal Patel', amount: 15000, accountEnd: '1234', merchant: 'Amazon' }
    );
    expect(renderedTamil.body).toContain('எச்சரிக்கை');
  });

  it('6. Should handle provider failure, trigger retry, and route to DLQ if max retries exceeded', async () => {
    const smsProvider = processor.providers.get('SMS');
    if (smsProvider) smsProvider.setFailureRate(1.0); // 100% failure rate

    const user: UserPreferences = {
      ...DEFAULT_USER_PREFERENCES,
      userId: 'USR_DLQ_TEST',
      channelMatrix: {
        ...DEFAULT_USER_PREFERENCES.channelMatrix,
        MARGIN_RISK: { SMS: true, EMAIL: false, PUSH: false, WHATSAPP: false, IN_APP: false }
      }
    };
    processor.updateUser(user);

    const event: FinancialEventPayload = {
      eventId: 'EVT_DLQ_01',
      eventType: 'RISK_STOP_LOSS',
      category: 'MARGIN_RISK',
      classification: 'SERVICE_IMPLICIT',
      priority: 'LOW', // Low priority so fallback channel is not triggered
      userId: 'USR_DLQ_TEST',
      timestamp: new Date().toISOString(),
      templateData: { userName: 'Tejal Patel' }
    };

    await processor.processEvent(event);

    const dlqMessages = processor.dlqEngine.getDlqMessages();
    expect(dlqMessages.length).toBeGreaterThan(0);
    expect(dlqMessages[0].status).toBe('DLQ_EXHAUSTED');

    if (smsProvider) smsProvider.resetCircuit();
  });
});
