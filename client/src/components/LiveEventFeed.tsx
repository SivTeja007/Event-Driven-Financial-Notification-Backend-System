import React from 'react';
import { Radio, MessageSquare, Mail, Bell, Smartphone, Monitor } from 'lucide-react';
import { StatusTransitionEvent } from '../../../src/types/analytics';

interface Props {
  auditLog: StatusTransitionEvent[];
}

export const LiveEventFeed: React.FC<Props> = ({ auditLog }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone size={18} color="#FFFFFF" />;
      case 'EMAIL': return <Mail size={18} color="#FFFFFF" />;
      case 'PUSH': return <Bell size={18} color="#FFFFFF" />;
      case 'WHATSAPP': return <MessageSquare size={18} color="#FFFFFF" />;
      case 'IN_APP': return <Monitor size={18} color="#FFFFFF" />;
      default: return <Radio size={18} color="#FFFFFF" />;
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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio color="#FFFFFF" size={22} /> Live Event Dispatch Timeline & Audit Stream
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#A1A1AA', fontWeight: 600 }}>Showing last {auditLog.length} events</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
        {auditLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#A1A1AA', fontSize: '0.95rem' }}>
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
                borderRadius: '10px',
                background: '#1A1B1C',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: '#222426', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  {getChannelIcon(item.channel)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{item.eventType}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#A1A1AA', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{item.dispatchId}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '3px' }}>
                    User: <strong>{item.userId}</strong> | Channel: <strong>{item.channel}</strong> {item.latencyMs ? `| SLA: ${item.latencyMs}ms` : ''}
                  </div>
                  {item.reason && (
                    <div style={{ fontSize: '0.775rem', color: '#F87171', marginTop: '3px', fontWeight: 700 }}>
                      Reason: {item.reason}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                {getStatusBadge(item.status)}
                <span className="font-mono" style={{ fontSize: '0.725rem', color: '#A1A1AA' }}>
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
