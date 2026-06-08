# PixelFi — AI-Powered Wealth Portfolio Management

> **"Build Wealth with Clarity."**  
> PixelFi structures your investments, tracking, and future targets into one beautifully minimal, intelligent financial operating system.

---

## 📐 Project Architecture Overview

```
PixelFi/
├── client/          # Next.js 16 frontend (React 19, TypeScript, TailwindCSS v4)
└── server/          # Express 5 backend (TypeScript, Prisma ORM, PostgreSQL)
```

This is a **monorepo** with two independently deployable applications:

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS 4 |
| **Backend** | Express 5, TypeScript, Node.js (ESM) |
| **Database** | PostgreSQL via Prisma ORM + Prisma Accelerate |
| **Auth** | Clerk (JWT-based, full-stack via `@clerk/nextjs` + `@clerk/express`) |
| **Markets** | Finnhub REST API (real-time price quotes, company profiles, symbol search) |
| **Scheduler** | `node-cron` for background automated jobs |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod validation |
| **HTTP Client** | Axios (both client and server) |
| **State** | TanStack React Query |
| **UI Kit** | ShadCN/UI + Radix UI + Lucide Icons |

---

## 🗄️ Database Schema (Prisma / PostgreSQL)

The database is structured around a **User** at the center, with all financial entities related to them.

### Core Models

| Model | Purpose |
|-------|---------|
| `User` | Central user entity. Linked to Clerk via `clerkUserId`. Has `baseCurrency` preference. |
| `Account` | Financial accounts (Brokerage, Bank, Crypto). Tracks `currentBalance`. |
| `MarketAsset` | Global registry of tradable assets (stocks, ETFs, crypto, bonds, mutual funds). |
| `UserMarketAsset` | A user's tracked holding of a `MarketAsset`. Tracks `quantity` and `averageCost`. Updated by transactions. |
| `CustomAsset` | Non-market assets: Real Estate, Vehicles, Art, Luxury Items, Collectibles. Has manual `currentValue`. |
| `Transaction` | All financial events: BUY, SELL, DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, TRANSFER. Updates account balances and holdings atomically. |
| `Liability` | Debts: Mortgage, Car Loan, Personal Loan, Credit Card, Other. Tracks `outstanding` and `interestRate`. |
| `Portfolio` | Named grouping of assets. Can be PRIVATE or PUBLIC. Contains both MarketAssets and CustomAssets. |
| `Goal` | Financial targets with `targetAmount`, `currentAmount`, optional `targetDate`. |
| `GoalContribution` | Individual deposits toward a Goal. Creates an audit trail. |
| `Expense` | Recorded spending categorized as: FOOD, RENT, TRAVEL, SHOPPING, UTILITIES, HEALTHCARE, OTHER. |
| `Income` | Recorded income by source: SALARY, BONUS, FREELANCE, DIVIDEND, INTEREST, RENTAL, OTHER. |
| `AIInsight` | AI-generated insights stored per user. Types: RISK, DIVERSIFICATION, PERFORMANCE, SAVINGS, MARKET. Severity: LOW, MEDIUM, HIGH. |
| `FinancialSnapshot` | Point-in-time record of a user's full financial state (netWorth, riskScore, healthScore, etc.). Types: DAILY, WEEKLY, MONTHLY, QUARTERLY. |
| `AssetAllocationSnapshot` | Breakdown of portfolio by asset type at snapshot time. |
| `ExpenseCategorySnapshot` | Breakdown of expenses by category at snapshot time. |
| `CustomAssetValuation` | Historical value records for custom assets. |
| `LiabilitySnapshot` | Historical outstanding amount records for liabilities. |

### Key Enums

