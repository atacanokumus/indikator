import { CLASS_ASSETS, normalizeAsset } from '@/lib/asset-utils';

export interface PriceInfo {
    price: number;
    currency: string;
    timestamp: number;
}

const priceCache: Record<string, PriceInfo> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 mins

export class PriceService {
    /**
     * Get current price for an asset.
     * @param asset Asset name/symbol (e.g., "BTC", "THYAO", "GRAM ALTIN", "USDTRY")
     */
    static async getCurrentPrice(asset: string): Promise<PriceInfo | null> {
        // Use the robust normalization utility
        const normalized = normalizeAsset(asset);

        const cached = priceCache[normalized];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached;
        }

        const result = await this.fetchPriceForAsset(normalized);
        if (result) {
            priceCache[normalized] = result;
            // Background update to Firestore (non-blocking)
            import('@/server/repo').then(m => m.updateStoredPrice(normalized, result.price, result.currency)).catch(() => { });
        }
        return result;
    }

    private static getHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        };
    }

    private static async fetchPriceForAsset(normalized: string): Promise<PriceInfo | null> {

        // Fiyatı olmayan sınıf/kategori varlıkları (Kripto paralar, Banka hisseleri…)
        if (CLASS_ASSETS.has(normalized)) return null;

        // Yahoo endeks sembolleri
        const INDEX: Record<string, string> = {
            'NASDAQ': '^IXIC',
            'SP500': '^GSPC',
            'DJI': '^DJI',
            'NIKKEI': '^N225',
            'DXY': 'DX-Y.NYB',
            'USD/JPY': 'JPY=X',
        };
        if (INDEX[normalized]) return this.getYahooFinancePrice(INDEX[normalized]);

        // ABD hisseleri ve ETF'ler (Yahoo'da sembol son eki yok)
        const US_TICKERS = new Set([
            'NVDA', 'TSLA', 'AAPL', 'AMZN', 'GOOGL', 'MSFT', 'META',
            'PFE', 'NVO', 'OXY', 'LMT', 'MOH', 'NKE', 'BABA', 'PSQ', 'URA',
        ]);
        if (US_TICKERS.has(normalized)) return this.getYahooFinancePrice(normalized);

        // 0. Handle Normalized Keys from ECOTUBE ASSET_MAP
        if (normalized === 'ALTIN') return this.getGoldPrice();
        if (normalized === 'BTC') return this.getCryptoPrice('bitcoin');
        if (normalized === 'ETH') return this.getCryptoPrice('ethereum');
        if (normalized === 'SOL') return this.getCryptoPrice('solana');
        if (normalized === 'DOGE') return this.getCryptoPrice('dogecoin');
        if (normalized === 'XRP') return this.getCryptoPrice('ripple');
        if (normalized === 'AVAX') return this.getCryptoPrice('avalanche-2');
        if (normalized === 'USD/TRY' || normalized === 'DOLAR') return this.getUSDTRY();
        if (normalized === 'EUR/TRY' || normalized === 'EURO') return this.getYahooFinancePrice('EURTRY=X');
        if (normalized === 'EUR/USD') return this.getYahooFinancePrice('EURUSD=X');
        if (normalized === 'GBP/TRY' || normalized === 'STERLIN') return this.getYahooFinancePrice('GBPTRY=X');
        if (normalized === 'GÜMÜŞ') return this.getSilverPrice();
        if (normalized === 'XU100' || normalized.includes('BORSA İSTANBUL')) return this.getYahooFinancePrice('XU100.IS');

        // Yahoo sembolü doğrudan verilmişse (GC=F, BTC-USD, XU100.IS ...)
        if (normalized.includes('=') || normalized.includes('.') || normalized.includes('-')) {
            return this.getYahooFinancePrice(normalized);
        }

        // BIST hisseleri: tam 4-5 HARF. Böylece "FED", "TAHVİL", "FAİZ" gibi
        // kelimeler yanlışlıkla hisse kodu sanılıp saçma fiyat döndürmez.
        if (/^[A-Z]{4,5}$/.test(normalized)) {
            return this.getYahooFinancePrice(`${normalized}.IS`);
        }

        return null;
    }

    private static async getCryptoPrice(id: string): Promise<PriceInfo | null> {
        try {
            const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
                headers: this.getHeaders()
            });
            const data = await resp.json();
            if (data[id]) {
                return {
                    price: data[id].usd,
                    currency: 'USD',
                    timestamp: Date.now()
                };
            }
            throw new Error('Data presence failure');
        } catch {
            // Fallback to Yahoo if Coingecko fails or returns empty
            const symbol = id === 'bitcoin' ? 'BTC-USD' : id === 'ethereum' ? 'ETH-USD' : id === 'solana' ? 'SOL-USD' : null;
            if (symbol) return this.getYahooFinancePrice(symbol);
        }
        return null;
    }

    private static async getUSDTRY(): Promise<PriceInfo | null> {
        try {
            const resp = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTTRY', {
                headers: this.getHeaders()
            });
            const data = await resp.json();
            if (data.price) {
                return {
                    price: parseFloat(data.price),
                    currency: 'TRY',
                    timestamp: Date.now()
                };
            }
        } catch { }

        // Fallback to Yahoo
        return this.getYahooFinancePrice('USDTRY=X');
    }

    private static async getGoldPrice(): Promise<PriceInfo | null> {
        try {
            // Priority: Binance PAXG (Physical Gold Token)
            const onsResp = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
                headers: this.getHeaders()
            });
            const onsData = await onsResp.json();
            const usdtry = await this.getUSDTRY();

            if (onsData.price && usdtry) {
                const gramAltin = (parseFloat(onsData.price) / 31.1035) * usdtry.price;
                return {
                    price: gramAltin,
                    currency: 'TRY',
                    timestamp: Date.now()
                };
            }
        } catch { }

        // Fallback: Yahoo Gold Futures (GC=F)
        const gc = await this.getYahooFinancePrice('GC=F');
        const usdtryFallback = await this.getUSDTRY();
        if (gc && usdtryFallback) {
            return {
                price: (gc.price / 31.1035) * usdtryFallback.price,
                currency: 'TRY',
                timestamp: Date.now()
            };
        }

        return null;
    }

    private static async getSilverPrice(): Promise<PriceInfo | null> {
        try {
            // Priority: Yahoo Silver Futures (SI=F) or Silver Trust (SLV)
            let si = await this.getYahooFinancePrice('SI=F');
            if (!si) si = await this.getYahooFinancePrice('SLV');

            const usdtry = await this.getUSDTRY();

            if (si && usdtry) {
                // Return price in TRY per gram
                // If it's SLV, it's roughly 1/10th of an ounce, but let's stick to SI=F mainly
                const pricePerGram = (si.price / 31.1035) * usdtry.price;
                return {
                    price: pricePerGram,
                    currency: 'TRY',
                    timestamp: Date.now()
                };
            }
        } catch { }
        return null;
    }

    private static async getYahooFinancePrice(symbol: string): Promise<PriceInfo | null> {
        try {
            // Yahoo is sensitive to headers, keep it simple
            const resp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
            const data = await resp.json();
            const result = data.chart.result?.[0];
            if (result) {
                const price = result.meta.regularMarketPrice;
                return {
                    price,
                    currency: result.meta.currency,
                    timestamp: Date.now()
                };
            }
        } catch {
            // console.error(`PriceService (Yahoo) Error for ${symbol}:`, e);
        }
        return null;
    }

    /* ------------------------------------------------------------------ *
     *  GEÇMİŞ FİYAT — isabet karnesinin temeli
     *
     *  NEDEN: Değerlendirici eskiden çıkış fiyatı olarak BUGÜNKÜ fiyatı
     *  alıyordu. Yani 7 günlük (KISA) bir görüş, aradan 60 gün geçtiyse
     *  60 günlük fiyat hareketine göre puanlanıyordu. Ayrıca giriş fiyatı
     *  kayıt anında alınamadıysa sinyal ölçülemeden kapanıyordu.
     *
     *  Çözüm: her iki ucu da tarihten okumak. Yahoo'nun grafik ucu günlük
     *  kapanış veriyor; istenen günde işlem yoksa (hafta sonu, tatil)
     *  öncesindeki en yakın kapanışa düşülür.
     * ------------------------------------------------------------------ */

    /** Varlığı geçmiş veri çekilebilen bir Yahoo sembolüne çevirir. */
    static yahooSymbol(asset: string): string | null {
        const n = normalizeAsset(asset);
        if (!n || CLASS_ASSETS.has(n)) return null;

        const MAP: Record<string, string> = {
            // Yahoo'da gram altın/gümüş yok; bunlar aşağıda iki seriden hesaplanıyor.
            'ALTIN': '__GRAM_ALTIN__',
            'GÜMÜŞ': '__GRAM_GUMUS__',
            'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SOL': 'SOL-USD',
            'DOGE': 'DOGE-USD', 'XRP': 'XRP-USD', 'AVAX': 'AVAX-USD',
            'USD/TRY': 'USDTRY=X', 'DOLAR': 'USDTRY=X',
            'EUR/TRY': 'EURTRY=X', 'EURO': 'EURTRY=X',
            'EUR/USD': 'EURUSD=X', 'GBP/TRY': 'GBPTRY=X', 'STERLIN': 'GBPTRY=X',
            'XU100': 'XU100.IS',
            'NASDAQ': '^IXIC', 'SP500': '^GSPC', 'DJI': '^DJI',
            'NIKKEI': '^N225', 'DXY': 'DX-Y.NYB', 'USD/JPY': 'JPY=X',
            'US10Y': '^TNX', 'VIX': '^VIX',
        };
        if (MAP[n]) return MAP[n];

        // Vadeli emtia, kripto çifti, BIST kodu gibi doğrudan verilmiş semboller
        if (n.includes('=') || n.includes('-') || n.includes('.') || n.startsWith('^')) return n;

        // 1-5 harfli ABD sembolleri ile 4-5 harfli BIST kodlarını ayırt et:
        // BIST kodları Yahoo'da .IS son eki ister. Türkçe harf içeren kodlar da BIST'tir.
        if (/^[A-Z]{4,5}$/.test(n)) return `${n}.IS`;
        if (/^[A-Z]{1,5}$/.test(n)) return n;
        return null;
    }

    /** Verilen tarihteki (ya da ondan önceki en yakın işlem gününün) kapanışı. */
    static async getPriceAt(asset: string, whenIso: string): Promise<PriceInfo | null> {
        const symbol = this.yahooSymbol(asset);
        if (!symbol) return null;

        if (symbol === '__GRAM_ALTIN__' || symbol === '__GRAM_GUMUS__') {
            const ons = symbol === '__GRAM_ALTIN__' ? 'GC=F' : 'SI=F';
            const [usd, kur] = await Promise.all([
                this.closeAt(ons, whenIso),
                this.closeAt('USDTRY=X', whenIso),
            ]);
            if (usd === null || kur === null) return null;
            // ons -> gram (1 ons = 31.1035 gram), sonra TL'ye çevir
            return { price: (usd / 31.1035) * kur, currency: 'TRY', timestamp: Date.parse(whenIso) };
        }

        let close = await this.closeAt(symbol, whenIso);
        let used = symbol;

        // NVDA gibi 4 harfli ABD sembolleri BIST koduna benziyor. Önce .IS
        // denenir, gelmezse sembol olduğu gibi tekrar denenir.
        if (close === null && symbol.endsWith('.IS')) {
            const bare = symbol.slice(0, -3);
            close = await this.closeAt(bare, whenIso);
            if (close !== null) used = bare;
        }
        if (close === null) return null;
        const currency = used.endsWith('.IS') || used.endsWith('TRY=X') ? 'TRY' : 'USD';
        return { price: close, currency, timestamp: Date.parse(whenIso) };
    }

    private static histCache: Record<string, number | null> = {};

    private static async closeAt(symbol: string, whenIso: string): Promise<number | null> {
        const target = Date.parse(whenIso);
        if (!Number.isFinite(target)) return null;
        const key = `${symbol}@${whenIso.slice(0, 10)}`;
        if (key in this.histCache) return this.histCache[key];

        // Hedefin 10 gün öncesinden 2 gün sonrasına kadar pencere: hafta sonu,
        // resmi tatil ve uzun bayram tatillerini de kapsar.
        const p1 = Math.floor(target / 1000) - 10 * 86400;
        const p2 = Math.floor(target / 1000) + 2 * 86400;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
            `?period1=${p1}&period2=${p2}&interval=1d`;

        try {
            // DİKKAT: Yahoo'ya tarayıcı taklidi başlık göndermek 429 döndürüyor.
            // Başlıksız istek sorunsuz geçiyor — getHeaders() burada KULLANILMAZ.
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(String(resp.status));
            const data = await resp.json();
            const r = data?.chart?.result?.[0];
            const stamps: number[] = r?.timestamp ?? [];
            const closes: (number | null)[] = r?.indicators?.quote?.[0]?.close ?? [];

            let best: number | null = null;
            for (let i = 0; i < stamps.length; i++) {
                if (stamps[i] * 1000 > target + 86400_000) break; // hedeften sonrasını alma
                if (typeof closes[i] === 'number') best = closes[i] as number;
            }
            this.histCache[key] = best;
            return best;
        } catch {
            this.histCache[key] = null;
            return null;
        }
    }

}
