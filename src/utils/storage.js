export const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* prototype only */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* prototype only */ }
  },
};