| Enum | Values |
|------|--------|
| `MarketAssetType` | STOCK, ETF, CRYPTO, BOND, MUTUAL_FUND |
| `TransactionType` | BUY, SELL, DIVIDEND, DEPOSIT, WITHDRAWAL, INTEREST, TRANSFER |
| `AccountType` | BROKERAGE, BANK, CRYPTO |
| `CustomAssetCategory` | REAL_ESTATE, VEHICLE, LUXURY_ITEM, ART, COLLECTIBLE, OTHER |
| `LiabilityType` | MORTGAGE, CAR_LOAN, PERSONAL_LOAN, CREDIT_CARD, OTHER |
| `ExpenseCategory` | FOOD, RENT, TRAVEL, SHOPPING, UTILITIES, HEALTHCARE, OTHER |
| `IncomeSource` | SALARY, BONUS, FREELANCE, DIVIDEND, INTEREST, RENTAL, OTHER |
| `InsightType` | RISK, DIVERSIFICATION, PERFORMANCE, SAVINGS, MARKET |
| `SnapshotType` | DAILY, WEEKLY, MONTHLY, QUARTERLY |

---

## 🔌 REST API Reference

All protected routes require a valid **Clerk session token**.  
Base URL: `http://localhost:4000`

---

### 👤 Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/sync` | ✅ | Syncs Clerk user data into the local DB (called after sign-up/sign-in). |
| `GET` | `/api/users/me` | ✅ | Returns the current authenticated user's profile. |

---

### 🏦 Accounts — `/api/accounts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/accounts` | ✅ | List all accounts for the current user. |
| `POST` | `/api/accounts` | ✅ | Create a new account (BROKERAGE, BANK, CRYPTO). |
| `PATCH` | `/api/accounts/:id` | ✅ | Update account details. |
| `DELETE` | `/api/accounts/:id` | ✅ | Delete an account. |

---

### 📊 Analytics — `/api/analytics`

All analytics are powered by **real-time Finnhub price data**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/net-worth` | Returns `totalAssets`, `totalLiabilities`, `totalNetWorth`, live holdings with current prices, and custom assets. |
| `GET` | `/api/analytics/allocation` | Returns per-asset allocation as `{ symbol, currentValue, allocationPercent }`. |
| `GET` | `/api/analytics/performance` | Returns per-asset performance: `{ symbol, investedAmount, currentValue, pnl, pnlPercent }`. |
| `GET` | `/api/analytics/dashboard` | Aggregated dashboard view: net worth + allocation + performance + liabilities + last 10 transactions. |
| `GET` | `/api/analytics/risk-score` | Computes portfolio risk score (0–100) based on largest position concentration. Returns `{ score, level: LOW/MEDIUM/HIGH }`. |
| `GET` | `/api/analytics/diversification` | Returns diversification score (10 pts per unique holding, max 100) and total asset count. |

---

### 📈 Market Data — `/api/market`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/quote?symbol=AAPL` | ❌ | Real-time quote from Finnhub: price, change, high, low, open, previousClose. |
| `GET` | `/api/market/profile?symbol=AAPL` | ❌ | Company profile from Finnhub: name, industry, exchange, currency. |
| `GET` | `/api/market/search?q=apple` | ❌ | Search symbols via Finnhub. |

---

### 🪙 Assets — `/api/assets`

#### Market Assets — `/api/assets/market`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/assets/market?q=AAPL` | ❌ | Search assets. Checks DB first, falls back to Finnhub. Returns merged results with `source: "DATABASE"` or `"FINNHUB"`. |
| `POST` | `/api/assets/market` | ✅ | Manually create/upsert a market asset in the global registry. |
| `POST` | `/api/assets/market/add` | ✅ | Add a market asset to the user's watchlist. Auto-resolves from Finnhub if not in DB. Optionally links to a `portfolioId`. |
| `GET` | `/api/assets/market/user` | ✅ | Get all market assets tracked by the current user (with holdings data). |
| `DELETE` | `/api/assets/market/user/:id` | ✅ | Remove a tracked asset. **Blocked** if the user still holds shares (quantity > 0). |

#### Custom Assets — `/api/assets/custom`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/assets/custom?portfolioId=...` | ✅ | Get all custom assets. Optionally filter by `portfolioId`. |
| `POST` | `/api/assets/custom` | ✅ | Create a custom asset (Real Estate, Vehicle, Art, etc.) with optional portfolio assignment. |
| `PATCH` | `/api/assets/custom/:assetId` | ✅ | Partially update a custom asset. |
| `DELETE` | `/api/assets/custom/:assetId` | ✅ | Delete a custom asset. |

