import { FinancialEventPayload, FINANCIAL_EVENTS, NotificationChannel } from '../types/event';
import { ChannelPayload, DeliveryStatus } from '../types/channel';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../types/user';
import { TemplateEngine } from './templateEngine';
import { TraiDndEngine } from './traiDndEngine';
import { QuietHoursEngine } from './quietHoursEngine';
import { FrequencyCapEngine } from './frequencyCapEngine';
import { PreferenceEngine } from './preferenceEngine';
import { DLQEngine } from './dlqEngine';
import { MetricsCollector } from '../analytics/metricsCollector';

import { ChannelProviderAdapter } from '../providers/providerInterface';
import { SMSProvider } from '../providers/smsProvider';
import { EmailProvider } from '../providers/emailProvider';
import { PushProvider } from '../providers/pushProvider';
import { WhatsAppProvider } from '../providers/whatsappProvider';
import { InAppProvider } from '../providers/inAppProvider';

export class NotificationEventProcessor {
  public templateEngine: TemplateEngine;
  public traiDndEngine: TraiDndEngine;
  public quietHoursEngine: QuietHoursEngine;
  public frequencyCapEngine: FrequencyCapEngine;
  public preferenceEngine: PreferenceEngine;
  public dlqEngine: DLQEngine;
  public metricsCollector: MetricsCollector;

  public providers: Map<NotificationChannel, ChannelProviderAdapter> = new Map();
  private userStore: Map<string, UserPreferences> = new Map();
  private deferredQueue: ChannelPayload[] = [];
  private onBroadcastCallback?: (event: any) => void;

  constructor(onBroadcast?: (event: any) => void) {
    this.onBroadcastCallback = onBroadcast;
    this.templateEngine = new TemplateEngine();
    this.traiDndEngine = new TraiDndEngine();
    this.quietHoursEngine = new QuietHoursEngine();
    this.frequencyCapEngine = new FrequencyCapEngine();
    this.preferenceEngine = new PreferenceEngine();
    this.dlqEngine = new DLQEngine();
    this.metricsCollector = new MetricsCollector();

    // Register Channel Providers
    const sms = new SMSProvider();
    const email = new EmailProvider();
    const push = new PushProvider();
    const whatsapp = new WhatsAppProvider();
    const inApp = new InAppProvider();

    this.providers.set('SMS', sms);
    this.providers.set('EMAIL', email);
    this.providers.set('PUSH', push);
    this.providers.set('WHATSAPP', whatsapp);
    this.providers.set('IN_APP', inApp);

    // Register Default User
    this.userStore.set(DEFAULT_USER_PREFERENCES.userId, DEFAULT_USER_PREFERENCES);
  }

  public setBroadcastCallback(cb: (event: any) => void) {
    this.onBroadcastCallback = cb;
  }

  public getUser(userId: string): UserPreferences {
    return this.userStore.get(userId) || { ...DEFAULT_USER_PREFERENCES, userId };
  }

  public updateUser(user: UserPreferences): void {
    this.userStore.set(user.userId, user);
  }

