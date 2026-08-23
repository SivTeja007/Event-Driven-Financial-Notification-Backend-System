import { FinancialEventPayload, FINANCIAL_EVENTS } from '../types/event';
import { UserPreferences } from '../types/user';

export interface TraiComplianceResult {
  passed: boolean;
  reason?: string;
  dltVerified: boolean;
  category: string;
}

export class TraiDndEngine {
  /**
   * Evaluate TRAI DND rules and DLT metadata verification
   */
  public evaluate(event: FinancialEventPayload, user: UserPreferences, now: Date = new Date()): TraiComplianceResult {
    const eventDef = FINANCIAL_EVENTS[event.eventType];
    const category = event.classification || (eventDef ? eventDef.classification : 'PROMOTIONAL');

    // 1. Check DLT Header and Template ID Verification for SMS/WhatsApp
    const dltHeader = event.metadata?.dltHeaderId || eventDef?.dltHeaderId;
    const dltTemplate = event.metadata?.dltTemplateId || eventDef?.dltTemplateId;
    const dltVerified = Boolean(dltHeader && dltTemplate);

    // Critical and Transactional/Service Implicit messages bypass TRAI DND
    if (event.priority === 'CRITICAL' || category === 'SERVICE_IMPLICIT' || category === 'TRANSACTIONAL') {
      return {
        passed: true,
        reason: `Exempt: ${category} / ${event.priority} priority event`,
        dltVerified,
        category
      };
    }

    // 2. Evaluate User TRAI DND Registry Status for Promotional Traffic
    if (category === 'PROMOTIONAL') {
      if (user.traiDndStatus === 'FULLY_BLOCKED' || user.traiDndStatus === 'PROMOTIONAL_BLOCKED') {
        return {
          passed: false,
          reason: `TRAI DND Block: User registered under ${user.traiDndStatus}`,
          dltVerified,
          category
        };
      }

      // 3. Evaluate TRAI Mandatory Promotional Time Restrictions (09:00 PM to 09:00 AM IST)
      const istTime = this.getIstTimeComponents(now);
      if (istTime.hours >= 21 || istTime.hours < 9) {
        return {
          passed: false,
          reason: `TRAI Regulatory Quiet Window: Promotional dispatches prohibited between 21:00 and 09:00 IST (Current IST: ${istTime.hours}:${istTime.minutes})`,
          dltVerified,
          category
        };
      }
    }

    return {
      passed: true,
      reason: 'TRAI DND & DLT compliance checks passed',
      dltVerified,
      category
    };
  }

  private getIstTimeComponents(date: Date): { hours: number; minutes: number } {
    const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
    const [h, m] = istString.split(':').map(Number);
    return { hours: h, minutes: m };
  }
}
