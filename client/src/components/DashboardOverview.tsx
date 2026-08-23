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
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
            <Zap color="#FFFFFF" size={30} /> 
            <span>Financial Telemetry Control Engine</span>
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '6px' }}>
            Processing 25+ Financial Event Types across SMS, Email, Push, WhatsApp, and In-App channels.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 18px',
          borderRadius: '30px',
          background: isConnected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${isConnected ? '#FFFFFF' : 'rgba(239, 68, 68, 0.4)'}`
        }}>
          <div className={isConnected ? "pulse-dot" : ""} style={!isConnected ? { width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' } : {}} />
          <span style={{ fontSize: '0.775rem', fontWeight: 800, letterSpacing: '0.06em', color: isConnected ? '#FFFFFF' : '#F87171' }}>
            {isConnected ? 'LIVE WEBSOCKET STREAM' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#A1A1AA', fontWeight: 600 }}>Throughput (TPS)</span>
            <Activity color="#FFFFFF" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            {snapshot.throughputTps} <span style={{ fontSize: '0.9rem', color: '#A1A1AA', fontWeight: 500 }}>tps</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '8px' }}>
            Total Ingested: <strong style={{ color: '#FFFFFF' }}>{snapshot.totalIngested}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#A1A1AA', fontWeight: 600 }}>Delivery SLA Rate</span>
            <CheckCircle color="#10B981" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34D399' }}>
            {snapshot.deliverySuccessRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '8px' }}>
            Delivered: <strong style={{ color: '#FFFFFF' }}>{snapshot.totalDelivered}</strong> / Dispatched: <strong style={{ color: '#FFFFFF' }}>{snapshot.totalDispatched}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#A1A1AA', fontWeight: 600 }}>SLA Latency (P95)</span>
            <Cpu color="#FFFFFF" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            {snapshot.p95LatencyMs} <span style={{ fontSize: '0.9rem', color: '#A1A1AA', fontWeight: 500 }}>ms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '8px' }}>
            P50: <strong style={{ color: '#FFFFFF' }}>{snapshot.p50LatencyMs}ms</strong> | P99: <strong style={{ color: '#FFFFFF' }}>{snapshot.p99LatencyMs}ms</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#A1A1AA', fontWeight: 600 }}>TRAI DND Blocks</span>
            <ShieldAlert color="#EF4444" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F87171' }}>
            {snapshot.totalTraiBlocked}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '8px' }}>
            Quiet Hours Deferred: <strong style={{ color: '#FFFFFF' }}>{snapshot.totalQuietHoursDeferred}</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #C084FC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#A1A1AA', fontWeight: 600 }}>Dead Letter Queue</span>
            <AlertTriangle color="#C084FC" size={22} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#C084FC' }}>
            {snapshot.totalDlq}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginTop: '8px' }}>
            Freq Cap Blocked: <strong style={{ color: '#FFFFFF' }}>{snapshot.totalFreqCapBlocked}</strong>
          </div>
        </div>
      </div>

      {/* Channel Performance Cards */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  borderRadius: '10px',
                  background: '#1A1B1C',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '10px', fontSize: '1rem' }}>
                  <span style={{ color: '#FFFFFF' }}>{channel}</span>
                  <span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>₹{m.costEstInr}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#A1A1AA', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Dispatched: <strong style={{ color: '#FFFFFF' }}>{m.sent}</strong></div>
                  <div>Delivered: <strong style={{ color: '#34D399' }}>{m.delivered}</strong></div>
                  <div>Failed: <strong style={{ color: '#F87171' }}>{m.failed}</strong></div>
                  <div>Avg SLA: <strong style={{ color: '#FFFFFF' }}>{m.avgLatencyMs}ms</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
