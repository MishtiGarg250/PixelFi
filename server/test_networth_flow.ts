import prisma from './src/lib/prisma.js';
import axios from 'axios';

const userId = 'cmpyy6jhv0000k8mc6e6zh4rc';

async function run() {
  console.log("1. Generating 4 mock MONTHLY FinancialSnapshots...");
  
  for (let i = 0; i < 4; i++) {
    // Dates from 4 months ago to 1 month ago
    const snapshotDate = new Date();
    snapshotDate.setMonth(snapshotDate.getMonth() - (4 - i));
    
    await prisma.financialSnapshot.upsert({
      where: {
        userId_snapshotDate_snapshotType: {
          userId,
          snapshotDate,
          snapshotType: 'MONTHLY'
        }
      },
      update: {},
      create: {
        userId,
        snapshotDate,
        snapshotType: 'MONTHLY',
        netWorth: 10000 + (i * 2000), // 10k, 12k, 14k, 16k
        totalAssets: 15000 + (i * 2000),
        totalLiabilities: 5000,
        portfolioValue: 0,
        cashValue: 15000 + (i * 2000),
        monthlyExpenses: 2000,
        monthlyIncome: 5000,
        savingsRate: 60,
        riskScore: 50,
        diversificationScore: 50,
        healthScore: 80,
        activeGoals: 1,
        goalTargetAmount: 50000,
        goalCurrentAmount: 0,
        totalInvested: 0,
        unrealizedPnL: 0,
        portfolioReturnPercent: 0,
        emergencyFundMonths: 6,
        debtToAssetRatio: 0.33,
        largestHoldingPercent: 0,
        holdingCount: 0
      }
    });
    console.log(`Created snapshot for ${snapshotDate.toISOString().split('T')[0]} with NetWorth $${10000 + (i * 2000)}`);
  }

  console.log("\n2. Pinging ML Service for Net Worth prediction...");
  try {
    const response = await axios.post('http://localhost:8000/predict/networth', {
      userId
    });
    console.log("Prediction Result:", response.data);
  } catch (error: any) {
    console.error("Error connecting to ML Service:", error.response?.data || error.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
