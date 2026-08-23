import { BaseProviderAdapter, ProviderResult } from './providerInterface';
import { ChannelPayload } from '../types/channel';
import { NotificationChannel } from '../types/event';

export class SMSProvider extends BaseProviderAdapter {
  public channel: NotificationChannel = 'SMS';
  public name = 'Kaleyra / Twilio SMS Gateway';

  protected async executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult> {
    const text = payload.content.body;
    
    // Check GSM-7 vs Unicode encoding
    const isUnicode = /[^\u0000-\u007F]/.test(text);
    const charLimitPerPart = isUnicode ? 70 : 160;
    const partsCount = Math.ceil(text.length / charLimitPerPart) || 1;

    payload.metadata.encoding = isUnicode ? 'UNICODE' : 'GSM7';
    payload.metadata.characterCount = text.length;
    payload.metadata.partsCount = partsCount;

    return {
      success: true,
      status: 'DELIVERED',
      latencyMs,
      providerResponse: {
        messageSid: `SMS_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        partsCount,
        encoding: payload.metadata.encoding,
        dltHeaderId: payload.metadata.dltHeaderId || 'FINSEC',
        deliveredTo: payload.recipient.phone
      }
    };
  }
}
