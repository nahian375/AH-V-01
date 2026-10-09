/**
 * ASTRA Health - In-Memory NASA Cache Manager
 * Handles caching with TTL, offline fallback storage, and status tracking for NASA endpoints.
 */

import { CachedNasaData } from './nasaTypes.ts';

interface CacheEntry<T> {
  data: T;
  source: 'NASA_RADLAB' | 'NASA_DONKI' | 'NASA_OSDR';
  fetchedAt: string;
  expiresAt: string;
}

class NasaCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private persistentFallback = new Map<string, any>();
  private defaultTTL_Ms = 15 * 60 * 1000; // 15 minutes

  public set<T>(key: string, source: 'NASA_RADLAB' | 'NASA_DONKI' | 'NASA_OSDR', data: T, ttlMs?: number): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttlMs || this.defaultTTL_Ms)).toISOString();
    const fetchedAt = now.toISOString();

    const entry: CacheEntry<T> = {
      data,
      source,
      fetchedAt,
      expiresAt,
    };

    this.cache.set(key, entry);
    // Keep a permanent fallback copy in case network goes down
    this.persistentFallback.set(key, { data, source, fetchedAt });
  }

  public get<T>(key: string): { data: T; status: 'live' | 'cached' | 'expired'; fetchedAt: string } | null {
    const entry = this.cache.get(key);
    if (entry) {
      const now = new Date().toISOString();
      const isExpired = now > entry.expiresAt;
      return {
        data: entry.data,
        status: isExpired ? 'cached' : 'live',
        fetchedAt: entry.fetchedAt,
      };
    }

    const fallback = this.persistentFallback.get(key);
    if (fallback) {
      return {
        data: fallback.data,
        status: 'cached',
        fetchedAt: fallback.fetchedAt,
      };
    }

    return null;
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearAll(): void {
    this.cache.clear();
    this.persistentFallback.clear();
  }
}

export const nasaCache = new NasaCacheManager();
