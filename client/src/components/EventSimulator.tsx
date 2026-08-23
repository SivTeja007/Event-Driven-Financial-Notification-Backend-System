import React, { useState } from 'react';
import { Send, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FINANCIAL_EVENTS, FinancialEventPayload } from '../../../src/types/event';

interface Props {
  onTriggerEvent: (event: Partial<FinancialEventPayload>) => Promise<void>;
  onRunBatch: (count: number) => Promise<void>;
}

export const EventSimulator: React.FC<Props> = ({ onTriggerEvent, onRunBatch }) => {
  const [selectedType, setSelectedType] = useState<string>('MARGIN_CALL_CRITICAL');
  const [userId, setUserId] = useState<string>('USR_1001');
  const [customData, setCustomData] = useState<string>(JSON.stringify(FINANCIAL_EVENTS['MARGIN_CALL_CRITICAL'].sampleData, null, 2));
  const [loading, setLoading] = useState<boolean>(false);
  const [batchCount, setBatchCount] = useState<number>(25);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const selectedDef = FINANCIAL_EVENTS[selectedType] || FINANCIAL_EVENTS['MARGIN_CALL_CRITICAL'];

  const handleSelectChange = (typeKey: string) => {
    setSelectedType(typeKey);
    const def = FINANCIAL_EVENTS[typeKey];
    if (def) {
      setCustomData(JSON.stringify(def.sampleData, null, 2));
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      let parsedData = {};
      try { parsedData = JSON.parse(customData); } catch (e) {}

      await onTriggerEvent({
        eventType: selectedType,
        userId,
        category: selectedDef.category,
        classification: selectedDef.classification,
        priority: selectedDef.defaultPriority,
        templateData: parsedData,
        metadata: { dltHeaderId: selectedDef.dltHeaderId, dltTemplateId: selectedDef.dltTemplateId }
      });
      setStatusMsg(`Event ${selectedDef.name} dispatched successfully!`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      await onRunBatch(batchCount);
      setStatusMsg(`Triggered high volume batch of ${batchCount} financial events!`);
    } catch (err: any) {
      setStatusMsg(`Batch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Event Trigger Form */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={20} color="#FFFFFF" /> Financial Event Studio (25+ Event Types)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#A1A1AA', marginBottom: '6px' }}>
              Select Financial Event Type:
            </label>
            <select
              value={selectedType}
              onChange={e => handleSelectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#1A1B1C',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {Object.keys(FINANCIAL_EVENTS).map(key => {
                const def = FINANCIAL_EVENTS[key];
                return (
                  <option key={key} value={key} style={{ background: '#1A1B1C', color: '#FFF' }}>
                    [{def.category}] {def.name} ({def.defaultPriority})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Target User ID:</label>
              <input
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>Priority Level:</label>
              <div style={{ marginTop: '8px' }}>
                <span className={`badge badge-${selectedDef.defaultPriority.toLowerCase()}`}>{selectedDef.defaultPriority}</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#A1A1AA', marginBottom: '6px' }}>
              Payload Variables (JSON):
            </label>
            <textarea
              rows={6}
              value={customData}
              onChange={e => setCustomData(e.target.value)}
              className="font-mono"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                background: '#1A1B1C',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleTrigger} disabled={loading} style={{ justifyContent: 'center' }}>
            <Send size={16} /> Dispatch Event Now
          </button>
        </div>
      </div>

      {/* Batch Simulation Panel & Specs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Play size={20} color="#FFFFFF" /> High-Volume Load Simulator
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#A1A1AA', marginBottom: '20px', lineHeight: 1.5 }}>
            Simulate realistic financial traffic bursts to evaluate throughput (TPS), latency percentiles, TRAI DND blocks, and circuit breaker retries.
          </p>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <input
              type="number"
              min={5}
              max={500}
              value={batchCount}
              onChange={e => setBatchCount(Number(e.target.value))}
              style={{ width: '110px', padding: '10px 14px', borderRadius: '8px', background: '#1A1B1C', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: 800 }}
            />
            <button className="btn btn-primary" onClick={handleBatch} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              <Play size={16} /> Fire {batchCount} Events Burst
            </button>
          </div>
        </div>

        {/* Selected Event Details Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>Event Catalog Specification</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: '#A1A1AA' }}>
            <div><strong>Name:</strong> <span style={{ color: '#FFFFFF' }}>{selectedDef.name}</span></div>
            <div><strong>Description:</strong> {selectedDef.description}</div>
            <div><strong>Category:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{selectedDef.category}</span></div>
            <div><strong>TRAI Classification:</strong> <span style={{ color: '#FBBF24', fontWeight: 800 }}>{selectedDef.classification}</span></div>
            <div><strong>DLT Header ID:</strong> <code style={{ color: '#34D399', fontWeight: 800 }}>{selectedDef.dltHeaderId || 'N/A'}</code></div>
            <div><strong>Supported Channels:</strong> {selectedDef.supportedChannels.join(', ')}</div>
          </div>
        </div>

        {statusMsg && (
          <div className="glass-panel" style={{ padding: '16px 20px', background: '#FFFFFF', color: '#1A1B1C', fontSize: '0.9rem', fontWeight: 800 }}>
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};
