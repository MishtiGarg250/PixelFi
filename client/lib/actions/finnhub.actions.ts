'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}

export { fetchJSON };

export async function getQuote(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        // No caching for real-time price
        return await fetchJSON<any>(url, 0);
    } catch (e) {
        console.error('Error fetching quote for', symbol, e);
        return null;
    }
}

export async function getCompanyProfile(symbol: string) {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        // Cache profile for 24 hours
        return await fetchJSON<any>(url, 86400);
    } catch (e) {
        console.error('Error fetching profile for', symbol, e);
        return null;
    }
}

export async function getWatchlistData(symbols: string[]) {
    if (!symbols || symbols.length === 0) return [];

    // Fetch quotes and profiles in parallel
    const promises = symbols.map(async (sym) => {
        const [quote, profile] = await Promise.all([
            getQuote(sym),
            getCompanyProfile(sym)
        ]);

        return {
            symbol: sym,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            currency: profile?.currency || 'USD',
            name: profile?.name || sym,
            logo: profile?.logo,
            marketCap: profile?.marketCapitalization,
            peRatio: 0 // Finnhub 'quote' and 'profile2' don't easily give real-time PE. Might need 'metric' endpoint, but skipping for now to save rate limits.
        };
    });

    return await Promise.all(promises);
}


export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            throw new Error('FINNHUB API key is not configured');
        }
        const cleanSymbols = (symbols || [])
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        const maxArticles = 6;

        // If we have symbols, try to fetch company news per symbol and round-robin select
        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch (e) {
                        console.error('Error fetching company news for', sym, e);
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            // Round-robin up to 6 picks
            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;
                    collected.push(formatArticle(article, true, sym, round));
                    if (collected.length >= maxArticles) break;
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                // Sort by datetime desc
                collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
                return collected.slice(0, maxArticles);
            }
            // If none collected, fall through to general news
        }

        // General market news fallback or when no symbols provided
        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break; // cap early before final slicing
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;
    } catch (err) {
        console.error('getNews error:', err);
        throw new Error('Failed to fetch news');
    }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            // If no token, log and return empty to avoid throwing per requirements
            console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
            return [];
        }

        const trimmed = typeof query === 'string' ? query.trim() : '';

        let results: FinnhubSearchResult[] = [];

        if (!trimmed) {
            // Fetch top 10 popular symbols' profiles
            const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles = await Promise.all(
                top.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
                        // Revalidate every hour
                        const profile = await fetchJSON<any>(url, 3600);
                        return { sym, profile } as { sym: string; profile: any };
                    } catch (e) {
                        console.error('Error fetching profile2 for', sym, e);
                        return { sym, profile: null } as { sym: string; profile: any };
                    }
                })
            );

            results = profiles
                .map(({ sym, profile }) => {
                    const symbol = sym.toUpperCase();
                    const name: string | undefined = profile?.name || profile?.ticker || undefined;
                    const exchange: string | undefined = profile?.exchange || undefined;
                    if (!name) return undefined;
                    const r: FinnhubSearchResult = {
                        symbol,
                        description: name,
                        displaySymbol: symbol,
                        type: 'Common Stock',
                    };
                    // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
                    // To keep pipeline simple, attach exchange via closure map stage
                    // We'll reconstruct exchange when mapping to final type
                    (r as any).__exchange = exchange; // internal only
                    return r;
                })
                .filter((x): x is FinnhubSearchResult => Boolean(x));
        } else {
            const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
        }

        const mapped: StockWithWatchlistStatus[] = results
            .map((r) => {
                const upper = (r.symbol || '').toUpperCase();
                const name = r.description || upper;
                const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
                const exchangeFromProfile = (r as any).__exchange as string | undefined;
                const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
                const type = r.type || 'Stock';
                const item: StockWithWatchlistStatus = {
                    symbol: upper,
                    name,
                    exchange,
                    type,
                    isInWatchlist: false,
                };
                return item;
            })
            .slice(0, 15);

        return mapped;
    } catch (err) {
        console.error('Error in stock search:', err);
        return [];
    }
});

// ── Anomaly Detection Data Helpers ─────────────────────────────────────────

/**
 * Fetch OHLCV candle data from Finnhub for anomaly detection.
 * Returns up to 90 days of daily bars by default.
 * Finnhub candle endpoint: /stock/candle?symbol=&resolution=D&from=&to=
 */
export async function getStockCandles(
    symbol: string,
    daysBack = 90
): Promise<OHLCBar[]> {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) return [];

        const to   = Math.floor(Date.now() / 1000);
        const from = to - daysBack * 24 * 60 * 60;

        const url =
            `${FINNHUB_BASE_URL}/stock/candle` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&resolution=D` +
            `&from=${from}` +
            `&to=${to}` +
            `&token=${token}`;

        // Pre-check for 403 (premium endpoint) so we don't throw noisy errors
        const probe = await fetch(url, { cache: 'force-cache', next: { revalidate: 300 } });
        if (probe.status === 403 || probe.status === 401) {
            // Free plan – silently skip, anomaly detection will use /quote fallback
            return [];
        }
        if (!probe.ok) return [];

        const data = await probe.json() as {
            s: string;
            t?: number[];
            o?: number[];
            h?: number[];
            l?: number[];
            c?: number[];
            v?: number[];
        };

        if (data?.s !== 'ok' || !data.t) return [];

        const bars: OHLCBar[] = data.t.map((ts, i) => ({
            t: ts,
            o: data.o?.[i] ?? 0,
            h: data.h?.[i] ?? 0,
            l: data.l?.[i] ?? 0,
            c: data.c?.[i] ?? 0,
            v: data.v?.[i] ?? 0,
        }));

        return bars;
    } catch (e) {
        console.error('Error fetching candles for', symbol, e);
        return [];
    }
}

/**
 * Fetch news sentiment score from Finnhub.
 * Returns buzz score (0–1) and bullish percent (0–1), or null on failure.
 */
export async function getSentimentScore(
    symbol: string
): Promise<{ buzz: number; bullishPercent: number } | null> {
    try {
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) return null;

        const url =
            `${FINNHUB_BASE_URL}/news-sentiment` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&token=${token}`;

        // Pre-check for 403 (premium endpoint) before attempting to parse
        const probe = await fetch(url, { cache: 'force-cache', next: { revalidate: 600 } });
        if (probe.status === 403 || probe.status === 401) {
            // Free plan doesn't include /news-sentiment – silently skip
            return null;
        }
        if (!probe.ok) return null;

        const data = await probe.json() as {
            buzz?: { weeklyAverage?: number };
            sentiment?: { bullishPercent?: number };
        };

        if (!data?.buzz && !data?.sentiment) return null;

        return {
            buzz: data.buzz?.weeklyAverage ?? 0,
            bullishPercent: data.sentiment?.bullishPercent ?? 0.5,
        };
    } catch (e) {
        // Truly unexpected error only
        console.error('Error fetching Finnhub sentiment for', symbol, e);
        return null;
    }
}