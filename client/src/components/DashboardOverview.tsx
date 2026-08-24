import React from 'react';
import { Activity, CheckCircle, ShieldAlert, Clock, AlertTriangle, Cpu, DollarSign, Zap } from 'lucide-react';
import { DeliveryMetricSnapshot } from '../../../src/types/analytics';

interface Props {
  snapshot: DeliveryMetricSnapshot;
  isConnected: boolean;
}

export const DashboardOverview: React.FC<Props> = ({ snapshot, isConnected }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', color: '#111439' }}>
            <Zap color="#7C3AED" size={30} style={{ filter: 'drop-shadow(0 4px 12px rgba(124, 58, 237, 0.4))' }} /> 
            <span>Financial Telemetry Control Engine</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
            Processing 25+ Financial Event Types across SMS, Email, Push, WhatsApp, and In-App channels.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 18px',
          borderRadius: '30px',
          background: isConnected ? 'rgba(124, 58, 237, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isConnected ? 'rgba(124, 58, 237, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          <div className={isConnected ? "pulse-dot" : ""} style={!isConnected ? { width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' } : {}} />
          <span style={{ fontSize: '0.775rem', fontWeight: 800, letterSpacing: '0.06em', color: isConnected ? '#7C3AED' : '#EF4444' }}>
            {isConnected ? 'LIVE WEBSOCKET STREAM' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Throughput (TPS)</span>
            <Activity color="#7C3AED" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111439' }}>
            {snapshot.throughputTps} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>tps</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            Total Ingested: <strong style={{ color: '#111439' }}>{snapshot.totalIngested}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Delivery SLA Rate</span>
            <CheckCircle color="#059669" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669' }}>
            {snapshot.deliverySuccessRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            Delivered: <strong style={{ color: '#111439' }}>{snapshot.totalDelivered}</strong> / Dispatched: <strong style={{ color: '#111439' }}>{snapshot.totalDispatched}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>SLA Latency (P95)</span>
            <Cpu color="#06B6D4" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111439' }}>
            {snapshot.p95LatencyMs} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>ms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            P50: <strong style={{ color: '#111439' }}>{snapshot.p50LatencyMs}ms</strong> | P99: <strong style={{ color: '#111439' }}>{snapshot.p99LatencyMs}ms</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>TRAI DND Blocks</span>
            <ShieldAlert color="#EF4444" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#EF4444' }}>
            {snapshot.totalTraiBlocked}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            Quiet Hours Deferred: <strong style={{ color: '#111439' }}>{snapshot.totalQuietHoursDeferred}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Dead Letter Queue</span>
            <AlertTriangle color="#7C3AED" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#7C3AED' }}>
            {snapshot.totalDlq}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            Freq Cap Blocked: <strong style={{ color: '#111439' }}>{snapshot.totalFreqCapBlocked}</strong>
          </div>
        </div>
      </div>

      {/* Channel Performance Cards */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: '#111439', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Channel Dispatch Performance & SLA Metrics</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {Object.entries(snapshot.channelBreakdown).map(([channel, metrics]) => {
            const m = metrics as { sent: number; delivered: number; failed: number; dlq: number; avgLatencyMs: number; costEstInr: number };
            return (
              <div
                key={channel}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#F8F8F9',
                  border: '1px solid rgba(17, 20, 57, 0.08)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '10px', fontSize: '1rem' }}>
                  <span style={{ color: '#111439' }}>{channel}</span>
                  <span style={{ color: '#64748B', fontSize: '0.8rem' }}>₹{m.costEstInr}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Dispatched: <strong style={{ color: '#111439' }}>{m.sent}</strong></div>
                  <div>Delivered: <strong style={{ color: '#059669' }}>{m.delivered}</strong></div>
                  <div>Failed: <strong style={{ color: '#EF4444' }}>{m.failed}</strong></div>
                  <div>Avg SLA: <strong style={{ color: '#7C3AED' }}>{m.avgLatencyMs}ms</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
