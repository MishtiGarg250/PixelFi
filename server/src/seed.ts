// prisma/seed.ts

import prisma from "./lib/prisma.js";

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "aryansrivastava9059@gmail.com",
    },
  });

  if (!user) {
    throw new Error(
      "User not found: garmishti9@gmail.com"
    );
  }

  console.log("Seeding for:", user.email);

  /* ==================================================
     CLEAN USER DATA
  ================================================== */

  await prisma.portfolioMarketAsset.deleteMany({
    where: {
      userMarketAsset: {
        userId: user.id,
      },
    },
  });

  await prisma.transaction.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.userMarketAsset.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.customAsset.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.portfolio.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.liability.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.goal.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.expense.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.aIInsight.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.account.deleteMany({
    where: {
      userId: user.id,
    },
  });

  /* ==================================================
     ACCOUNTS
  ================================================== */

  const bank = await prisma.account.create({
    data: {
      userId: user.id,
      name: "HDFC Savings",
      accountType: "BANK",
      currency: "INR",
    },
  });

  const brokerage =
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Zerodha Kite",
        accountType: "BROKERAGE",
        currency: "INR",
      },
    });

  const crypto =
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Binance",
        accountType: "CRYPTO",
        currency: "USD",
      },
    });

  /* ==================================================
     MARKET ASSETS
  ================================================== */

  const aapl =
    await prisma.marketAsset.upsert({
      where: { symbol: "AAPL" },
      update: {},
      create: {
        symbol: "AAPL",
        name: "Apple Inc",
        assetType: "STOCK",
        currency: "USD",
      },
    });

  const msft =
    await prisma.marketAsset.upsert({
      where: { symbol: "MSFT" },
      update: {},
      create: {
        symbol: "MSFT",
        name: "Microsoft",
        assetType: "STOCK",
        currency: "USD",
      },
    });

  const nvda =
    await prisma.marketAsset.upsert({
      where: { symbol: "NVDA" },
      update: {},
      create: {
        symbol: "NVDA",
        name: "NVIDIA",
        assetType: "STOCK",
        currency: "USD",
      },
    });

  const btc =
    await prisma.marketAsset.upsert({
      where: { symbol: "BTC" },
      update: {},
      create: {
        symbol: "BTC",
        name: "Bitcoin",
        assetType: "CRYPTO",
        currency: "USD",
      },
    });

  const eth =
    await prisma.marketAsset.upsert({
      where: { symbol: "ETH" },
      update: {},
      create: {
        symbol: "ETH",
        name: "Ethereum",
        assetType: "CRYPTO",
        currency: "USD",
      },
    });

  const nifty =
    await prisma.marketAsset.upsert({
      where: {
        symbol: "NIFTYBEES",
      },
      update: {},
      create: {
        symbol: "NIFTYBEES",
        name: "Nippon India ETF Nifty",
        assetType: "ETF",
        currency: "INR",
      },
    });

  /* ==================================================
     HOLDINGS (UserMarketAsset)
  ================================================== */

  const holdingAAPL =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: aapl.id,
        quantity: 10,
        averageCost: 180,
      },
    });

  const holdingMSFT =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: msft.id,
        quantity: 5,
        averageCost: 320,
      },
    });

  const holdingNVDA =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: nvda.id,
        quantity: 8,
        averageCost: 900,
      },
    });

  const holdingBTC =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: btc.id,
        quantity: 0.15,
        averageCost: 52000,
      },
    });

  const holdingETH =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: eth.id,
        quantity: 2,
        averageCost: 2800,
      },
    });

  const holdingNIFTY =
    await prisma.userMarketAsset.create({
      data: {
        userId: user.id,
        marketAssetId: nifty.id,
        quantity: 100,
        averageCost: 245,
      },
    });

  /* ==================================================
     PORTFOLIOS
  ================================================== */

  const growth =
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: "Growth Portfolio",
      },
    });

  const cryptoPortfolio =
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: "Crypto Portfolio",
      },
    });

  await prisma.portfolioMarketAsset.createMany({
    data: [
      {
        portfolioId: growth.id,
        userMarketAssetId:
          holdingAAPL.id,
      },
      {
        portfolioId: growth.id,
        userMarketAssetId:
          holdingMSFT.id,
      },
      {
        portfolioId: growth.id,
        userMarketAssetId:
          holdingNVDA.id,
      },
      {
        portfolioId: cryptoPortfolio.id,
        userMarketAssetId:
          holdingBTC.id,
      },
      {
        portfolioId: cryptoPortfolio.id,
        userMarketAssetId:
          holdingETH.id,
      },
    ],
  });

  /* ==================================================
     CUSTOM ASSETS
  ================================================== */

  await prisma.customAsset.createMany({
    data: [
      {
        userId: user.id,
        portfolioId: growth.id,
        name: "Family Plot",
        category: "REAL_ESTATE",
        currentValue: 3500000,
        purchasePrice: 2000000,
        currency: "INR",
      },
      {
        userId: user.id,
        name: "Honda City",
        category: "VEHICLE",
        currentValue: 850000,
        purchasePrice: 1100000,
        currency: "INR",
      },
      {
        userId: user.id,
        name: "Gold Collection",
        category: "COLLECTIBLE",
        currentValue: 250000,
        purchasePrice: 180000,
        currency: "INR",
      },
    ],
  });

  /* ==================================================
     LIABILITIES
  ================================================== */

  await prisma.liability.createMany({
    data: [
      {
        userId: user.id,
        name: "Education Loan",
        type: "PERSONAL_LOAN",
        originalAmount: 800000,
        outstanding: 420000,
        interestRate: 9.5,
        currency: "INR",
      },
      {
        userId: user.id,
        name: "Credit Card",
        type: "CREDIT_CARD",
        originalAmount: 50000,
        outstanding: 12000,
        interestRate: 36,
        currency: "INR",
      },
    ],
  });

  /* ==================================================
     GOALS
  ================================================== */

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Emergency Fund",
        targetAmount: 500000,
        currentAmount: 150000,
      },
      {
        userId: user.id,
        title: "MacBook Upgrade",
        targetAmount: 180000,
        currentAmount: 70000,
      },
      {
        userId: user.id,
        title: "Europe Trip",
        targetAmount: 300000,
        currentAmount: 45000,
      },
    ],
  });

  /* ==================================================
     AI INSIGHTS
  ================================================== */

  await prisma.aIInsight.createMany({
    data: [
      {
        userId: user.id,
        type: "RISK",
        severity: "MEDIUM",
        title: "High Crypto Exposure",
        description:
          "Crypto represents a meaningful portion of your portfolio.",
      },
      {
        userId: user.id,
        type: "DIVERSIFICATION",
        severity: "LOW",
        title: "Good Diversification",
        description:
          "You own equities, crypto, real estate and gold.",
      },
      {
        userId: user.id,
        type: "PERFORMANCE",
        severity: "LOW",
        title: "Strong Growth",
        description:
          "Portfolio performance is positive over the last year.",
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });