import { NotificationChannel, EventPriority, FinancialCategory, NotificationCategoryType } from './event';

export type DeliveryStatus = 
  | 'PENDING'
  | 'ENQUEUED'
  | 'TRAI_BLOCKED'
  | 'FREQ_CAP_BLOCKED'
  | 'QUIET_HOURS_DEFERRED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'DLQ_RETRY'
  | 'DLQ_EXHAUSTED';

export interface ChannelPayload {
  dispatchId: string;
  eventId: string;
  eventType: string;
  category: FinancialCategory;
  classification: NotificationCategoryType;
  priority: EventPriority;
  userId: string;
  channel: NotificationChannel;
  recipient: {
    phone?: string;
    email?: string;
    pushToken?: string;
    whatsAppNo?: string;
    userId: string;
  };
  content: {
    subject?: string;
    title?: string;
    body: string;
    htmlBody?: string;
    mediaUrl?: string;
    deepLink?: string;
    actionButtons?: Array<{ label: string; action: string }>;
  };
  metadata: {
    dltHeaderId?: string;
    dltTemplateId?: string;
    characterCount?: number;
    partsCount?: number;
    encoding?: 'GSM7' | 'UNICODE';
    [key: string]: any;
  };
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  status: DeliveryStatus;
  failureReason?: string;
  providerResponse?: any;
}

export interface RoutingDecision {
  allowed: boolean;
  selectedChannels: NotificationChannel[];
  reason?: string;
  deferredUntil?: string; // ISO Date string if quiet hours deferred
  dndBlocked?: boolean;
  freqCapBlocked?: boolean;
}
