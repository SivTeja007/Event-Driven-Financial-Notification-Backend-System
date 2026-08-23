import { FinancialEventPayload } from '../types/event';
import { UserPreferences } from '../types/user';

export interface QuietHoursResult {
  isQuiet: boolean;
  deferred: boolean;
  deferredUntil?: string;
  reason?: string;
}

export class QuietHoursEngine {
  public evaluate(event: FinancialEventPayload, user: UserPreferences, now: Date = new Date()): QuietHoursResult {
    const config = user.quietHours;
    if (!config || !config.enabled) {
      return { isQuiet: false, deferred: false };
    }

    // Critical override
    if (event.priority === 'CRITICAL' && config.allowCriticalOverride) {
      return {
        isQuiet: false,
        deferred: false,
        reason: 'Critical priority event bypassed quiet hours'
      };
    }

    // Check if current time falls within user quiet hours window
    const userLocalTime = this.getLocalTime(now, config.timezone || 'Asia/Kolkata');
    const isQuiet = this.isInTimeRange(userLocalTime, config.startTime, config.endTime);

    if (isQuiet) {
      const deferredUntil = this.calculateNextReleaseTime(now, config.endTime, config.timezone || 'Asia/Kolkata');
      return {
        isQuiet: true,
        deferred: true,
        deferredUntil: deferredUntil.toISOString(),
        reason: `Event deferred due to user Quiet Hours (${config.startTime} - ${config.endTime} ${config.timezone})`
      };
    }

    return { isQuiet: false, deferred: false };
  }

  private getLocalTime(date: Date, timezone: string): { hours: number; minutes: number } {
    const timeStr = date.toLocaleString('en-US', { timeZone: timezone, hour12: false, hour: '2-digit', minute: '2-digit' });
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  private isInTimeRange(current: { hours: number; minutes: number }, start: string, end: string): boolean {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const currMin = current.hours * 60 + current.minutes;
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin <= endMin) {
      // Normal range e.g. 13:00 to 17:00
      return currMin >= startMin && currMin < endMin;
    } else {
      // Overnight range e.g. 22:00 to 07:00
      return currMin >= startMin || currMin < endMin;
    }
  }

  private calculateNextReleaseTime(now: Date, endTime: string, timezone: string): Date {
    const [endH, endM] = endTime.split(':').map(Number);
    const release = new Date(now.getTime() + 8 * 3600 * 1000); // Default +8 hours fallback
    release.setHours(endH, endM, 0, 0);
    return release;
  }
}