  /**
   * Main Pipeline Entry Point: Process financial event end-to-end
   */
  public async processEvent(event: FinancialEventPayload): Promise<ChannelPayload[]> {
    const eventDef = FINANCIAL_EVENTS[event.eventType];
    const category = event.category || (eventDef ? eventDef.category : 'TRANSACTION');
    const priority = event.priority || (eventDef ? eventDef.defaultPriority : 'HIGH');
    const classification = event.classification || (eventDef ? eventDef.classification : 'SERVICE_IMPLICIT');

    this.metricsCollector.recordIngest(category, priority);

    const user = this.getUser(event.userId);
    const supportedChannels = eventDef ? eventDef.supportedChannels : ['PUSH', 'IN_APP'];

    // 1. TRAI DND Compliance Check
    const traiCheck = this.traiDndEngine.evaluate(event, user);
    if (!traiCheck.passed) {
      this.emitStatus({
        dispatchId: `DSP_${Math.random().toString(36).substring(2, 9)}`,
        eventId: event.eventId,
        eventType: event.eventType,
        channel: 'SMS',
        userId: user.userId,
        status: 'TRAI_BLOCKED',
        timestamp: new Date().toISOString(),
        reason: traiCheck.reason
      });
      return [];
    }

    // 2. Frequency Cap Check
    const freqCheck = this.frequencyCapEngine.evaluate(event, user);
    if (!freqCheck.passed) {
      this.emitStatus({
        dispatchId: `DSP_${Math.random().toString(36).substring(2, 9)}`,
        eventId: event.eventId,
        eventType: event.eventType,
        channel: 'EMAIL',
        userId: user.userId,
        status: 'FREQ_CAP_BLOCKED',
        timestamp: new Date().toISOString(),
        reason: freqCheck.reason
      });
      return [];
    }

    // 3. Quiet Hours Check
    const quietCheck = this.quietHoursEngine.evaluate(event, user);
    if (quietCheck.deferred) {
      this.emitStatus({
        dispatchId: `DSP_${Math.random().toString(36).substring(2, 9)}`,
        eventId: event.eventId,
        eventType: event.eventType,
        channel: 'PUSH',
        userId: user.userId,
        status: 'QUIET_HOURS_DEFERRED',
        timestamp: new Date().toISOString(),
        reason: quietCheck.reason
      });
      return [];
    }

    // 4. Preference Engine Filter
    const activeChannels = this.preferenceEngine.getEnabledChannels(event, user, supportedChannels as NotificationChannel[]);

    // Record Frequency Cap dispatch count
    this.frequencyCapEngine.recordDispatch(user.userId, classification);

    const results: ChannelPayload[] = [];

    // Dispatch to selected active channels concurrently
    const dispatchPromises = activeChannels.map(async (channel) => {
      const rendered = this.templateEngine.render(
        event.eventType,
        channel,
        user.preferredLanguage,
        { ...event.templateData, userName: user.name, ...event.metadata }
      );

      const dispatchId = `DSP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const payload: ChannelPayload = {
        dispatchId,
        eventId: event.eventId,
        eventType: event.eventType,
        category,
        classification,
        priority,
        userId: user.userId,
        channel,
        recipient: {
          phone: user.phone,
          email: user.email,
          whatsAppNo: user.whatsAppNo,
          userId: user.userId
        },
        content: {
          subject: rendered.subject,
          title: rendered.title,
          body: rendered.body,
          htmlBody: rendered.htmlBody,
          actionButtons: rendered.actionLabel ? [{ label: rendered.actionLabel, action: 'ACTION_CLICK' }] : undefined
        },
        metadata: {
          dltHeaderId: event.metadata?.dltHeaderId || eventDef?.dltHeaderId,
          dltTemplateId: event.metadata?.dltTemplateId || eventDef?.dltTemplateId
        },
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ENQUEUED'
      };

      this.emitStatus({
        dispatchId: payload.dispatchId,
        eventId: payload.eventId,
        eventType: payload.eventType,
        channel: payload.channel,
        userId: payload.userId,
        status: 'DISPATCHED',
        timestamp: new Date().toISOString()
      });

      const provider = this.providers.get(channel);
      if (!provider) {
        payload.status = 'FAILED';
        payload.failureReason = `No provider available for channel ${channel}`;
        this.emitStatus({
          dispatchId: payload.dispatchId,
          eventId: payload.eventId,
          eventType: payload.eventType,
          channel: payload.channel,
          userId: payload.userId,
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          reason: payload.failureReason
        });
        return payload;
      }

      // Execute provider dispatch
      const providerRes = await provider.dispatch(payload);

      if (providerRes.success) {
        payload.status = 'DELIVERED';
        payload.providerResponse = providerRes.providerResponse;
        this.emitStatus({
          dispatchId: payload.dispatchId,
          eventId: payload.eventId,
          eventType: payload.eventType,
          channel: payload.channel,
          userId: payload.userId,
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
          latencyMs: providerRes.latencyMs
        });
        return payload;
      }

      // Provider Failed -> Trigger DLQ with Retry & Fallback
      const dlqOutcome = await this.dlqEngine.handleFailure(
        payload,
        providerRes.failureReason || 'Provider Error',
        this.providers as any,
        async (retryPayload) => {
          const retryProvider = this.providers.get(retryPayload.channel);
          if (!retryProvider) return false;
          const retryRes = await retryProvider.dispatch(retryPayload);
          if (retryRes.success) {
            retryPayload.status = 'DELIVERED';
            this.emitStatus({
              dispatchId: retryPayload.dispatchId,
              eventId: retryPayload.eventId,
              eventType: retryPayload.eventType,
              channel: retryPayload.channel,
              userId: retryPayload.userId,
              status: 'DELIVERED',
              timestamp: new Date().toISOString(),
              latencyMs: retryRes.latencyMs
            });
            return true;
          }
          return false;
        }
      );

      if (dlqOutcome.movedToDlq) {
        this.emitStatus({
          dispatchId: payload.dispatchId,
          eventId: payload.eventId,
          eventType: payload.eventType,
          channel: payload.channel,
          userId: payload.userId,
          status: 'DLQ_EXHAUSTED',
          timestamp: new Date().toISOString(),
          reason: payload.failureReason
        });
      }

      return payload;
    });

    const dispatchedPayloads = await Promise.all(dispatchPromises);
    results.push(...dispatchedPayloads);
    return results;
  }

  private emitStatus(statusEvent: any) {
    this.metricsCollector.recordStatusTransition(statusEvent);
    if (this.onBroadcastCallback) {
      this.onBroadcastCallback({
        type: 'STATUS_UPDATE',
        data: statusEvent,
        snapshot: this.metricsCollector.getSnapshot()
      });
    }
  }

  public getInAppFeed(userId: string): ChannelPayload[] {
    const inAppProvider = this.providers.get('IN_APP') as InAppProvider;
    return inAppProvider ? inAppProvider.getUserFeed(userId) : [];
  }
}
