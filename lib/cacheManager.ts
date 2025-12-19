// lib/cacheManager.ts

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

class CacheManager {
  private static readonly DEFAULT_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Save data to cache with expiration
   */
  static set<T>(key: string, data: T, duration = this.DEFAULT_DURATION): void {
    if (typeof window === "undefined") return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
      };

      localStorage.setItem(key, JSON.stringify(entry));
      console.log(`💾 Cached: ${key} (expires in ${duration / 1000}s)`);
    } catch (error) {
      console.error(`Failed to cache ${key}:`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestCache();
        // Retry once
        try {
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + duration,
          };
          localStorage.setItem(key, JSON.stringify(entry));
        } catch {
          console.error('Cache retry failed');
        }
      }
    }
  }

  /**
   * Get data from cache if not expired
   */
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now > entry.expiresAt) {
        console.log(`⏰ Cache expired: ${key}`);
        this.remove(key);
        return null;
      }

      const age = Math.floor((now - entry.timestamp) / 1000);
      console.log(`✅ Cache hit: ${key} (age: ${age}s)`);
      return entry.data;
    } catch (error) {
      console.error(`Failed to read cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Get stale data (expired but still usable as fallback)
   */
  static getStale<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      console.log(`⚠️ Using stale cache: ${key}`);
      return entry.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  static remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    console.log(`🗑️ Removed cache: ${key}`);
  }

  /**
   * Clear all cache with specific prefix
   */
  static clearPrefix(prefix: string): void {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log(`🗑️ Cleared all cache with prefix: ${prefix}`);
  }

  /**
   * Clear all expired cache entries
   */
  static clearExpired(): void {
    if (typeof window === "undefined") return;

    const now = Date.now();
    const keys = Object.keys(localStorage);
    let cleared = 0;

    keys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return;

        const entry: CacheEntry<any> = JSON.parse(cached);
        if (entry.expiresAt && now > entry.expiresAt) {
          localStorage.removeItem(key);
          cleared++;
        }
      } catch {
        // Skip invalid entries
      }
    });

    console.log(`🗑️ Cleared ${cleared} expired cache entries`);
  }

  /**
   * Clear oldest cache entry (useful when quota exceeded)
   */
  static clearOldestCache(): void {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    keys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return;

        const entry: CacheEntry<any> = JSON.parse(cached);
        if (entry.timestamp && entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      } catch {
        // Skip invalid entries
      }
    });

    if (oldestKey) {
      localStorage.removeItem(oldestKey);
      console.log(`🗑️ Removed oldest cache: ${oldestKey}`);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    totalEntries: number;
    totalSize: number;
    expired: number;
    valid: number;
  } {
    if (typeof window === "undefined") {
      return { totalEntries: 0, totalSize: 0, expired: 0, valid: 0 };
    }

    const now = Date.now();
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    let expired = 0;
    let valid = 0;

    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        
        try {
          const entry: CacheEntry<any> = JSON.parse(item);
          if (entry.expiresAt) {
            if (now > entry.expiresAt) {
              expired++;
            } else {
              valid++;
            }
          }
        } catch {
          // Not a cache entry
        }
      }
    });

    return {
      totalEntries: keys.length,
      totalSize: Math.round(totalSize / 1024), // KB
      expired,
      valid,
    };
  }

  /**
   * Check if cache exists and is valid
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache age in seconds
   */
  static getAge(key: string): number | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<any> = JSON.parse(cached);
      return Math.floor((Date.now() - entry.timestamp) / 1000);
    } catch {
      return null;
    }
  }

  /**
   * Get time until expiration in seconds
   */
  static getTimeUntilExpiration(key: string): number | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<any> = JSON.parse(cached);
      const remaining = entry.expiresAt - Date.now();
      return Math.max(0, Math.floor(remaining / 1000));
    } catch {
      return null;
    }
  }
}

export default CacheManager;

// Usage example:
/*
import CacheManager from '@/lib/cacheManager';

// Save data
CacheManager.set('products', productsData, 5 * 60 * 1000); // 5 minutes

// Get data
const products = CacheManager.get<Product[]>('products');

// Get stale data as fallback
const staleProducts = CacheManager.getStale<Product[]>('products');

// Check if cache exists
if (CacheManager.has('products')) {
  console.log('Cache exists');
}

// Get cache age
const age = CacheManager.getAge('products');
console.log(`Cache is ${age} seconds old`);

// Clear specific cache
CacheManager.remove('products');

// Clear all expired caches
CacheManager.clearExpired();

// Get cache statistics
const stats = CacheManager.getStats();
console.log(`Total cache: ${stats.totalSize}KB, Valid: ${stats.valid}, Expired: ${stats.expired}`);
*/