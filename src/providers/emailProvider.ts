import { BaseProviderAdapter, ProviderResult } from './providerInterface';
import { ChannelPayload } from '../types/channel';
import { NotificationChannel } from '../types/event';

export class EmailProvider extends BaseProviderAdapter {
  public channel: NotificationChannel = 'EMAIL';
  public name = 'AWS SES / SendGrid Email Gateway';

  protected async executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult> {
    return {
      success: true,
      status: 'DELIVERED',
      latencyMs,
      providerResponse: {
        smtpId: `<${Math.random().toString(36).substr(2, 9)}@fintech.example.com>`,
        subject: payload.content.subject,
        recipient: payload.recipient.email,
        openTrackingPixel: true,
        clickTrackingEnabled: true
      }
    };
  }
}