---

### 💸 Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/transactions` | ✅ | Get all transactions for the current user. |
| `POST` | `/api/transactions` | ✅ | Create a transaction. Runs atomically in a DB transaction. |
| `GET` | `/api/transactions/account/:accountId` | ✅ | Get transactions for a specific account. |

**Transaction Logic (atomic):**

| Type | Account Effect | Holding Effect |
|------|---------------|----------------|
| BUY | Debit `(qty × price) + fees` | Creates/updates `UserMarketAsset` with weighted average cost |
| SELL | Credit `(qty × price) − fees` | Reduces holding quantity; deletes holding if quantity reaches 0 |
| DEPOSIT / DIVIDEND / INTEREST | Credit `amount` | — |
| WITHDRAWAL | Debit `amount` (throws if insufficient) | — |

---

### 📁 Portfolios — `/api/portfolios`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/portfolios` | ✅ | List all portfolios with asset counts. |
| `POST` | `/api/portfolios` | ✅ | Create a portfolio (name, description, visibility: PRIVATE/PUBLIC). |
| `GET` | `/api/portfolios/:id` | ✅ | Get portfolio details with all assets and computed `totalValue`. |
| `PATCH` | `/api/portfolios/:id` | ✅ | Update portfolio metadata. |
| `DELETE` | `/api/portfolios/:id` | ✅ | Delete portfolio. Unlinks custom assets and removes market asset links. |

---

### 🎯 Goals — `/api/goals`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/goals` | ✅ | List all goals with `progressPercent` and `status` (ACTIVE/COMPLETED). |
| `POST` | `/api/goals` | ✅ | Create a goal with `title`, `targetAmount`, optional `targetDate`. |
| `PATCH` | `/api/goals/:id` | ✅ | Update goal metadata. |
| `DELETE` | `/api/goals/:id` | ✅ | Delete goal and all contributions (cascade). |
| `POST` | `/api/goals/:id/contributions` | ✅ | Add a contribution — increments `currentAmount` atomically. |
| `GET` | `/api/goals/:id/contributions` | ✅ | Get all contributions for a goal. |

---

### 💰 Expenses — `/api/expenses`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/expenses` | ✅ | Get all expenses (with linked account). Ordered by date desc. |
| `POST` | `/api/expenses` | ✅ | Create expense. If `accountId` given, checks balance and debits account. |
| `PATCH` | `/api/expenses/:id` | ✅ | Update an expense. |
| `DELETE` | `/api/expenses/:id` | ✅ | Delete an expense. |

---

### 🏛️ Liabilities — `/api/liabilities`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/liabilities` | ✅ | Get all liabilities for the user. |
| `POST` | `/api/liabilities` | ✅ | Create liability: mortgage, car loan, personal loan, credit card, etc. |
| `PATCH` | `/api/liabilities/:id` | ✅ | Update outstanding balance or other fields. |
| `DELETE` | `/api/liabilities/:id` | ✅ | Delete a liability. |

---

## ⏰ Cron Jobs

All cron jobs are registered in `server/src/cron/index.ts` and started on server boot.

| Job | Schedule (UTC) | Status | Description |
|-----|----------------|--------|-------------|
| **Daily Financial Snapshot** | `0 2 * * *` — 2:00 AM daily | ✅ Active | Generates a `DAILY` FinancialSnapshot for every user. Skips if one already exists for today. |
| **Monthly Financial Snapshot** | *(function stub only)* | ⚠️ WIP | Intended to create a `MONTHLY` snapshot on the 1st of each month. Service logic exists (`generateMonthlySnapshot`) but the cron schedule body is empty. |
| **AI Insight Generation** | `30 0 1 * *` — 12:30 AM on 1st of month | ⚠️ WIP | Iterates all users to generate AI insights. The `generateInsights()` call is commented out — this is the primary AI integration point. |

### Snapshot Metrics Captured (per user, per run)

