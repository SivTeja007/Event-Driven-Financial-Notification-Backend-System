import { FinancialCategory, NotificationChannel } from './event';

export type TraiDndStatus = 'FULLY_BLOCKED' | 'PROMOTIONAL_BLOCKED' | 'CUSTOM' | 'OPT_IN';

export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // e.g. "22:00"
  endTime: string;   // e.g. "07:00"
  timezone: string;  // e.g. "Asia/Kolkata"
  allowCriticalOverride: boolean;
}

export interface UserPreferences {
  userId: string;
  name: string;
  email: string;
  phone: string;
  whatsAppNo: string;
  preferredLanguage: 'en' | 'hi' | 'ta' | 'gu' | 'mr';
  traiDndStatus: TraiDndStatus;
  quietHours: QuietHoursConfig;
  channelMatrix: Record<FinancialCategory, Record<NotificationChannel, boolean>>;
  maxFrequencyCapPerDay: {
    PROMOTIONAL: number;
    SERVICE_EXPLICIT: number;
  };
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  userId: 'USR_1001',
  name: 'Tejal Patel',
  email: 'tejal.patel@fintech.example.com',
  phone: '+919876543210',
  whatsAppNo: '+919876543210',
  preferredLanguage: 'en',
  traiDndStatus: 'PROMOTIONAL_BLOCKED',
  quietHours: {
    enabled: true,
    startTime: '21:00',
    endTime: '09:00',
    timezone: 'Asia/Kolkata',
    allowCriticalOverride: true
  },
  channelMatrix: {
    TRANSACTION: { SMS: true, EMAIL: true, PUSH: true, WHATSAPP: true, IN_APP: true },
    MARGIN_RISK: { SMS: true, EMAIL: true, PUSH: true, WHATSAPP: true, IN_APP: true },
    WEALTH_SIP: { SMS: false, EMAIL: true, PUSH: true, WHATSAPP: true, IN_APP: true },
    PRICE_MARKET: { SMS: false, EMAIL: false, PUSH: true, WHATSAPP: false, IN_APP: true },
    REGULATORY_SAFETY: { SMS: true, EMAIL: true, PUSH: true, WHATSAPP: true, IN_APP: true }
  },
  maxFrequencyCapPerDay: {
    PROMOTIONAL: 3,
    SERVICE_EXPLICIT: 10
  }
};
