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

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/Products/search?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setResults(data.products);
        setIsOpen(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input wrapper matching rectangular sleek aesthetic from reference */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Enter key to search"
          className="w-full pl-4 pr-12 py-2 border border-black/20 rounded-none text-xs tracking-wide focus:outline-none focus:border-black/60 bg-white placeholder:text-gray-400 text-black transition-all"
        />
        <div className="absolute right-4 flex items-center gap-2">
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }} className="text-gray-400 hover:text-black">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Polish Results Panel to remove excessive curves & match brand premium tone */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/10 rounded-none shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-1 border-b border-black/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c64171]">
                  Matching Items
                </span>
              </div>

              <ul className="max-h-72 overflow-y-auto split-y split-black/5">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/Cloths/${product.id}`}
                      onClick={() => { setIsOpen(false); setQuery(""); }}
                      className="flex items-center gap-4 px-4 py-2.5 hover:bg-black/5 transition-colors"
                    >
                      <div className="w-10 h-12 bg-gray-100 flex-shrink-0">
                        {product.imageUrl && !product.imageUrl.startsWith("data:") ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-black uppercase tracking-wide truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-black text-black/60 mt-0.5">
                          {formatNaira(product.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-2 bg-gray-50 border-t border-black/5">
                <Link
                  href={`/Cloths?search=${encodeURIComponent(query)}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="text-[10px] font-bold text-black/60 hover:text-black uppercase tracking-widest block text-center"
                >
                  View all results for "{query}" →
                </Link>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-400 font-medium">No records found matching "{query}"</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}