| Metric | Calculation |
|--------|------------|
| `netWorth` | totalAssets − totalLiabilities |
| `totalAssets` | Market holdings (live price × qty) + custom asset values |
| `totalLiabilities` | Sum of outstanding liability amounts |
| `portfolioValue` | Market holdings at current live prices |
| `cashValue` | ⚠️ Hardcoded `0` — needs Account balance aggregation |
| `monthlyIncome` | ⚠️ Hardcoded `0` — Income model exists but not wired |
| `monthlyExpenses` | Sum of expenses this calendar month |
| `savingsRate` | `(income − expenses) / income × 100` |
| `riskScore` | Concentration risk based on largest position % (0–60+) |
| `diversificationScore` | `min(assetCount × 10, 100)` |
| `healthScore` | Weighted composite: diversification (30%) + risk (30%) + debt (20%) + emergency fund (20%) |
| `activeGoals` | Count of user goals |
| `unrealizedPnL` | `currentValue − investedAmount` across all holdings |
| `portfolioReturnPercent` | `unrealizedPnL / totalInvested × 100` |
| `emergencyFundMonths` | `cashValue / monthlyExpenses` |
| `debtToAssetRatio` | `totalLiabilities / totalAssets` |
| `largestHoldingPercent` | Highest allocation % of any single asset |
| `holdingCount` | Total number of unique asset positions |

---

## 🔐 Authentication Flow

1. User signs up / signs in via **Clerk** on the frontend.
2. `clerkMiddleware()` on the Express server validates the JWT on every request.
3. The `protect` middleware extracts `auth().userId` (the Clerk userId) from request context.
4. All services look up the internal DB user by `clerkUserId` before processing.
5. A **user sync** endpoint (`POST /api/users/sync`) must be called after first login to create the local DB record.

---

## 🌐 Frontend Structure (Next.js 16 App Router)

```
client/app/
├── page.tsx                    # Landing page (glassmorphism dark UI, Framer Motion animations)
├── layout.tsx                  # Root layout with Clerk provider
├── sign-in/                    # Clerk sign-in page
├── sign-up/                    # Clerk sign-up page
└── (platform)/                 # Authenticated app section (route group)
    ├── layout.tsx              # Platform layout (sidebar + navbar)
    ├── dashboard/              # Main dashboard
    ├── accounts/               # Accounts management
    ├── analytics/              # Charts and analytics views
    ├── assets/                 # Asset management
    ├── liabilities/            # Debt management
    ├── portfolios/             # Portfolio management
    ├── stocks/                 # Market assets / stock tracker
    ├── transactions/           # Transaction history
    └── settings/               # User settings
```

### Client-side Services (`client/services/`)

Axios-based API wrappers used with TanStack React Query:

| File | Purpose |
|------|---------|
| `user.service.ts` | User sync and profile |
| `account.service.ts` | CRUD for accounts |
| `analytics.service.ts` | Dashboard, netWorth, allocation, performance, risk, diversification |
| `asset.service.ts` | Market + custom asset operations |
| `portfolio.service.ts` | Portfolio CRUD + asset assignments |
| `transaction.service.ts` | Create and list transactions |
| `liability.service.ts` | Liability CRUD |
| `holdings.service.ts` | User market asset holdings |

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
FINNHUB_API_KEY=your_finnhub_key
FRONTEND_URI=http://localhost:3000
```

### Client (`client/.env`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key
```

---

## 🚀 Running Locally

### Server
```bash
cd server
npm install
npm run dev        # Builds TypeScript + starts Node
npm run seed       # Seed the database with sample data
```

### Client
```bash
cd client
npm install
npm run dev        # Starts Next.js dev server on :3000
```

---

## 🐛 Known Incomplete Items / TODOs

| Area | Issue |
|------|-------|
| `cashValue` | Hardcoded to `0` in `analytics-builder.service.ts`. Needs to aggregate `Account.currentBalance` values. |
| `monthlyIncome` | Hardcoded to `0`. The `Income` model and DB table exist but are not wired into analytics. |
| `monthlySnapshotCron` | Function body is empty — needs the same pattern as `dailySnapshotCron`. |
| `insightCron` | `generateInsights()` call is commented out. This is where the AI integration plugs in. |
| `TRANSFER` transaction | Listed as a `TransactionType` enum but not handled in the transaction service switch-case. |
| Expense reversal | Deleting an expense that debited an account does not re-credit the account balance. |
| Income routes | The `Income` model exists in the DB but there are no exposed API routes for creating/reading income records. |

