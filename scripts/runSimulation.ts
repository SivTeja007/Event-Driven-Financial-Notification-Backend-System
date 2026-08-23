import { NotificationEventProcessor } from '../src/engine/eventProcessor';
import { FINANCIAL_EVENTS, FinancialEventPayload } from '../src/types/event';

async function runBenchmarkSimulation() {
  console.log('================================================================');
  console.log('⚡ STARTING HIGH-THROUGHPUT FINTECH NOTIFICATION SIMULATION ⚡');
  console.log('================================================================\n');

  const processor = new NotificationEventProcessor();
  const eventKeys = Object.keys(FINANCIAL_EVENTS);

  console.log(`📌 Loaded ${eventKeys.length} Financial Event Types.`);

  const TOTAL_EVENTS = 1000;
  console.log(`🔥 Ingesting ${TOTAL_EVENTS} financial events...`);

  const startTime = Date.now();

  for (let i = 0; i < TOTAL_EVENTS; i++) {
    const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    const eventDef = FINANCIAL_EVENTS[randomKey];

    // Inject simulated provider failure at event 500 to test DLQ & Fallback
    if (i === 500) {
      console.log('\n⚠️ INJECTING SMS PROVIDER FAULT (80% failure rate) to test Circuit Breakers & DLQ Retries...\n');
      const smsProvider = processor.providers.get('SMS');
      if (smsProvider) smsProvider.setFailureRate(0.8);
    }

    // Reset provider at event 750
    if (i === 750) {
      console.log('\n✅ RECOVERING SMS PROVIDER CIRCUIT...\n');
      const smsProvider = processor.providers.get('SMS');
      if (smsProvider) smsProvider.resetCircuit();
    }

    const payload: FinancialEventPayload = {
      eventId: `SIM_EVT_${Date.now()}_${i}`,
      eventType: randomKey,
      category: eventDef.category,
      classification: eventDef.classification,
      priority: eventDef.defaultPriority,
      userId: 'USR_1001',
      timestamp: new Date().toISOString(),
      templateData: {
        ...eventDef.sampleData,
        userName: 'Tejal Patel'
      },
      metadata: {
        dltHeaderId: eventDef.dltHeaderId,
        dltTemplateId: eventDef.dltTemplateId
      }
    };

    await processor.processEvent(payload);

    if ((i + 1) % 250 === 0) {
      console.log(`⏳ Progress: ${i + 1}/${TOTAL_EVENTS} events processed...`);
    }
  }

  const durationMs = Date.now() - startTime;
  const snapshot = processor.metricsCollector.getSnapshot();

  console.log('\n================================================================');
  console.log('📊 SIMULATION METRICS & BENCHMARK SUMMARY 📊');
  console.log('================================================================');
  console.log(`⏱️ Total Execution Time: ${(durationMs / 1000).toFixed(2)} seconds`);
  console.log(`⚡ Throughput (TPS): ${snapshot.throughputTps} events/sec`);
  console.log(`📥 Total Events Ingested: ${snapshot.totalIngested}`);
  console.log(`📤 Total Channel Dispatches: ${snapshot.totalDispatched}`);
  console.log(`✅ Total Delivered: ${snapshot.totalDelivered}`);
  console.log(`❌ Total Provider Failures: ${snapshot.totalFailed}`);
  console.log(`🚫 TRAI DND Blocked: ${snapshot.totalTraiBlocked}`);
  console.log(`⏱️ Quiet Hours Deferred: ${snapshot.totalQuietHoursDeferred}`);
  console.log(`🛑 Frequency Cap Blocked: ${snapshot.totalFreqCapBlocked}`);
  console.log(`💀 DLQ Messages: ${snapshot.totalDlq}`);
  console.log(`🎯 Overall Delivery Success Rate: ${snapshot.deliverySuccessRate}%`);
  console.log('\n📈 SLA Latency Stats:');
  console.log(`   P50 Latency: ${snapshot.p50LatencyMs} ms`);
  console.log(`   P95 Latency: ${snapshot.p95LatencyMs} ms`);
  console.log(`   P99 Latency: ${snapshot.p99LatencyMs} ms`);

  console.log('\n📱 Channel Breakdown:');
  console.table(snapshot.channelBreakdown);

  console.log('\n================================================================');
  console.log('✨ SIMULATION COMPLETED SUCCESSFULLY! ✨');
  console.log('================================================================\n');
}

runBenchmarkSimulation().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});
