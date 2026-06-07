import axios from "axios";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;

export async function getCurrentPrice(
  symbol: string
) {
  const response = await axios.get(
    "https://finnhub.io/api/v1/quote",
    {
      params: {
        symbol,
        token: FINNHUB_API_KEY,
      },
    }
  );

  return response.data.c;
}