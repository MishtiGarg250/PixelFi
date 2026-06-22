# PixelFi

PixelFi is an AI-powered wealth intelligence platform. It moves beyond traditional budgeting apps by utilizing an event-driven microservices architecture to provide real-time transaction tracking, anomaly detection, and predictive net worth forecasting.

## Architecture Overview

PixelFi is built with a decoupled, high-performance tech stack:

- **Frontend (`/client`)**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, and Clerk for secure authentication. 
- **Backend API (`/server`)**: Node.js, Express.js, Prisma ORM, interacting with a PostgreSQL database. It consumes insights from the ML layer via Kafka.
- **Machine Learning Engine (`/ml-service`)**: Python worker service utilizing Scikit-learn and XGBoost for anomaly detection, spending creep analysis, and forecasting.
- **Message Broker**: Apache Kafka orchestrates real-time event streaming between the Express backend and the Python ML workers.

## Features

- **Holistic Asset Aggregation**: Unify your cash, investments, and liabilities into a single dashboard.
- **Real-Time ML Forecasting**: XGBoost models predict your net worth trajectory up to 12 months in the future based on your historical behavior.
- **Smart Anomaly Detection**: The Kafka-driven ML workers analyze transactions in the background and instantly flag unusual spending patterns.
- **Lifestyle Creep Alerts**: Evaluates discretionary spending trends against your baseline to warn you of lifestyle inflation.
- **Sleek, Minimalist UI**: A dark-mode, glassmorphic design system that focuses on clarity and actionable insights.

## Prerequisites

To run PixelFi locally, ensure you have the following installed:
- [Docker & Docker Compose](https://www.docker.com/) (Required for spinning up Kafka, Zookeeper, and local databases easily)
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.10+)
- [Clerk Account](https://clerk.com/) (For Auth API keys)

## Local Development Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd PixelFi
```

### 2. Environment Variables
You will need to set up `.env` files in each respective directory (`/client`, `/server`, `/ml-service`). 
Refer to the `.env.example` files in each directory. You will need:
- Clerk Publishable & Secret Keys (`/client`, `/server`)
- Database URL for Prisma (`/server`)
- Kafka Broker URIs (Defaults to `localhost:9092` locally)

### 3. Spin up Infrastructure (Kafka & DB)
Run the docker-compose file to start Apache Kafka, Zookeeper, and optionally your local PostgreSQL instance:
```bash
docker-compose up -d
```

### 4. Install Dependencies & Run

**Backend (Server)**
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**ML Service**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python src/workers/kafka_worker.py
```

**Frontend (Client)**
```bash
cd client
npm install
npm run dev
```

The application will now be running at `http://localhost:3000`.

## Deployment

PixelFi is designed to be deployed across managed platforms for maximum scalability:
- **Frontend**: [Vercel](https://vercel.com)
- **Backend & ML Service**: [Railway](https://railway.app) or Render
- **Database**: [Neon.tech](https://neon.tech) (Serverless Postgres)
- **Kafka**: [Upstash](https://upstash.com) (Serverless Kafka with SASL/SCRAM authentication)

*Note: For production deployments, ensure `KAFKA_SASL_USERNAME` and `KAFKA_SASL_PASSWORD` are provided to the backend and ML services for secure Upstash connectivity.*

---

*Built for the modern investor.*
