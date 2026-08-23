import { FinancialEventPayload } from '../types/event';
import { UserPreferences } from '../types/user';

export interface FrequencyCapResult {
  passed: boolean;
  currentCount: number;
  maxCap: number;
  reason?: string;
}

export class FrequencyCapEngine {
  // Key: userId_classification -> array of timestamps
  private dispatchHistory: Map<string, number[]> = new Map();

  public evaluate(event: FinancialEventPayload, user: UserPreferences, now: number = Date.now()): FrequencyCapResult {
    // Critical events always bypass frequency caps
    if (event.priority === 'CRITICAL') {
      return { passed: true, currentCount: 0, maxCap: Infinity, reason: 'CRITICAL priority bypassed rate limit' };
    }

    const classification = event.classification || 'PROMOTIONAL';
    const maxCap = user.maxFrequencyCapPerDay[classification as keyof typeof user.maxFrequencyCapPerDay] || (classification === 'PROMOTIONAL' ? 3 : 10);

    const historyKey = `${user.userId}_${classification}`;
    const windowMs = 24 * 60 * 60 * 1000; // 24 Hours sliding window

    const timestamps = this.dispatchHistory.get(historyKey) || [];
    const validTimestamps = timestamps.filter(t => now - t <= windowMs);
    this.dispatchHistory.set(historyKey, validTimestamps);

    if (validTimestamps.length >= maxCap) {
      return {
        passed: false,
        currentCount: validTimestamps.length,
        maxCap,
        reason: `Frequency cap exceeded for ${classification} (${validTimestamps.length}/${maxCap} allowed in 24h window)`
      };
    }

    return {
      passed: true,
      currentCount: validTimestamps.length,
      maxCap
    };
  }

  public recordDispatch(userId: string, classification: string, now: number = Date.now()) {
    const historyKey = `${userId}_${classification}`;
    const timestamps = this.dispatchHistory.get(historyKey) || [];
    timestamps.push(now);
    this.dispatchHistory.set(historyKey, timestamps);
  }

  public resetUserHistory(userId: string) {
    for (const key of this.dispatchHistory.keys()) {
      if (key.startsWith(userId)) {
        this.dispatchHistory.delete(key);
      }
    }
  }
}
