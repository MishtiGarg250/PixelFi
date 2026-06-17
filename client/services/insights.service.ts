import { globalBaseCurrency } from "@/hooks/useUser";

export interface AIInsight{
    id: string;
    userId: string;
    type: "ANOMALY" | "LIFESTYLE" | "CASHFLOW" | "PREDICTION";
    title: string;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    createdAt: string;
}

export const insightsService = {
  // Fetch historical logs from database via REST
  getHistoricalInsights: async (userId: string): Promise<AIInsight[]> => {
    if (!userId) {
      console.warn("[Insights Service] Aborting fetch: userId is undefined.");
      return [];
    }

    // 💡 IMPORTANT: Ensure this matches your backend destination URL (e.g., http://localhost:5005)
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005";

    try {
      const response = await fetch(`${BACKEND_URL}/api/insights?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Log the exact error status to the console to help debug
        console.error(`[Insights API Error] Status: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to pull historical insights (Status: ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Insights Fetch Exception]:", error);
      throw error;
    }
  },

  // Setup streaming pipe context
  subscribeToStream: (userId: string, onMessage: (insight: AIInsight) => void, onError: () => void) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005";
    const eventSource = new EventSource(`${BACKEND_URL}/api/insights/stream?userId=${userId}`);

    eventSource.onmessage = (event) => {
      if (event.data.trim() === ": keepalive" || !event.data) return;
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (err) {
        console.error("Failed parsing incoming stream chunk", err);
      }
    };

    eventSource.onerror = () => {
      onError();
    };

    return () => eventSource.close();
  }
};