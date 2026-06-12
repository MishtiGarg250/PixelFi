import prisma from './src/lib/prisma.js';
import { Kafka } from 'kafkajs';

const userId = 'cmpyy6jhv0000k8mc6e6zh4rc';

const kafka = new Kafka({
  clientId: 'test-script',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

async function run() {
  await producer.connect();
  
  console.log("1. Generating baseline expenses (to establish what is 'normal')...");
  for (let i = 0; i < 15; i++) {
    const amount = 10 + (Math.random() * 10); // Between 10 and 20
    const expense = await prisma.expense.create({
      data: {
        userId,
        title: `Baseline Expense ${i}`,
        amount: amount,
        currency: 'USD',
        occurredAt: new Date(Date.now() - (20 - i) * 86400000), // Past dates
        category: 'FOOD',
      }
    });

    await producer.send({
      topic: 'transaction.created',
      messages: [{ value: JSON.stringify(expense) }],
    });
    console.log(`Created baseline expense: $${amount.toFixed(2)}`);
  }

  // Generate an anomalous expense
  console.log("\n2. Generating anomalous expense (a massive spike)...");
  const anomalousExpense = await prisma.expense.create({
    data: {
      userId,
      title: 'Luxury Car Downpayment',
      amount: 45000.00,
      currency: 'USD',
      occurredAt: new Date(),
      category: 'SHOPPING',
    }
  });

  await producer.send({
    topic: 'transaction.created',
    messages: [{ value: JSON.stringify(anomalousExpense) }],
  });
  console.log(`Created anomalous expense: $${anomalousExpense.amount}`);

  await producer.disconnect();

  console.log("\nWaiting 10 seconds for Kafka events to propagate through ML service and back to Express backend...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  const insights = await prisma.aIInsight.findMany({
    where: { userId, type: 'ANOMALY' },
    orderBy: { createdAt: 'desc' }
  });

  console.log("\n--- AI Insights found for user ---");
  insights.forEach(insight => {
    console.log(`[${insight.severity}] ${insight.title} - ${insight.description}`);
  });
  if (insights.length === 0) {
    console.log("No anomalies found. The model might need more baseline data or the event loop failed.");
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
