/**
 * localStorage wrapper: every real app needs this because raw localStorage
 * throws in private-browsing/quota-exceeded scenarios and only stores strings.
 * This centralizes JSON serialization + error handling in one place.
 */

const memoryFallback = new Map(); // used if localStorage is unavailable entirely

function isStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

export const storage = {
  get(key, fallback = null) {
    try {
      if (!storageAvailable) return memoryFallback.has(key) ? memoryFallback.get(key) : fallback;
      const raw = window.localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (err) {
      console.error(`[storage] Failed to read "${key}"`, err);
      return fallback;
    }
  },

  set(key, value) {
    try {
      if (!storageAvailable) {
        memoryFallback.set(key, value);
        return true;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[storage] Failed to write "${key}"`, err);
      return false;
    }
  },

  remove(key) {
    try {
      storageAvailable ? window.localStorage.removeItem(key) : memoryFallback.delete(key);
    } catch (err) {
      console.error(`[storage] Failed to remove "${key}"`, err);
    }
  },

  /**
   * Subscribes to changes made to `key` from OTHER browser tabs.
   * The native `storage` event never fires in the tab that made the change,
   * which is exactly what you want (avoids feedback loops).
   */
  onExternalChange(key, callback) {
    const handler = (event) => {
      if (event.key !== key) return;
      try {
        callback(event.newValue ? JSON.parse(event.newValue) : null);
      } catch (err) {
        console.error(`[storage] Failed to parse external change for "${key}"`, err);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },
};
