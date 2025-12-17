import { NextResponse } from 'next/server';

// Cache exchange rates for 1 hour
let cachedRates: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    // Check if we have valid cached rates
    const now = Date.now();
    if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📊 Returning cached exchange rates');
      return NextResponse.json({
        success: true,
        rates: cachedRates,
        cached: true,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      });
    }

    console.log('🌐 Fetching fresh exchange rates...');

    // Option 1: ExchangeRate-API (Free, no API key required)
    // Get rates with NGN as base currency
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/NGN');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    // Extract the rates we need
    const rates = {
      NGN: 1, // Base currency
      USD: data.rates.USD || 0.0012,
      EUR: data.rates.EUR || 0.0011,
      GBP: data.rates.GBP || 0.00095,
    };

    // Update cache
    cachedRates = rates;
    cacheTimestamp = now;

    console.log('✅ Exchange rates updated:', rates);

    return NextResponse.json({
      success: true,
      rates,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error fetching exchange rates:', error);

    // Return fallback rates if API fails
    const fallbackRates = {
      NGN: 1,
      USD: 0.0012, // Approximate: 1 NGN = 0.0012 USD (1 USD ≈ 833 NGN)
      EUR: 0.0011, // Approximate: 1 NGN = 0.0011 EUR (1 EUR ≈ 909 NGN)
      GBP: 0.00095, // Approximate: 1 NGN = 0.00095 GBP (1 GBP ≈ 1053 NGN)
    };

    return NextResponse.json({
      success: true,
      rates: fallbackRates,
      cached: false,
      fallback: true,
      error: error.message,
      lastUpdated: new Date().toISOString(),
    });
  }
}

// Optional: Manual rate update endpoint (for admin use)
export async function POST(req: Request) {
  try {
    const { rates, adminKey } = await req.json();

    // Verify admin key (you should set this in your .env)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate rates
    if (!rates || typeof rates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid rates format' },
        { status: 400 }
      );
    }

    // Update cache with manual rates
    cachedRates = {
      NGN: 1,
      USD: rates.USD || cachedRates?.USD || 0.0012,
      EUR: rates.EUR || cachedRates?.EUR || 0.0011,
      GBP: rates.GBP || cachedRates?.GBP || 0.00095,
    };
    cacheTimestamp = Date.now();

    console.log('✅ Exchange rates manually updated:', cachedRates);

    return NextResponse.json({
      success: true,
      rates: cachedRates,
      manual: true,
      lastUpdated: new Date(cacheTimestamp).toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error updating exchange rates:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}