import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ChannelPayload } from '../../../src/types/channel';

interface Props {
  dlqMessages: ChannelPayload[];
  onReplayMessage: (dispatchId: string) => Promise<void>;
  onSimulateFault: (channel: string, failureRate: number) => Promise<void>;
}

export const DLQInspector: React.FC<Props> = ({ dlqMessages, onReplayMessage, onSimulateFault }) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('SMS');
  const [failureRate, setFailureRate] = useState<number>(0.8);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [faultMsg, setFaultMsg] = useState<string | null>(null);

  const handleReplay = async (dispatchId: string) => {
    setReplayingId(dispatchId);
    try {
      await onReplayMessage(dispatchId);
    } catch (err: any) {
      alert(`Replay error: ${err.message}`);
    } finally {
      setReplayingId(null);
    }
  };

  const handleInjectFault = async () => {
    try {
      await onSimulateFault(selectedChannel, failureRate);
      setFaultMsg(`Injected ${Math.round(failureRate * 100)}% failure rate into ${selectedChannel} provider!`);
      setTimeout(() => setFaultMsg(null), 4000);
    } catch (err: any) {
      alert(`Fault injection failed: ${err.message}`);
    }
  };

  const handleResetCircuits = async () => {
    try {
      await onSimulateFault('SMS', 0.0);
      await onSimulateFault('EMAIL', 0.0);
      setFaultMsg('All provider circuits reset to 100% HEALTHY (CLOSED state).');
      setTimeout(() => setFaultMsg(null), 4000);
    } catch (err: any) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Provider Fault Injection & Circuit Breaker Simulator */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C3AED', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap color="#7C3AED" size={22} /> Provider Chaos Simulator & Circuit Breaker Test Studio
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Inject provider network outages to test Circuit Breakers, Exponential Backoff Retries, Fallback Routing (e.g. SMS -&gt; WhatsApp), and DLQ persistence.
        </p>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Target Channel Provider:</label>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', background: '#F8F8F9', border: '1px solid rgba(17, 20, 57, 0.15)', color: '#111439', fontWeight: 800 }}
            >
              {['SMS', 'EMAIL', 'PUSH', 'WHATSAPP', 'IN_APP'].map(ch => (
                <option key={ch} value={ch} style={{ background: '#FFF', color: '#111439' }}>{ch} Provider</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Failure Rate ({Math.round(failureRate * 100)}%):</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={failureRate}
              onChange={e => setFailureRate(Number(e.target.value))}
              style={{ display: 'block', width: '150px', marginTop: '8px' }}
            />
          </div>

          <button className="btn btn-danger" onClick={handleInjectFault} style={{ marginTop: '16px', justifyContent: 'center' }}>
            <AlertTriangle size={16} /> Inject Outage
          </button>

          <button className="btn btn-secondary" onClick={handleResetCircuits} style={{ marginTop: '16px' }}>
            <RefreshCw size={16} /> Heal & Reset All Circuits
          </button>
        </div>

        {faultMsg && (
          <div style={{ marginTop: '16px', fontSize: '0.875rem', color: '#D97706', fontWeight: 800 }}>
            {faultMsg}
          </div>
        )}
      </div>

      {/* DLQ Messages List */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle color="#EF4444" size={22} /> Dead-Letter Queue (DLQ) Store ({dlqMessages.length})
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Messages requiring manual replay or intervention</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {dlqMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748B', fontSize: '0.95rem' }}>
              🎉 Zero DLQ messages! System is running healthy with zero unhandled failures.
            </div>
          ) : (
            dlqMessages.map(msg => (
              <div
                key={msg.dispatchId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#FFE4E6',
                  border: '1px solid #FECDD3'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#9F1239', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>[{msg.channel}] {msg.eventType}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748B', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>ID: {msg.dispatchId}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#111439', marginTop: '6px' }}>
                    {msg.content.body}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#9F1239', marginTop: '6px', fontWeight: 700 }}>
                    Failure Reason: {msg.failureReason || 'Max retries exhausted'} | Retries Attempted: {msg.retryCount}/{msg.maxRetries}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleReplay(msg.dispatchId)}
                  disabled={replayingId === msg.dispatchId}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <RefreshCw size={14} className={replayingId === msg.dispatchId ? 'animate-spin' : ''} />
                  {replayingId === msg.dispatchId ? 'Replaying...' : 'Replay Message'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
