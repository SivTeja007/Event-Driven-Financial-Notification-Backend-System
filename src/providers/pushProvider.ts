import { BaseProviderAdapter, ProviderResult } from './providerInterface';
import { ChannelPayload } from '../types/channel';
import { NotificationChannel } from '../types/event';

export class PushProvider extends BaseProviderAdapter {
  public channel: NotificationChannel = 'PUSH';
  public name = 'Google FCM / Apple APNs Gateway';

  protected async executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult> {
    return {
      success: true,
      status: 'DELIVERED',
      latencyMs,
      providerResponse: {
        fcmMessageId: `projects/fintech-app/messages/${Math.random().toString(36).substr(2, 12)}`,
        deviceToken: payload.recipient.pushToken || 'token_mock_fcm_883921',
        title: payload.content.title || 'Financial Alert',
        priority: payload.priority === 'CRITICAL' ? 'high' : 'normal',
        badge: 1
      }
    };
  }
}
