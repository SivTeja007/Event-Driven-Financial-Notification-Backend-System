import { NotificationChannel } from './event';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'gu' | 'mr';

export interface LocalizedContent {
  subject?: string;
  title?: string;
  body: string;
  htmlBody?: string;
  actionLabel?: string;
}

export interface NotificationTemplate {
  templateId: string;
  eventType: string;
  channel: NotificationChannel;
  dltHeaderId?: string;
  dltTemplateId?: string;
  locales: Record<SupportedLanguage, LocalizedContent>;
}
