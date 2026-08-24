import React, { useState, useEffect } from 'react';
import { Activity, Send, ShieldCheck, Languages, AlertTriangle, RefreshCw } from 'lucide-react';
import { DashboardOverview } from './components/DashboardOverview';
import { EventSimulator } from './components/EventSimulator';
import { LiveEventFeed } from './components/LiveEventFeed';
import { PreferenceManager } from './components/PreferenceManager';
import { TemplateStudio } from './components/TemplateStudio';
import { DLQInspector } from './components/DLQInspector';

import { DeliveryMetricSnapshot, StatusTransitionEvent } from '../../src/types/analytics';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../../src/types/user';
import { ChannelPayload } from '../../src/types/channel';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'feed' | 'preferences' | 'templates' | 'dlq'>('dashboard');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [snapshot, setSnapshot] = useState<DeliveryMetricSnapshot>({
    totalIngested: 0,
    totalDispatched: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalTraiBlocked: 0,
    totalFreqCapBlocked: 0,
    totalQuietHoursDeferred: 0,
    totalDlq: 0,
    channelBreakdown: {
      SMS: { sent: 0, delivered: 0, failed: 0, dlq: 0, avgLatencyMs: 0, costEstInr: 0 },
      EMAIL: { sent: 0, delivered: 0, failed: 0, dlq: 0, avgLatencyMs: 0, costEstInr: 0 },
      PUSH: { sent: 0, delivered: 0, failed: 0, dlq: 0, avgLatencyMs: 0, costEstInr: 0 },
      WHATSAPP: { sent: 0, delivered: 0, failed: 0, dlq: 0, avgLatencyMs: 0, costEstInr: 0 },
      IN_APP: { sent: 0, delivered: 0, failed: 0, dlq: 0, avgLatencyMs: 0, costEstInr: 0 }
    },
    priorityBreakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    categoryBreakdown: { TRANSACTION: 0, MARGIN_RISK: 0, WEALTH_SIP: 0, PRICE_MARKET: 0, REGULATORY_SAFETY: 0 },
    throughputTps: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    deliverySuccessRate: 100
  });

  const [auditLog, setAuditLog] = useState<StatusTransitionEvent[]>([]);
  const [dlqMessages, setDlqMessages] = useState<ChannelPayload[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);

  // Fetch initial REST data
  useEffect(() => {
    fetchMetrics();
    fetchDlq();
    fetchPreferences();

    // Connect WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
    const socket = new WebSocket(`${wsProtocol}//${wsHost}/ws`);

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'INIT_STATE') {
          setSnapshot(msg.data.snapshot);
          setAuditLog(msg.data.auditLog);
          setDlqMessages(msg.data.dlqMessages);
        } else if (msg.type === 'STATUS_UPDATE') {
          setSnapshot(msg.snapshot);
          setAuditLog(prev => [msg.data, ...prev.slice(0, 150)]);
          fetchDlq();
        }
      } catch (err) {}
    };

    return () => socket.close();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const json = await res.json();
      if (json.success) {
        setSnapshot(json.snapshot);
        setAuditLog(json.auditLog);
      }
    } catch (e) {}
  };

  const fetchDlq = async () => {
    try {
      const res = await fetch('/api/dlq');
      const json = await res.json();
      if (json.success) setDlqMessages(json.messages);
    } catch (e) {}
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences/USR_1001');
      const json = await res.json();
      if (json.success) setUserPreferences(json.preferences);
    } catch (e) {}
  };

  const handleTriggerEvent = async (event: any) => {
    await fetch('/api/events/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    fetchMetrics();
  };

  const handleRunBatch = async (count: number) => {
    await fetch('/api/events/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, userId: 'USR_1001' })
    });
    fetchMetrics();
  };

  const handleSavePreferences = async (updated: UserPreferences) => {
    await fetch(`/api/preferences/${updated.userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setUserPreferences(updated);
  };

  const handleReplayDlq = async (dispatchId: string) => {
    await fetch(`/api/dlq/replay/${dispatchId}`, { method: 'POST' });
    fetchDlq();
    fetchMetrics();
  };

  const handleSimulateFault = async (channel: string, failureRate: number) => {
    await fetch('/api/providers/simulate-failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, failureRate })
    });
  };

  const handleResetMetrics = async () => {
    await fetch('/api/metrics/reset', { method: 'POST' });
    fetchMetrics();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* App Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px 18px', borderRadius: '30px', background: '#111439', boxShadow: '0 6px 20px rgba(17, 20, 57, 0.25)' }}>
            <Activity size={26} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111439', letterSpacing: '-0.02em' }}>
              Financial Event Engine <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700, padding: '4px 12px', borderRadius: '30px', background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)', verticalAlign: 'middle', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>ENTERPRISE v1.0</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.925rem', marginTop: '2px' }}>
              Multi-Channel Financial Engine | 25+ Event Types | TRAI DND Compliance | White Lilac & Dark Blue Spec
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={handleResetMetrics}>
          <RefreshCw size={14} /> Reset Metrics
        </button>
      </header>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Activity size={16} /> Telemetry Dashboard
        </button>
        <button className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`} onClick={() => setActiveTab('simulator')}>
          <Send size={16} /> Financial Event Studio (25+)
        </button>
        <button className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
          <Activity size={16} /> Live Dispatch Stream ({auditLog.length})
        </button>
        <button className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
          <ShieldCheck size={16} /> TRAI DND & Preferences
        </button>
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <Languages size={16} /> i18n Template Studio
        </button>
        <button className={`tab-btn ${activeTab === 'dlq' ? 'active' : ''}`} onClick={() => setActiveTab('dlq')}>
          <AlertTriangle size={16} /> DLQ & Fault Injector ({dlqMessages.length})
        </button>
      </div>

      {/* Tab Contents */}
      <main>
        {activeTab === 'dashboard' && <DashboardOverview snapshot={snapshot} isConnected={isConnected} />}
        {activeTab === 'simulator' && <EventSimulator onTriggerEvent={handleTriggerEvent} onRunBatch={handleRunBatch} />}
        {activeTab === 'feed' && <LiveEventFeed auditLog={auditLog} />}
        {activeTab === 'preferences' && <PreferenceManager preferences={userPreferences} onSavePreferences={handleSavePreferences} />}
        {activeTab === 'templates' && <TemplateStudio />}
        {activeTab === 'dlq' && <DLQInspector dlqMessages={dlqMessages} onReplayMessage={handleReplayDlq} onSimulateFault={handleSimulateFault} />}
      </main>
    </div>
  );
};
