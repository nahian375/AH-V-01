/**
 * ASTRA Health - Synchronization Engine
 * Manages the offline sync queue, background syncing to backend, and conflict-free persistence.
 */

import { db } from './db';
import { SyncQueueItem, SyncStatus } from '../types/mission';
import { connectivityManager } from './connectivityManager';

export interface SyncStateInfo {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedCount: number;
  lastSyncedAt: string | null;
  isOnline: boolean;
}

class SyncManager {
  private status: SyncStatus = 'IDLE';
  private lastSyncedAt: string | null = null;
  private pendingCount = 0;
  private lastSyncedCount = 0;
  private listeners: (() => void)[] = [];
  private isSyncing = false;

  constructor() {
    this.refreshQueueCount();
    connectivityManager.subscribe((state) => {
      if (state === 'ONLINE') {
        this.attemptSync();
      } else {
        this.status = 'OFFLINE';
        this.notify();
      }
    });
  }

  public async refreshQueueCount(): Promise<number> {
    try {
      this.pendingCount = await db.syncQueue.count();
      this.notify();
      return this.pendingCount;
    } catch {
      return 0;
    }
  }

  public async queueRecord(
    tableName: SyncQueueItem['tableName'],
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    data: any
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      tableName,
      operation,
      recordId,
      data,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };

    await db.syncQueue.put(item);
    await this.refreshQueueCount();

    // If online, auto-sync
    if (connectivityManager.isOnline()) {
      this.attemptSync();
    }
  }

  public async attemptSync(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.isSyncing || !connectivityManager.isOnline()) {
      return { success: false, syncedCount: 0 };
    }

    this.isSyncing = true;
    this.status = 'SYNCING';
    this.notify();

    try {
      const items = await db.syncQueue.toArray();
      if (items.length === 0) {
        this.status = 'SYNC_COMPLETE';
        this.isSyncing = false;
        this.notify();
        return { success: true, syncedCount: 0 };
      }

      // Send to backend /api/sync
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed with HTTP ${response.status}`);
      }

      // Remove synced items from queue
      const idsToRemove = items.map(i => i.id);
      await db.syncQueue.bulkDelete(idsToRemove);

      this.lastSyncedCount = items.length;
      this.lastSyncedAt = new Date().toLocaleTimeString();
      this.status = 'SYNC_COMPLETE';
      await this.refreshQueueCount();

      // Reset to idle after 4 seconds
      setTimeout(() => {
        if (this.status === 'SYNC_COMPLETE') {
          this.status = 'IDLE';
          this.notify();
        }
      }, 4000);

      this.isSyncing = false;
      this.notify();
      return { success: true, syncedCount: items.length };
    } catch (err) {
      console.warn('Sync failed, items remain in offline queue:', err);
      this.status = 'ERROR';
      this.isSyncing = false;
      this.notify();
      return { success: false, syncedCount: 0 };
    }
  }

  public getSyncState() {
    return {
      status: this.status,
      pendingCount: this.pendingCount,
      lastSyncedCount: this.lastSyncedCount,
      lastSyncedAt: this.lastSyncedAt,
      isOnline: connectivityManager.isOnline(),
    };
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    callback();
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const syncManager = new SyncManager();
