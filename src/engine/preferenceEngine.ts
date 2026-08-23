import { FinancialEventPayload, NotificationChannel } from '../types/event';
import { UserPreferences } from '../types/user';

export class PreferenceEngine {
  /**
   * Filter requested/supported channels based on user preferences
   */
  public getEnabledChannels(event: FinancialEventPayload, user: UserPreferences, supportedChannels: NotificationChannel[]): NotificationChannel[] {
    const categoryMatrix = user.channelMatrix[event.category];
    if (!categoryMatrix) {
      return supportedChannels;
    }

    // Filter channels enabled in user matrix
    const enabled = supportedChannels.filter(channel => categoryMatrix[channel] === true);

    // If no channel enabled by user preferences, but event is CRITICAL, force primary fallback (Push / SMS)
    if (enabled.length === 0 && event.priority === 'CRITICAL') {
      return ['SMS', 'PUSH'];
    }

    return enabled;
  }
}
