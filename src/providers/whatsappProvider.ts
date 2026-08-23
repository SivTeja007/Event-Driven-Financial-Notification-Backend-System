import { BaseProviderAdapter, ProviderResult } from './providerInterface';
import { ChannelPayload } from '../types/channel';
import { NotificationChannel } from '../types/event';

export class WhatsAppProvider extends BaseProviderAdapter {
  public channel: NotificationChannel = 'WHATSAPP';
  public name = 'Meta WhatsApp Business API Gateway';

  protected async executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult> {
    return {
      success: true,
      status: 'DELIVERED',
      latencyMs,
      providerResponse: {
        wamid: `wamid.HBgM${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
        recipientMobile: payload.recipient.whatsAppNo,
        templateName: payload.eventType.toLowerCase(),
        interactiveButtons: payload.content.actionButtons || [{ label: 'View Details', action: 'OPEN_APP' }]
      }
    };
  }
}