---

## 🤖 Recommended ML Models for AI-Powered Features

### 1. 🧠 LLM-Based Financial Advisor (Chat)
**Model**: GPT-4o / Gemini 1.5 Pro / Claude 3.5 Sonnet (via API)  
**Where**: New `/api/ai/chat` endpoint or fill in `insight.cron.ts`  
**What**: Feed the user's `FinancialSnapshot` as context. Allow queries like *"Am I on track to retire by 55?"* or *"What should I rebalance?"*  
**Input**: FinancialSnapshot JSON + user question → **Output**: Natural language advice

---

### 2. 📉 Advanced Portfolio Risk Scoring
**Model**: XGBoost / Random Forest classifier  
**Where**: Replace the current linear `getRiskScoreService`  
**What**: Predict risk level using sector concentration, asset class mix, beta-weighted volatility, drawdown history, and correlation matrix.  
**Training data**: Historical market data + manually labeled risk profiles

---

### 3. 🔮 Net Worth Forecasting
**Model**: LSTM / Facebook Prophet / ARIMA  
**Where**: New `/api/analytics/forecast` endpoint  
**What**: Use the `FinancialSnapshot` time series to project net worth 1, 3, 5 years out.  
**Input**: Historical daily/monthly snapshots → **Output**: Projected net worth with confidence intervals

---

### 4. 🏷️ Expense Auto-Categorization
**Model**: Fine-tuned DistilBERT / OpenAI embeddings + classifier  
**Where**: Hook into `POST /api/expenses` before saving  
**What**: Automatically classify raw transaction descriptions into FOOD, RENT, TRAVEL, etc.  
**Training data**: Labeled transaction description datasets (available on Kaggle)

---

### 5. 📊 Portfolio Optimization (Modern Portfolio Theory)
**Model**: Markowitz Mean-Variance Optimization / Black-Litterman  
**Where**: New `/api/analytics/optimize` endpoint  
**What**: Given current holdings, compute optimal weights to maximize Sharpe ratio for a given risk tolerance.  
**Implementation**: Python microservice using `scipy.optimize`, called by Express

---

### 6. 💡 Anomaly Detection (Unusual Spending)
**Model**: Isolation Forest / Autoencoder  
**Where**: Monthly background job feeding into `AIInsight` records  
**What**: Flag statistically unusual expenses (e.g., 3× normal FOOD spend) as `AIInsight` with type `SAVINGS`, severity `MEDIUM`.

---

### 7. 🎯 Goal Achievement Probability
**Model**: Monte Carlo Simulation + Logistic Regression  
**Where**: `/api/goals/:id/predict`  
**What**: Based on current savings rate and market return assumptions, predict probability of reaching target by deadline.  
**Output**: `{ probability: 0.72, projectedDate: "2027-03", requiredMonthlySavings: 1200 }`

---

### 8. 📰 Market Sentiment Analysis
**Model**: FinBERT (financial domain BERT) / VADER  
**Where**: `/api/market/sentiment?symbol=AAPL`  
**What**: Pull news headlines via Finnhub's News API, return a sentiment score.  
**Output**: `{ sentiment: "BULLISH", score: 0.74, headlines: [...] }`

---

### Integration Strategy

```
Option A — Python FastAPI microservice
  Express calls internal Python API for model inference
  Best for: LSTM forecasting, scikit-learn, FinBERT

Option B — LLM API calls (OpenAI / Google / Anthropic)
  Drop directly into insight.cron.ts
  Best for: Financial advisor chat, AI insight generation

Option C — Edge ML (TensorFlow.js in Node)
  Run lightweight models in the existing Node.js process
  Best for: Expense categorization, anomaly detection
```

---

*README auto-generated from full codebase analysis — June 2026*
