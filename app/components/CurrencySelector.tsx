'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, RefreshCw } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';

export default function CurrencySelector() {
  const { currentCurrency, changeCurrency, isLoadingRates, lastUpdated, refreshRates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefreshRates = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshRates();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-400 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
        aria-label="Select currency"
      >
        <Globe className={`w-4 h-4 text-orange-500 ${isLoadingRates ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{currentCurrency.code}</span>
        <span className="font-bold">{currentCurrency.symbol}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select Currency
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Updated {formatLastUpdated(lastUpdated)}
                  </p>
                )}
              </div>
              <button
                onClick={handleRefreshRates}
                disabled={isRefreshing || isLoadingRates}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh exchange rates"
              >
                <RefreshCw 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${
                    (isRefreshing || isLoadingRates) ? 'animate-spin' : ''
                  }`} 
                />
              </button>
            </div>

            {/* Currency options */}
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  changeCurrency(currency.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                  currentCurrency.code === currency.code
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currency.symbol}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {currency.code}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currency.name}
                    </p>
                  </div>
                </div>
                {currentCurrency.code === currency.code && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
          
          {/* Footer info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {isLoadingRates ? (
                <>
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></span>
                  Updating rates...
                </>
              ) : (
                'Rates update automatically every hour'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}