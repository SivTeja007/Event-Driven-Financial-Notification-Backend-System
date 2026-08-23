import React, { useState } from 'react';
import { Shield, Clock, Sliders, Check, Save } from 'lucide-react';
import { UserPreferences, TraiDndStatus } from '../../../src/types/user';
import { FinancialCategory, NotificationChannel } from '../../../src/types/event';

interface Props {
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => Promise<void>;
}

export const PreferenceManager: React.FC<Props> = ({ preferences, onSavePreferences }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const categories: FinancialCategory[] = ['TRANSACTION', 'MARGIN_RISK', 'WEALTH_SIP', 'PRICE_MARKET', 'REGULATORY_SAFETY'];
  const channels: NotificationChannel[] = ['SMS', 'EMAIL', 'PUSH', 'WHATSAPP', 'IN_APP'];

  const handleDndChange = (status: TraiDndStatus) => {
    setPrefs({ ...prefs, traiDndStatus: status });
  };

  const handleToggleChannel = (category: FinancialCategory, channel: NotificationChannel) => {
    const updatedMatrix = { ...prefs.channelMatrix };
    updatedMatrix[category] = {
      ...updatedMatrix[category],
      [channel]: !updatedMatrix[category][channel]
    };
    setPrefs({ ...prefs, channelMatrix: updatedMatrix });
  };

  const handleSave = async () => {
    await onSavePreferences(prefs);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Save Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders color="#FFFFFF" size={22} /> User Preferences & TRAI DND Compliance Settings
          </h3>
          <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '4px' }}>
            Managing profile for: <strong style={{ color: '#FFFFFF' }}>{prefs.name}</strong> ({prefs.userId})
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> Save Preferences
        </button>
      </div>

      {savedMsg && (
        <div className="glass-panel" style={{ padding: '14px 24px', background: '#FFFFFF', color: '#1A1B1C', fontSize: '0.9rem', fontWeight: 800 }}>
          User preference settings updated successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* TRAI DND Registry Config */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#EF4444" size={20} /> TRAI DND Telecom Compliance Registry Status
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'PROMOTIONAL_BLOCKED', label: 'Block Promotional Traffic Only (Standard DND)', desc: 'Blocks marketing & promotional SMS/Calls. Service implicit alerts allowed.' },
              { id: 'FULLY_BLOCKED', label: 'Full DND Block (Strict)', desc: 'Blocks all promotional & commercial communications.' },
              { id: 'OPT_IN', label: 'Full Opt-In (Receive All)', desc: 'Allow all verified notifications including promotional offers.' }
            ].map(item => (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: prefs.traiDndStatus === item.id ? 'rgba(255, 255, 255, 0.15)' : '#1A1B1C',
                  border: `1px solid ${prefs.traiDndStatus === item.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="dnd"
                  checked={prefs.traiDndStatus === item.id}
                  onChange={() => handleDndChange(item.id as TraiDndStatus)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#FFFFFF' }}>{item.label}</div>
                  <div style={{ fontSize: '0.825rem', color: '#A1A1AA', marginTop: '3px' }}>{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours Config */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock color="#F59E0B" size={20} /> Timezone-Aware Quiet Hours Configuration
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.925rem', color: '#FFFFFF', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.quietHours.enabled}
                onChange={e => setPrefs({ ...prefs, quietHours: { ...prefs.quietHours, enabled: e.target.checked } })}
              />
              <strong>Enable Quiet Hours Window</strong>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Quiet Window Start:</label>
                <input
                  type="time"
                  value={prefs.quietHours.startTime}
                  onChange={e => setPrefs({ ...prefs, quietHours: { ...prefs.quietHours, startTime: e.target.value } })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Quiet Window End:</label>
                <input
                  type="time"
                  value={prefs.quietHours.endTime}
                  onChange={e => setPrefs({ ...prefs, quietHours: { ...prefs.quietHours, endTime: e.target.value } })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: 700 }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.quietHours.allowCriticalOverride}
                onChange={e => setPrefs({ ...prefs, quietHours: { ...prefs.quietHours, allowCriticalOverride: e.target.checked } })}
              />
              Allow Critical Events (Margin Calls, Fraud Alerts) to Override Quiet Hours
            </label>
          </div>
        </div>
      </div>

      {/* Category Channel Matrix Grid */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px' }}>Channel Preference Matrix per Category</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', color: '#A1A1AA' }}>Financial Event Category</th>
              {channels.map(ch => (
                <th key={ch} style={{ padding: '12px 16px', textAlign: 'center', color: '#A1A1AA' }}>{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#FFFFFF' }}>{cat}</td>
                {channels.map(ch => {
                  const isChecked = prefs.channelMatrix[cat]?.[ch] ?? false;
                  return (
                    <td key={ch} style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleChannel(cat, ch)}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
