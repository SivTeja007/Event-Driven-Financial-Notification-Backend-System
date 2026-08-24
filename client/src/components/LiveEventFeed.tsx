import React from 'react';
import { Radio, MessageSquare, Mail, Bell, Smartphone, Monitor } from 'lucide-react';
import { StatusTransitionEvent } from '../../../src/types/analytics';

interface Props {
  auditLog: StatusTransitionEvent[];
}

export const LiveEventFeed: React.FC<Props> = ({ auditLog }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone size={18} color="#7C3AED" />;
      case 'EMAIL': return <Mail size={18} color="#06B6D4" />;
      case 'PUSH': return <Bell size={18} color="#D97706" />;
      case 'WHATSAPP': return <MessageSquare size={18} color="#059669" />;
      case 'IN_APP': return <Monitor size={18} color="#111439" />;
      default: return <Radio size={18} color="#111439" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <span className="badge badge-delivered">DELIVERED</span>;
      case 'DISPATCHED': return <span className="badge badge-medium">DISPATCHED</span>;
      case 'TRAI_BLOCKED': return <span className="badge badge-blocked">TRAI DND BLOCKED</span>;
      case 'FREQ_CAP_BLOCKED': return <span className="badge badge-blocked">FREQ CAP BLOCKED</span>;
      case 'QUIET_HOURS_DEFERRED': return <span className="badge badge-deferred">QUIET HOURS DEFERRED</span>;
      case 'FAILED': return <span className="badge badge-critical">FAILED</span>;
      case 'DLQ_EXHAUSTED': return <span className="badge badge-dlq">DLQ EXHAUSTED</span>;
      default: return <span className="badge badge-medium">{status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111439', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio color="#7C3AED" size={22} /> Live Event Dispatch Timeline & Audit Stream
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Showing last {auditLog.length} events</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
        {auditLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748B', fontSize: '0.95rem' }}>
            No dispatch events yet. Use the Financial Event Studio to trigger events or run a batch load simulation.
          </div>
        ) : (
          auditLog.map((item, idx) => (
            <div
              key={`${item.dispatchId}_${idx}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#F8F8F9',
                border: '1px solid rgba(17, 20, 57, 0.08)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid rgba(17, 20, 57, 0.1)' }}>
                  {getChannelIcon(item.channel)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111439', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{item.eventType}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748B', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(17, 20, 57, 0.08)' }}>{item.dispatchId}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>
                    User: <strong>{item.userId}</strong> | Channel: <strong>{item.channel}</strong> {item.latencyMs ? `| SLA: ${item.latencyMs}ms` : ''}
                  </div>
                  {item.reason && (
                    <div style={{ fontSize: '0.775rem', color: '#EF4444', marginTop: '3px', fontWeight: 700 }}>
                      Reason: {item.reason}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                {getStatusBadge(item.status)}
                <span className="font-mono" style={{ fontSize: '0.725rem', color: '#64748B' }}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
