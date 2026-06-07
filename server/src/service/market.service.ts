import axios from "axios";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export interface FinnhubSearchResult {
  description?: string;
  displaySymbol?: string;
  symbol?: string;
  type?: string;
}

function getFinnhubApiKey() {
  return process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
}

function requireFinnhubApiKey() {
  const apiKey = getFinnhubApiKey();
  if (!apiKey) throw new Error("FINNHUB_API_KEY is not configured");
  return apiKey;
}

export const getQuoteService = async (symbol: string) => {
  const apiKey = requireFinnhubApiKey();
  const normalizedSymbol = symbol.toUpperCase();

  const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
    params: {
      symbol: normalizedSymbol,
      token: apiKey,
    },
  });

  return {
    symbol: normalizedSymbol,
    price: Number(response.data.c ?? 0),
    current: Number(response.data.c ?? 0),
    change: Number(response.data.d ?? 0),
    changePercent: Number(response.data.dp ?? 0),
    high: Number(response.data.h ?? 0),
    low: Number(response.data.l ?? 0),
    open: Number(response.data.o ?? 0),
    previousClose: Number(response.data.pc ?? 0),
  };
};

export const getCompanyProfileService = async (symbol: string) => {
  const apiKey = requireFinnhubApiKey();
  const normalizedSymbol = symbol.toUpperCase();

  const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
    params: {
      symbol: normalizedSymbol,
      token: apiKey,
    },
  });

  return {
    symbol: normalizedSymbol,
    ...response.data,
  };
};

export const searchFinnhubSymbolsService = async (query: string) => {
  const apiKey = getFinnhubApiKey();
  const trimmed = query.trim();
  if (!apiKey || !trimmed) return [];

  const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
    params: {
      q: trimmed,
      token: apiKey,
    },
  });

  const results = Array.isArray(response.data?.result)
    ? response.data.result
    : [];

  return results
    .map((result: FinnhubSearchResult) => ({
      symbol: (result.symbol ?? "").toUpperCase(),
      name: result.description ?? result.symbol ?? "",
      assetType:
        result.type?.toLowerCase().includes("etf") ? "ETF" : "STOCK",
      exchange: result.displaySymbol ?? null,
      sector: null,
      currency: "USD",
      source: "FINNHUB",
      finnhubType: result.type ?? null,
    }))
    .filter((result: { symbol: string; name: string }) => result.symbol && result.name)
    .slice(0, 20);
};
