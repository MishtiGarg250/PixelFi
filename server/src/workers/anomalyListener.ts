import { consumer } from '../config/kafka.js';
import prisma from '../lib/prisma.js';

export const startAnomalyListener = async () => {
  try {
    await consumer.subscribe({ topic: 'anomaly.detected', fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const { userId, amount, category, severityScore } = JSON.parse(message.value.toString());
        console.log(`[Kafka Core Exception] Anomaly parsed for user ${userId}.`);

        await prisma.aIInsight.create({
          data: {
            userId,
            type: 'ANOMALY',
            severity: severityScore > 0.5 ? 'HIGH' : 'MEDIUM',
            title: `Unusual Velocity Flagged in ${category}`,
            description: `Atypical transaction profile identified tracking a purchase of $${amount}. Allocation profile threshold altered.`,
          },
        });
      },
    });
  } catch (error: any) {
    console.error('Error in Kafka consumer loop tracking:', error.message);
  }
};
