'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = {
  code: 'NGN' | 'USD' | 'EUR' | 'GBP';
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to NGN
};

export const CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0012 }, // Fallback rate
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0011 }, // Fallback rate
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.00095 }, // Fallback rate
];

type CurrencyContextType = {
  currentCurrency: Currency;
  changeCurrency: (code: Currency['code']) => void;
  convertPrice: (priceInNGN: number) => number;
  formatPrice: (priceInNGN: number) => string;
  isLoadingRates: boolean;
  lastUpdated: string | null;
  refreshRates: () => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(CURRENCIES[0]); // Default to NGN
  const [currencies, setCurrencies] = useState<Currency[]>(CURRENCIES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load saved currency preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredCurrency');
      if (saved) {
        const currency = currencies.find((c) => c.code === saved);
        if (currency) setCurrentCurrency(currency);
      }
    }
  }, [currencies]);

  // Fetch live exchange rates on mount
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh rates every hour
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setIsLoadingRates(true);
      console.log('🌐 Fetching exchange rates...');

      const response = await fetch('/api/exchange-rates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      if (data.success && data.rates) {
        // Update currencies with live rates
        const updatedCurrencies = CURRENCIES.map(currency => ({
          ...currency,
          rate: data.rates[currency.code] || currency.rate,
        }));

        setCurrencies(updatedCurrencies);
        setLastUpdated(data.lastUpdated);

        // Update current currency with new rate
        const updatedCurrent = updatedCurrencies.find(c => c.code === currentCurrency.code);
        if (updatedCurrent) {
          setCurrentCurrency(updatedCurrent);
        }

        console.log('✅ Exchange rates updated:', data.rates);
        
        if (data.fallback) {
          console.warn('⚠️ Using fallback rates due to API error');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      // Continue using fallback rates from CURRENCIES
    } finally {
      setIsLoadingRates(false);
    }
  };

  const changeCurrency = (code: Currency['code']) => {
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      setCurrentCurrency(currency);
      localStorage.setItem('preferredCurrency', code);
      console.log('💱 Currency changed to:', code);
    }
  };

  const convertPrice = (priceInNGN: number): number => {
    return priceInNGN * currentCurrency.rate;
  };

  const formatPrice = (priceInNGN: number): string => {
    const converted = convertPrice(priceInNGN);
    return `${currentCurrency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: currentCurrency.code === 'NGN' ? 0 : 2,
      maximumFractionDigits: currentCurrency.code === 'NGN' ? 0 : 2,
    })}`;
  };

  const refreshRates = async () => {
    await fetchExchangeRates();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        changeCurrency,
        convertPrice,
        formatPrice,
        isLoadingRates,
        lastUpdated,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}