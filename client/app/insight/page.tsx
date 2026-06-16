"use client"
import { useEffect, useState } from 'react';
interface Insight{
    id: string;
    userId: string;
    type: 'ANOMALY' | 'LIFESTYLE_CREEP' | 'CASH_FLOW' | 'FORECAST';
    severity: 'LOW' | 'MEDIUM'| 'HIGH';
    title: string;
    description: string;
    createdAt: string;
}

interface InsightsListProps{
    currentUserId: string | undefined | null;
}

export default function TestInsightsPage() {
  // Use a mock user ID that matches a user row in your local PostgreSQL database
  const mockUserId = "cmpyy6jhv0000k8mc6e6zh4rc";

  return (
    <div>
      <div >
        <header >
          <h1 >
            ML and kafka check
          </h1>
          <p >
            Testing real-time ML-driven Server-Sent Events (SSE) streams for User: <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-600 font-mono">{mockUserId}</code>
          </p>
        </header>

        <main>
          {/* Invoking your typed component */}
          <InsightsList currentUserId={mockUserId} />
        </main>
      </div>
    </div>
  );
}


export  function InsightsList({ currentUserId }: InsightsListProps) {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    // 1. Fetch historical data snapshot baseline list via HTTP Pull
    fetch(`http://localhost:5005/api/insights?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => setInsights(data))
      .catch(err => console.error("Historical pull error:", err));

    // 2. Bind the native browser EventSource client to our streaming endpoint
    const eventSource = new EventSource(
      `http://localhost:5005/api/insights/stream?userId=${currentUserId}`
    );

    // This callback catches all structured incoming string payloads sent via .sendToUser()
    eventSource.onmessage = (event: MessageEvent) => {
      const incomingInsight = JSON.parse(event.data);
      console.log("New insight streamed down from ML service:", incomingInsight);

      // Instantly place the fresh AI insight at the top of the feed stack
      setInsights((prev) => [incomingInsight, ...prev]);
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection dropped or encountered an error. Browser auto-reconnecting...");
    };

    // Tear down network handles cleanly if the user switches routes or closes components
    return () => {
      eventSource.close();
    };
  }, [currentUserId]);

  return (
    <div className="space-y-4 p-4">
      {insights.map((item) => (
        <div key={item.id} className="p-4 border rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase px-2 py-1 rounded">
            {item.type}
          </span>
          <h3 className="font-bold mt-2">{item.title}</h3>
          <p className="text-sm mt-1">{item.description}</p>
        </div>
      ))}
    </div>
  );
}