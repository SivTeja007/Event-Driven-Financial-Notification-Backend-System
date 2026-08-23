export type FinancialCategory = 
  | 'TRANSACTION' 
  | 'MARGIN_RISK' 
  | 'WEALTH_SIP' 
  | 'PRICE_MARKET' 
  | 'REGULATORY_SAFETY';

export type EventPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP' | 'IN_APP';

export type NotificationCategoryType = 'TRANSACTIONAL' | 'SERVICE_IMPLICIT' | 'SERVICE_EXPLICIT' | 'PROMOTIONAL';

export interface FinancialEventPayload {
  eventId: string;
  eventType: string;
  category: FinancialCategory;
  classification: NotificationCategoryType;
  priority: EventPriority;
  userId: string;
  timestamp: string; // ISO String
  templateData: Record<string, any>;
  metadata?: {
    accountNo?: string;
    amount?: number;
    currency?: string;
    dltHeaderId?: string;
    dltTemplateId?: string;
    sourceApp?: string;
    ipAddress?: string;
    [key: string]: any;
  };
}

export interface EventDefinition {
  type: string;
  name: string;
  category: FinancialCategory;
  classification: NotificationCategoryType;
  defaultPriority: EventPriority;
  supportedChannels: NotificationChannel[];
  description: string;
  dltTemplateId?: string;
  dltHeaderId?: string;
  sampleData: Record<string, any>;
}

