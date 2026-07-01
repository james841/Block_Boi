"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";

type SearchProduct = {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  category: string | null;
};

function formatNaira(amount: number) {
  return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

// In-memory cache
const searchCache = new Map<string, { results: SearchProduct[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 400;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastQueriedRef = useRef<string>("");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    if (trimmed === lastQueriedRef.current) return;

    const cached = searchCache.get(trimmed);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setResults(cached.results);
      setIsOpen(true);
      setIsLoading(false);
      lastQueriedRef.current = trimmed;
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/Products/search?q=${encodeURIComponent(trimmed)}`,
        { cache: "no-store", signal: abortRef.current.signal }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        searchCache.set(trimmed, { results: data.products, ts: Date.now() });
        lastQueriedRef.current = trimmed;
        setResults(data.products);
        setIsOpen(true);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => search(query), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    lastQueriedRef.current = "";
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="SEARCH STORE..."
          className="w-full pl-4 pr-12 py-3 bg-[#141414] border border-white/[0.06] rounded-xl text-[11px] font-bold tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
        />
        <div className="absolute right-4 flex items-center gap-2">
          {query && (
            <button onClick={handleClear} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      </div>

      {query.trim().length === 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.06] shadow-2xl z-50 px-4 py-3 rounded-xl">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Keep typing...</p>
        </div>
      )}

      {isOpen && results.length >= 0 && query.trim().length >= MIN_QUERY_LENGTH && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-1 border-b border-white/[0.04]">
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Matching Items</span>
              </div>
              <ul className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/Cloths/${product.id}`}
                      onClick={() => { setIsOpen(false); setQuery(""); }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-10 h-12 bg-[#0e0e0e] flex-shrink-0 border border-white/[0.05]">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">N/A</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.oldPrice && <span className="text-[10px] text-gray-500 line-through">{formatNaira(product.oldPrice)}</span>}
                          <span className="text-[11px] font-black text-orange-400">{formatNaira(product.price)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 bg-[#0e0e0e] border-t border-white/[0.04]">
                <Link
                  href={`/Cloths?search=${encodeURIComponent(query)}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest block text-center transition-colors"
                >
                  View all results →
                </Link>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No results found</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}