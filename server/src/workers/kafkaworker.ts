import { consumer } from '../config/kafka.js';
import prisma from '../lib/prisma.js';
import { InsightSeverity, InsightType } from '@prisma/client';
import { sseManager } from '../utils/sseManager.js';

// Dictionary mapping the exact Kafka topics to your Prisma InsightType Enums
const TOPIC_INSIGHT_MAP: {[key:string]: InsightType} = {
  'pixelfi.ml.anomaly.detected': 'ANOMALY',
  'pixelfi.ml.lifestyle.alert': 'LIFESTYLE_CREEP',
  'pixelfi.ml.cashflow.warning': 'CASH_FLOW',
  'pixelfi.ml.prediction.ready': 'FORECAST',
};

export const startFinancialInsightsConsumer = async () => {
  try {
    // 1. Establish initial broker handshake connection
    await consumer.connect();
    console.log('[Kafka Core] Connected to cluster broker.');

    // 2. Subscribe to all four ML-driven insight output topics at once
    await consumer.subscribe({ 
      topics: Object.keys(TOPIC_INSIGHT_MAP), 
      fromBeginning: false 
    });
    
    console.log(`[Kafka Core] Listening to insight streams: ${Object.keys(TOPIC_INSIGHT_MAP).join(', ')}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        try {
          const rawData = message.value.toString();
          const payload = JSON.parse(rawData);
          const { userId, severityScore } = payload;
          
          const targetInsightType = TOPIC_INSIGHT_MAP[topic];
          console.log(`[Kafka Core] Intercepted event [${targetInsightType}] on partition ${partition} for user: ${userId}`);

          // 3. Dynamic Enum Evaluation for InsightSeverity
          let severity: InsightSeverity= 'LOW';
          if (severityScore >= 0.75) {
            severity = 'HIGH';
          } else if (severityScore >= 0.40) {
            severity = 'MEDIUM';
          }

          // 4. Content Generator Strategy Matrix based on Event Type
          let title = '';
          let description = '';

          switch (targetInsightType) {
            case 'ANOMALY': {
              const formattedAmount = Number(payload.amount || 0).toFixed(2);
              title = `Unusual Velocity Flagged in ${payload.category || 'Discretionary'}`;
              description = `Atypical transaction profile identified tracking a purchase of $${formattedAmount}. Allocation profile threshold altered.`;
              break;
            }
            case 'LIFESTYLE_CREEP': {
              const variancePct = (Number(payload.varianceRatio || 0) * 100).toFixed(1);
              title = `Lifestyle Creep Warning: ${payload.category || 'Discretionary'}`;
              description = `Discretionary category outbound allocation trends have systematically surged upwards by ${variancePct}% relative to your baseline index over past evaluation intervals.`;
              break;
            }
            case 'CASH_FLOW': {
              const daysRemaining = payload.runwayDaysRemaining || 0;
              title = `Liquidity Compression Risk Detected`;
              description = `Dynamic operational runway tracking indexes suggest localized cash-burn adjustments are tracking thin. Projected runway window: ${daysRemaining} days remaining given current spending velocities.`;
              break;
            }
            case 'FORECAST': {
              const targetDateStr = payload.projectionHorizonDate || 'next period';
              title = `Net Worth Projections Compiled`;
              description = `Multi-horizon forward predictive configurations successfully processed system-wide data blocks for horizon date: ${targetDateStr}.`;
              
              // Direct Side-Effect: Save raw structural prediction json into MLPrediction table
              if (payload.snapshotId && payload.resultJson) {
                await prisma.mLPrediction.create({
                  data: {
                    userId,
                    modelType: 'NET_WORTH_FORECAST',
                    predictionDate: new Date(),
                    inputSnapshotId: payload.snapshotId,
                    resultJson: payload.resultJson,
                    confidence: payload.confidenceScore ? Number(payload.confidenceScore) : null
                  }
                });
              }
              break;
            }
            default:
              throw new Error(`Unhandled message type routing mapping validation exception: ${targetInsightType}`);
          }

          // 5. Commit structured operational row directly to AIInsight
          const savedInsight = await prisma.aIInsight.create({
            data: {
              userId,
              type: targetInsightType, // Map matches Prisma InsightType enum exactly
              severity,               // Map matches Prisma InsightSeverity enum exactly
              title,
              description,
            },
          });

          sseManager.sendToUser(userId,savedInsight);
          console.log(`[Database] AIInsight safely recorded to persistence context layer: ${targetInsightType}`);

        } catch (innerProcessError) {
          // Critical catch block: Prevents a single corrupt message payload from taking down your entire background worker thread
          console.error(`[Processing Error] Execution aborted for an individual message packet on topic ${topic}:`, innerProcessError);
        }
      },
    });
  } catch (error) {
    console.error('Fatal initialization error in Kafka consumer consumer group bootstrap process:', error);
  }
};