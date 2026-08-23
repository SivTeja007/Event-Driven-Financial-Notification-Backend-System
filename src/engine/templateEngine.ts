import { SupportedLanguage, NotificationTemplate } from '../types/template';
import { NotificationChannel, FINANCIAL_EVENTS } from '../types/event';

export class TemplateEngine {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initDefaultTemplates();
  }

  /**
   * Render template with dynamic variables and localisation formatting
   */
  public render(
    eventType: string,
    channel: NotificationChannel,
    lang: SupportedLanguage = 'en',
    data: Record<string, any>
  ): { subject?: string; title?: string; body: string; htmlBody?: string; actionLabel?: string } {
    const key = `${eventType}_${channel}`;
    const template = this.templates.get(key) || this.generateFallbackTemplate(eventType, channel);
    
    const localeContent = template.locales[lang] || template.locales['en'] || { body: `Event ${eventType}` };

    return {
      subject: localeContent.subject ? this.interpolate(localeContent.subject, data) : undefined,
      title: localeContent.title ? this.interpolate(localeContent.title, data) : undefined,
      body: this.interpolate(localeContent.body, data),
      htmlBody: localeContent.htmlBody ? this.interpolate(localeContent.htmlBody, data) : undefined,
      actionLabel: localeContent.actionLabel ? this.interpolate(localeContent.actionLabel, data) : undefined,
    };
  }

  /**
   * String interpolation with formatting helpers like {{currency amount}}, {{date timestamp}}
   */
  private interpolate(text: string, data: Record<string, any>): string {
    return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path) => {
      const value = this.getValueByPath(data, path);
      if (value === undefined || value === null) return '';

      // Check if number formatting applies
      if (typeof value === 'number' && path.toLowerCase().includes('amount')) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: data.currency || 'INR' }).format(value);
      }

      return String(value);
    });
  }

  private getValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  public registerTemplate(template: NotificationTemplate) {
    const key = `${template.eventType}_${template.channel}`;
    this.templates.set(key, template);
  }

  private generateFallbackTemplate(eventType: string, channel: NotificationChannel): NotificationTemplate {
    const eventDef = FINANCIAL_EVENTS[eventType];
    const name = eventDef ? eventDef.name : eventType;

    return {
      templateId: `TMPL_${eventType}_${channel}`,
      eventType,
      channel,
      locales: {
        en: {
          title: `Alert: ${name}`,
          subject: `[FINANCE] ${name}`,
          body: `Dear {{userName}}, notification regarding ${name}. Event details: {{amount}} {{symbol}} {{deadline}}.`
        },
        hi: {
          title: `सूचना: ${name}`,
          subject: `[फाइनेंस] ${name}`,
          body: `प्रिय {{userName}}, ${name} के बारे में महत्वपूर्ण सूचना। विवरण: {{amount}} {{symbol}}।`
        },
        ta: {
          title: `அறிவிப்பு: ${name}`,
          subject: `[நிதியும்] ${name}`,
          body: `அன்புள்ள {{userName}}, ${name} பற்றிய தகவல். விவரங்கள்: {{amount}} {{symbol}}.`
        },
        gu: {
          title: `સૂચના: ${name}`,
          subject: `[નાણાકીય] ${name}`,
          body: `પ્રિય {{userName}}, ${name} અંગે ની આપની માહિતી. વિગત: {{amount}} {{symbol}}.`
        },
        mr: {
          title: `सूचना: ${name}`,
          subject: `[आर्थिक] ${name}`,
          body: `प्रिय {{userName}}, ${name} बद्दल महत्त्वाची सूचना. माहिती: {{amount}} {{symbol}}.`
        }
      }
    };
  }

  private initDefaultTemplates() {
    // Populate templates for key events
    Object.keys(FINANCIAL_EVENTS).forEach(eventType => {
      const eventDef = FINANCIAL_EVENTS[eventType];
      eventDef.supportedChannels.forEach(channel => {
        this.templates.set(`${eventType}_${channel}`, this.buildDefaultTemplate(eventDef, channel));
      });
    });
  }

  private buildDefaultTemplate(eventDef: any, channel: NotificationChannel): NotificationTemplate {
    const type = eventDef.type;
    
    // Customized rich templates for specific event types
    if (type === 'MARGIN_CALL_CRITICAL') {
      return {
        templateId: `TMPL_${type}_${channel}`,
        eventType: type,
        channel,
        dltHeaderId: eventDef.dltHeaderId,
        dltTemplateId: eventDef.dltTemplateId,
        locales: {
          en: {
            subject: 'URGENT: Critical Margin Call Notice for Account {{accountId}}',
            title: '⚠️ Critical Margin Call Warning',
            body: 'URGENT: Dear {{userName}}, your margin balance is below 15%. Shortfall amount is {{shortfallAmount}}. Please add funds before {{deadline}} to avoid auto-liquidation.',
            htmlBody: '<div style="font-family:sans-serif; padding:20px; border-left:4px solid #ef4444;"><h2>CRITICAL MARGIN CALL</h2><p>Account: {{accountId}}</p><p>Shortfall: <strong>{{shortfallAmount}}</strong></p><p>Deadline: {{deadline}}</p></div>',
            actionLabel: 'Add Funds Now'
          },
          hi: {
            subject: 'अति आवश्यक: खाता {{accountId}} के लिए मार्जिन कॉल नोटिस',
            title: '⚠️ क्रिटिकल मार्जिन कॉल चेतावनी',
            body: 'अति आवश्यक: प्रिय {{userName}}, आपका मार्जिन बैलेंस 15% से नीचे है। कमी राशि {{shortfallAmount}} है। ऑटो-लिक्विडेशन से बचने के लिए {{deadline}} से पहले फंड जोड़ें।',
            actionLabel: 'फंड जोड़ें'
          },
          ta: {
            subject: 'அவசரம்: கணக்கு {{accountId}} க்கான மார்ஜின் அழைப்பு',
            title: '⚠️ மார்ஜின் குறைபாடு எச்சரிக்கை',
            body: 'அவசரம்: {{userName}}, உங்கள் மார்ஜின் 15% க்கும் குறைவாக உள்ளது. பற்றாக்குறை {{shortfallAmount}}. {{deadline}} க்குள் பணத்தை சேர்க்கவும்.',
            actionLabel: 'பணம் சேர்க்க'
          },
          gu: {
            subject: 'જરૂરી: એકાઉન્ટ {{accountId}} માટે માર્જિન કૉલ నోટિસ',
            title: '⚠️ માર્જિન ચેતવણી',
            body: 'જરૂરી: પ્રિય {{userName}}, આપનું માર્જિન 15% થી ઓછું છે. ઘટતી રકમ {{shortfallAmount}} છે. {{deadline}} પહેલાં ફંડ ઉમેરો.',
            actionLabel: 'ફંડ ઉમેરો'
          },
          mr: {
            subject: 'अत्यंत महत्त्वाचे: खाते {{accountId}} साठी मार्जिन कॉल',
            title: '⚠️ मार्जिन कॉल इशारा',
            body: 'अत्यंत महत्त्वाचे: प्रिय {{userName}}, तुमचे मार्जिन १५% पेक्षा कमी आहे. तुटवडा {{shortfallAmount}} आहे. {{deadline}} पूर्वी निधी जमा करा.',
            actionLabel: 'निधी जमा करा'
          }
        }
      };
    }

    if (type === 'TXN_HIGH_VALUE_DEBIT') {
      return {
        templateId: `TMPL_${type}_${channel}`,
        eventType: type,
        channel,
        dltHeaderId: eventDef.dltHeaderId,
        dltTemplateId: eventDef.dltTemplateId,
        locales: {
          en: {
            subject: 'High Value Debit Alert: {{amount}} debited from account ending {{accountEnd}}',
            title: '💳 High Value Debit Alert',
            body: 'Alert: {{amount}} was debited from your A/C ending {{accountEnd}} at {{merchant}} on {{timestamp}}. If not done by you, report immediately.',
            htmlBody: '<div><h3>Debit Notification</h3><p>Amount: {{amount}}</p><p>Merchant: {{merchant}}</p></div>',
            actionLabel: 'Report Fraud'
          },
          hi: {
            subject: 'उच्च मूल्य डेबिट अलर्ट: {{accountEnd}} से {{amount}} काटा गया',
            title: '💳 उच्च मूल्य डेबिट अलर्ट',
            body: 'अलर्ट: आपके खाते (अंतिम {{accountEnd}}) से {{merchant}} पर {{amount}} काटा गया। यदि यह आपने नहीं किया तो तुरंत रिपोर्ट करें।',
            actionLabel: 'रिपोर्ट करें'
          },
          ta: {
            subject: 'பணப் பிடித்தம் எச்சரிக்கை: {{amount}} கணக்கிலிருந்து எடுக்கப்பட்டது',
            title: '💳 பற்று எச்சரிக்கை',
            body: 'எச்சரிக்கை: உங்கள் கணக்கு {{accountEnd}} இலிருந்து {{amount}} {{merchant}} இல் எடுக்கப்பட்டது.',
            actionLabel: 'புகார் செய்ய'
          },
          gu: {
            subject: 'હાઇ વેલ્યુ ડેબિટ એલર્ટ: {{amount}} ખાતામાંથી કપાયા',
            title: '💳 ડેબિટ એલર્ટ',
            body: 'એલર્ટ: આપના એકાઉન્ટ {{accountEnd}} માંથી {{amount}} {{merchant}} ખાતે ડેબિટ થયા.',
            actionLabel: 'રિપોર્ટ કરો'
          },
          mr: {
            subject: 'मोठ्या रकमेचे डेबिट: {{amount}} खात्यातून वजा झाले',
            title: '💳 डेबिट सूचना',
            body: 'इशारा: तुमच्या खाते {{accountEnd}} मधून {{merchant}} येथे {{amount}} वजा झाले.',
            actionLabel: 'तक्रार करा'
          }
        }
      };
    }

    // Generic default for all other types
    return this.generateFallbackTemplate(type, channel);
  }
}