export const FINANCIAL_EVENTS: Record<string, EventDefinition> = {
  // 1. TRANSACTION ALERTS (5)
  'TXN_HIGH_VALUE_DEBIT': {
    type: 'TXN_HIGH_VALUE_DEBIT',
    name: 'High-Value Debit Alert',
    category: 'TRANSACTION',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['PUSH', 'SMS', 'IN_APP', 'WHATSAPP'],
    description: 'Triggered when a debit transaction exceeds user-defined security threshold.',
    dltHeaderId: 'BANKTX',
    dltTemplateId: 'DLT_TXN_001',
    sampleData: { userName: 'Tejal Patel', amount: 45000, currency: 'INR', accountEnd: '9842', merchant: 'Tanishq Jewellers', timestamp: '2026-08-23 18:30:00' }
  },
  'TXN_SALARY_CREDIT': {
    type: 'TXN_SALARY_CREDIT',
    name: 'Salary Credit Notice',
    category: 'TRANSACTION',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['EMAIL', 'PUSH', 'IN_APP', 'WHATSAPP'],
    description: 'Monthly salary credit deposit alert.',
    dltHeaderId: 'BANKTX',
    dltTemplateId: 'DLT_TXN_002',
    sampleData: { userName: 'Tejal Patel', amount: 185000, currency: 'INR', company: 'Google India', month: 'August 2026' }
  },
  'TXN_ATM_WITHDRAWAL': {
    type: 'TXN_ATM_WITHDRAWAL',
    name: 'ATM Cash Withdrawal',
    category: 'TRANSACTION',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['SMS', 'PUSH', 'IN_APP'],
    description: 'Instant notification on physical cash withdrawal from ATM.',
    dltHeaderId: 'BANKTX',
    dltTemplateId: 'DLT_TXN_003',
    sampleData: { userName: 'Tejal Patel', amount: 10000, currency: 'INR', atmLocation: 'MG Road HDFC ATM, Bengaluru', cardEnd: '4112' }
  },
  'TXN_INTL_CARD': {
    type: 'TXN_INTL_CARD',
    name: 'International Card Transaction',
    category: 'TRANSACTION',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'CRITICAL',
    supportedChannels: ['SMS', 'PUSH', 'WHATSAPP', 'IN_APP'],
    description: 'Alert for foreign currency card swipes for fraud detection.',
    dltHeaderId: 'BANKSEC',
    dltTemplateId: 'DLT_TXN_004',
    sampleData: { userName: 'Tejal Patel', amount: 249.99, currency: 'USD', inrEquiv: 20999, merchant: 'AWS US-EAST Cloud Services' }
  },
  'TXN_UPI_RECEIVED': {
    type: 'TXN_UPI_RECEIVED',
    name: 'UPI Payment Received',
    category: 'TRANSACTION',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'LOW',
    supportedChannels: ['PUSH', 'IN_APP'],
    description: 'Real-time UPI payment credit notification.',
    dltHeaderId: 'BANKUPI',
    dltTemplateId: 'DLT_TXN_005',
    sampleData: { userName: 'Tejal Patel', amount: 1250, currency: 'INR', sender: 'rahul.sharma@okaxis', vpa: 'tejal@okicici' }
  },

  // 2. MARGIN & RISK ALERTS (5)
  'MARGIN_CALL_CRITICAL': {
    type: 'MARGIN_CALL_CRITICAL',
    name: 'Critical Margin Shortfall Call',
    category: 'MARGIN_RISK',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'CRITICAL',
    supportedChannels: ['SMS', 'WHATSAPP', 'PUSH', 'EMAIL', 'IN_APP'],
    description: 'Urgent notice when margin balance drops below 15% maintenance ratio.',
    dltHeaderId: 'FINRISK',
    dltTemplateId: 'DLT_RSK_001',
    sampleData: { userName: 'Tejal Patel', shortfallAmount: 75000, currentMargin: '12%', deadline: '11:30 AM Tomorrow', accountId: 'BROK-8821' }
  },
  'RISK_STOP_LOSS': {
    type: 'RISK_STOP_LOSS',
    name: 'Stop-Loss Order Executed',
    category: 'MARGIN_RISK',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['PUSH', 'SMS', 'IN_APP'],
    description: 'Automated order execution trigger when price hits stop loss limit.',
    dltHeaderId: 'FINRISK',
    dltTemplateId: 'DLT_RSK_002',
    sampleData: { userName: 'Tejal Patel', symbol: 'RELIANCE', triggerPrice: 2850, executedPrice: 2848.5, qty: 100 }
  },
  'RISK_LIQUIDATION_WARN': {
    type: 'RISK_LIQUIDATION_WARN',
    name: 'Impending Liquidation Warning',
    category: 'MARGIN_RISK',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'CRITICAL',
    supportedChannels: ['SMS', 'PUSH', 'WHATSAPP', 'EMAIL', 'IN_APP'],
    description: 'Warning before system square-off of leveraged positions.',
    dltHeaderId: 'FINRISK',
    dltTemplateId: 'DLT_RSK_003',
    sampleData: { userName: 'Tejal Patel', portfolioId: 'F&O-9912', openLoss: 142000, squareOffTime: '03:15 PM' }
  },
  'RISK_OPTIONS_EXPIRY': {
    type: 'RISK_OPTIONS_EXPIRY',
    name: 'Derivative Options Expiry Alert',
    category: 'MARGIN_RISK',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['EMAIL', 'PUSH', 'IN_APP', 'WHATSAPP'],
    description: 'Weekly/Monthly F&O contracts expiring today alert.',
    dltHeaderId: 'FINRISK',
    dltTemplateId: 'DLT_RSK_004',
    sampleData: { userName: 'Tejal Patel', position: 'NIFTY 24500 CE', contractCount: 4, expiryDate: '2026-08-27' }
  },
  'RISK_MTM_LOSS': {
    type: 'RISK_MTM_LOSS',
    name: 'Mark-to-Market Loss Alert',
    category: 'MARGIN_RISK',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['PUSH', 'IN_APP', 'EMAIL'],
    description: 'Unrealized portfolio daily loss exceeded configured limit.',
    dltHeaderId: 'FINRISK',
    dltTemplateId: 'DLT_RSK_005',
    sampleData: { userName: 'Tejal Patel', currentMtmLoss: 35000, thresholdLimit: 25000, date: '2026-08-23' }
  },

  // 3. WEALTH & INVESTMENT / SIP (5)
  'SIP_DUE_REMINDER': {
    type: 'SIP_DUE_REMINDER',
    name: 'SIP Installment Due Reminder',
    category: 'WEALTH_SIP',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['PUSH', 'WHATSAPP', 'EMAIL', 'IN_APP'],
    description: 'Reminder 2 days prior to auto-debit of mutual fund SIP.',
    dltHeaderId: 'WEALTH',
    dltTemplateId: 'DLT_SIP_001',
    sampleData: { userName: 'Tejal Patel', fundName: 'HDFC Parag Parikh Flexi Cap Fund', sipAmount: 15000, dueDate: '2026-08-25' }
  },
  'MUTUAL_FUND_NAV': {
    type: 'MUTUAL_FUND_NAV',
    name: 'Mutual Fund NAV Alert',
    category: 'WEALTH_SIP',
    classification: 'PROMOTIONAL',
    defaultPriority: 'LOW',
    supportedChannels: ['PUSH', 'IN_APP', 'EMAIL'],
    description: 'Target Net Asset Value hit notification for watchlist fund.',
    dltHeaderId: 'WEALTH',
    dltTemplateId: 'DLT_SIP_002',
    sampleData: { userName: 'Tejal Patel', fundName: 'Mirae Asset Large Cap Fund', nav: 112.45, changePercent: '+1.85%' }
  },
  'DIVIDEND_CREDITED': {
    type: 'DIVIDEND_CREDITED',
    name: 'Stock Dividend Payout Notice',
    category: 'WEALTH_SIP',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'LOW',
    supportedChannels: ['EMAIL', 'IN_APP'],
    description: 'Corporate action dividend credited to demat linked bank account.',
    dltHeaderId: 'WEALTH',
    dltTemplateId: 'DLT_SIP_003',
    sampleData: { userName: 'Tejal Patel', companyName: 'TCS Ltd', dividendPerShare: 28.00, totalAmount: 7000, sharesHeld: 250 }
  },
  'BOND_COUPON_PAID': {
    type: 'BOND_COUPON_PAID',
    name: 'Sovereign / Corporate Bond Coupon Credit',
    category: 'WEALTH_SIP',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['EMAIL', 'IN_APP', 'SMS'],
    description: 'Semi-annual interest coupon payment credit notice.',
    dltHeaderId: 'WEALTH',
    dltTemplateId: 'DLT_SIP_004',
    sampleData: { userName: 'Tejal Patel', bondName: 'GOI 7.26% 2033 Sovereign Gold Bond', couponAmount: 18150 }
  },
  'PORTFOLIO_REBALANCE': {
    type: 'PORTFOLIO_REBALANCE',
    name: 'Portfolio Rebalancing Suggestion',
    category: 'WEALTH_SIP',
    classification: 'PROMOTIONAL',
    defaultPriority: 'LOW',
    supportedChannels: ['EMAIL', 'PUSH', 'IN_APP'],
    description: 'AI recommendation when equity/debt ratio drifts from target.',
    dltHeaderId: 'WEALTH',
    dltTemplateId: 'DLT_SIP_005',
    sampleData: { userName: 'Tejal Patel', currentEquityRatio: '78%', targetRatio: '65%', recommendedAction: 'Trim Small Cap Equity by 13%' }
  },

  // 4. PRICE & MARKET ALERTS (5)
  'PRICE_52WK_BREAKOUT': {
    type: 'PRICE_52WK_BREAKOUT',
    name: '52-Week High / Low Breakout',
    category: 'PRICE_MARKET',
    classification: 'PROMOTIONAL',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['PUSH', 'IN_APP', 'WHATSAPP'],
    description: 'Alert when a watchlist stock hits new 52-week price extremes.',
    dltHeaderId: 'MKTALRT',
    dltTemplateId: 'DLT_MKT_001',
    sampleData: { userName: 'Tejal Patel', symbol: 'INFY', newPrice: 1980.50, milestone: '52-Week All Time High' }
  },
  'PRICE_TARGET_HIT': {
    type: 'PRICE_TARGET_HIT',
    name: 'Custom Stock Price Target Hit',
    category: 'PRICE_MARKET',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['PUSH', 'SMS', 'IN_APP'],
    description: 'User-configured custom price alert triggered.',
    dltHeaderId: 'MKTALRT',
    dltTemplateId: 'DLT_MKT_002',
    sampleData: { userName: 'Tejal Patel', symbol: 'TATAMOTORS', targetPrice: 1100, currentPrice: 1104.20 }
  },
  'MARKET_CIRCUIT_LIMIT': {
    type: 'MARKET_CIRCUIT_LIMIT',
    name: 'Upper / Lower Circuit Limit Triggered',
    category: 'PRICE_MARKET',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['PUSH', 'IN_APP'],
    description: 'Trading halt notice when stock hits 10% / 20% circuit filter.',
    dltHeaderId: 'MKTALRT',
    dltTemplateId: 'DLT_MKT_003',
    sampleData: { userName: 'Tejal Patel', symbol: 'SUZLON', circuitType: 'UPPER CIRCUIT (20%)', price: 64.80 }
  },
  'MARKET_VOLUME_SPIKE': {
    type: 'MARKET_VOLUME_SPIKE',
    name: 'Unusual Volume Spike Notice',
    category: 'PRICE_MARKET',
    classification: 'PROMOTIONAL',
    defaultPriority: 'LOW',
    supportedChannels: ['PUSH', 'IN_APP'],
    description: 'Institutional volume spike alert on held portfolio stocks.',
    dltHeaderId: 'MKTALRT',
    dltTemplateId: 'DLT_MKT_004',
    sampleData: { userName: 'Tejal Patel', symbol: 'ICICIBANK', volumeMultiple: '4.8x Average', buyRatio: '82%' }
  },
  'CRYPTO_VOLATILITY': {
    type: 'CRYPTO_VOLATILITY',
    name: 'Crypto / FX Volatility Spike',
    category: 'PRICE_MARKET',
    classification: 'PROMOTIONAL',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['PUSH', 'WHATSAPP', 'IN_APP'],
    description: 'Rapid 10%+ price fluctuation alert in 15-minute window.',
    dltHeaderId: 'MKTALRT',
    dltTemplateId: 'DLT_MKT_005',
    sampleData: { userName: 'Tejal Patel', pair: 'BTC/INR', moveDirection: 'UP', changePercentage: '+8.4%', price: 5840000 }
  },

  // 5. REGULATORY & SAFETY (5)
  'REG_DND_OPT_OUT': {
    type: 'REG_DND_OPT_OUT',
    name: 'TRAI DND Opt-Out Confirmation',
    category: 'REGULATORY_SAFETY',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'MEDIUM',
    supportedChannels: ['SMS', 'EMAIL', 'IN_APP'],
    description: 'Confirmation message after user modifies DND telecom preference.',
    dltHeaderId: 'COMPLNC',
    dltTemplateId: 'DLT_REG_001',
    sampleData: { userName: 'Tejal Patel', status: 'PROMOTIONAL_BLOCKED', referenceNo: 'DND-883912' }
  },
  'REG_KYC_RENEWAL': {
    type: 'REG_KYC_RENEWAL',
    name: 'Mandatory CKYC Renewal Notice',
    category: 'REGULATORY_SAFETY',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'HIGH',
    supportedChannels: ['EMAIL', 'PUSH', 'WHATSAPP', 'IN_APP'],
    description: 'SEBI regulatory deadline notice to re-verify KYC documents.',
    dltHeaderId: 'COMPLNC',
    dltTemplateId: 'DLT_REG_002',
    sampleData: { userName: 'Tejal Patel', deadlineDays: 14, ckycId: 'IN-992144123', portalUrl: 'https://kyc.fintech.in/verify' }
  },
  'REG_TAX_STATEMENT': {
    type: 'REG_TAX_STATEMENT',
    name: 'Annual Capital Gains Tax Statement Ready',
    category: 'REGULATORY_SAFETY',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'LOW',
    supportedChannels: ['EMAIL', 'IN_APP'],
    description: 'Filing statement (Form 26AS/AIS reconciled) ready for download.',
    dltHeaderId: 'COMPLNC',
    dltTemplateId: 'DLT_REG_003',
    sampleData: { userName: 'Tejal Patel', financialYear: 'FY 2025-26', stcg: 42000, ltcg: 110000 }
  },
  'REG_DEMAT_AUDIT': {
    type: 'REG_DEMAT_AUDIT',
    name: 'Monthly NSDL/CDSL Demat Holding Audit',
    category: 'REGULATORY_SAFETY',
    classification: 'SERVICE_EXPLICIT',
    defaultPriority: 'LOW',
    supportedChannels: ['EMAIL'],
    description: 'Mandatory monthly holding statement directly sent to investor.',
    dltHeaderId: 'COMPLNC',
    dltTemplateId: 'DLT_REG_004',
    sampleData: { userName: 'Tejal Patel', dpId: 'IN300123', totalValuation: 2450000, totalScrips: 18 }
  },
  'SECURITY_FRAUD_ALERT': {
    type: 'SECURITY_FRAUD_ALERT',
    name: 'Security & Suspicious Login Warning',
    category: 'REGULATORY_SAFETY',
    classification: 'SERVICE_IMPLICIT',
    defaultPriority: 'CRITICAL',
    supportedChannels: ['SMS', 'PUSH', 'WHATSAPP', 'EMAIL', 'IN_APP'],
    description: 'Critical security alert for unrecognized device/IP location login.',
    dltHeaderId: 'BANKSEC',
    dltTemplateId: 'DLT_REG_005',
    sampleData: { userName: 'Tejal Patel', device: 'Chrome on MacOS (London, UK)', ipAddress: '185.220.101.4', time: '2026-08-23 18:24 IST' }
  }
};
