/**
 * Lightweight wrapper around localStorage with JSON serialisation
 * and graceful fallback when storage is unavailable (SSR, private mode).
 */

class StorageService {
  private memory = new Map<string, string>();

  private get isAvailable(): boolean {
    try {
      const k = '__iia_test__';
      window.localStorage.setItem(k, k);
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = this.isAvailable
        ? window.localStorage.getItem(key)
        : (this.memory.get(key) ?? null);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    const raw = JSON.stringify(value);
    if (this.isAvailable) window.localStorage.setItem(key, raw);
    else this.memory.set(key, raw);
  }

  remove(key: string): void {
    if (this.isAvailable) window.localStorage.removeItem(key);
    else this.memory.delete(key);
  }

  clear(): void {
    if (this.isAvailable) window.localStorage.clear();
    else this.memory.clear();
  }
}

export const storage = new StorageService();
