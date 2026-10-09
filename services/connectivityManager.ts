/**
 * ASTRA Health - Connectivity Manager
 * Tracks browser online/offline, backend reachability, and simulates space communication loss.
 */

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'COMMS_BLACKOUT';

class ConnectivityManager {
  private browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private backendReachable = true;
  private commsLossSimulated = false;
  private listeners: ((state: ConnectionState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.browserOnline = true;
        this.checkBackend();
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.browserOnline = false;
        this.notify();
      });

      // Periodic health check ping
      setInterval(() => {
        if (!this.commsLossSimulated) {
          this.checkBackend();
        }
      }, 15000);
    }
  }

  public async checkBackend(): Promise<boolean> {
    if (!this.browserOnline || this.commsLossSimulated) {
      this.backendReachable = false;
      this.notify();
      return false;
    }
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
      this.backendReachable = res.ok;
    } catch {
      this.backendReachable = false;
    }
    this.notify();
    return this.backendReachable;
  }

  public isOnline(): boolean {
    if (this.commsLossSimulated) return false;
    return this.browserOnline && this.backendReachable;
  }

  public isCommsLossSimulated(): boolean {
    return this.commsLossSimulated;
  }

  public simulateCommsLoss(enabled: boolean): void {
    this.commsLossSimulated = enabled;
    this.notify();
  }

  public getConnectionState(): ConnectionState {
    if (this.commsLossSimulated) return 'COMMS_BLACKOUT';
    return this.browserOnline && this.backendReachable ? 'ONLINE' : 'OFFLINE';
  }

  public subscribe(callback: (state: ConnectionState) => void): () => void {
    this.listeners.push(callback);
    callback(this.getConnectionState());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    const state = this.getConnectionState();
    this.listeners.forEach(cb => cb(state));
  }
}

export const connectivityManager = new ConnectivityManager();
