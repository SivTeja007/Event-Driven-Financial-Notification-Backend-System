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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Languages color="#FFFFFF" size={22} /> Multi-Lingual Localisation & DLT Template Studio
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#A1A1AA', marginBottom: '6px' }}>
              Select Event Type:
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: 700 }}
            >
              {Object.keys(FINANCIAL_EVENTS).map(key => (
                <option key={key} value={key} style={{ background: '#1A1B1C', color: '#FFF' }}>
                  {FINANCIAL_EVENTS[key].name} ({key})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px' }}>
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

          <div style={{ marginTop: '14px', padding: '18px', borderRadius: '10px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '10px' }}>DLT Regulatory Registration Compliance</h4>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#A1A1AA' }}>
              <div>DLT Header ID: <code style={{ color: '#34D399', fontWeight: 800 }}>{def.dltHeaderId || 'FINSEC'}</code></div>
              <div>DLT Template ID: <code style={{ color: '#34D399', fontWeight: 800 }}>{def.dltTemplateId || 'DLT_TMPL_001'}</code></div>
              <div>Encoding Standard: <code style={{ color: '#FFFFFF', fontWeight: 800 }}>{selectedLang === 'en' ? 'GSM-7 (160 chars)' : 'UNICODE (70 chars)'}</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rendered Live Preview */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#34D399" size={22} /> Compiled Notification Preview
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rendered.subject && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Email Subject Line:</label>
              <div style={{ padding: '12px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', fontWeight: 800, color: '#FFFFFF' }}>
                {rendered.subject}
              </div>
            </div>
          )}

          {rendered.title && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Push / App Title:</label>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 800, color: '#FDE047' }}>
                {rendered.title}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Message Body Text:</label>
            <div style={{ padding: '16px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {rendered.body}
            </div>
          </div>

          {rendered.actionLabel && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>WhatsApp / In-App Interactive CTA Button:</label>
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
