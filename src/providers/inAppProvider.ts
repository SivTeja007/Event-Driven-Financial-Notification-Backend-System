import { BaseProviderAdapter, ProviderResult } from './providerInterface';
import { ChannelPayload } from '../types/channel';
import { NotificationChannel } from '../types/event';

export class InAppProvider extends BaseProviderAdapter {
  public channel: NotificationChannel = 'IN_APP';
  public name = 'WebSocket & Persistent In-App Feed Service';

  private notificationFeed: Map<string, ChannelPayload[]> = new Map();

  protected async executeProviderDispatch(payload: ChannelPayload, latencyMs: number): Promise<ProviderResult> {
    const userFeed = this.notificationFeed.get(payload.userId) || [];
    userFeed.unshift(payload);
    this.notificationFeed.set(payload.userId, userFeed);

    return {
      success: true,
      status: 'DELIVERED',
      latencyMs,
      providerResponse: {
        feedId: `FEED_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        unreadCount: userFeed.length,
        broadcastTime: new Date().toISOString()
      }
    };
  }

  public getUserFeed(userId: string): ChannelPayload[] {
    return this.notificationFeed.get(userId) || [];
  }
}
