import React, { useState } from 'react';
import { Languages, FileText, CheckCircle } from 'lucide-react';
import { FINANCIAL_EVENTS } from '../../../src/types/event';
import { SupportedLanguage } from '../../../src/types/template';
import { TemplateEngine } from '../../../src/engine/templateEngine';

const engine = new TemplateEngine();

export const TemplateStudio: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('MARGIN_CALL_CRITICAL');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');

  const def = FINANCIAL_EVENTS[selectedType] || FINANCIAL_EVENTS['MARGIN_CALL_CRITICAL'];
  const rendered = engine.render(selectedType, 'SMS', selectedLang, { ...def.sampleData, userName: 'Tejal Patel' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Template Selectors */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111439', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Languages color="#7C3AED" size={22} /> Multi-Lingual Localisation & DLT Template Studio
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
              Select Event Type:
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#F8F8F9', border: '1px solid rgba(17, 20, 57, 0.15)', color: '#111439', fontWeight: 700 }}
            >
              {Object.keys(FINANCIAL_EVENTS).map(key => (
                <option key={key} value={key} style={{ background: '#FFF', color: '#111439' }}>
                  {FINANCIAL_EVENTS[key].name} ({key})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
              Select Localisation Language:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'ta', label: 'Tamil (தமிழ்)' },
                { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
                { code: 'mr', label: 'Marathi (मराठी)' }
              ].map(lang => (
                <button
                  key={lang.code}
                  className={`btn ${selectedLang === lang.code ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedLang(lang.code as SupportedLanguage)}
                  style={{ fontSize: '0.825rem', padding: '8px 16px' }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '18px', borderRadius: '12px', background: '#F8F8F9', border: '1px solid rgba(17, 20, 57, 0.08)' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#111439', fontWeight: 800, marginBottom: '10px' }}>DLT Regulatory Registration Compliance</h4>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#64748B' }}>
              <div>DLT Header ID: <code style={{ color: '#059669', fontWeight: 800 }}>{def.dltHeaderId || 'FINSEC'}</code></div>
              <div>DLT Template ID: <code style={{ color: '#059669', fontWeight: 800 }}>{def.dltTemplateId || 'DLT_TMPL_001'}</code></div>
              <div>Encoding Standard: <code style={{ color: '#7C3AED', fontWeight: 800 }}>{selectedLang === 'en' ? 'GSM-7 (160 chars)' : 'UNICODE (70 chars)'}</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rendered Live Preview */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#059669" size={22} /> Compiled Notification Preview
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rendered.subject && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Email Subject Line:</label>
              <div style={{ padding: '12px', borderRadius: '8px', background: '#F8F8F9', border: '1px solid rgba(17, 20, 57, 0.15)', fontWeight: 800, color: '#111439' }}>
                {rendered.subject}
              </div>
            </div>
          )}

          {rendered.title && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Push / App Title:</label>
              <div style={{ padding: '12px', borderRadius: '8px', background: '#FEF3C7', border: '1px solid #FDE68A', fontWeight: 800, color: '#92400E' }}>
                {rendered.title}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Message Body Text:</label>
            <div style={{ padding: '16px', borderRadius: '10px', background: '#F8F8F9', border: '1px solid rgba(17, 20, 57, 0.15)', color: '#111439', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {rendered.body}
            </div>
          </div>

          {rendered.actionLabel && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>WhatsApp / In-App Interactive CTA Button:</label>
              <div style={{ marginTop: '6px' }}>
                <button className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                  {rendered.actionLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
