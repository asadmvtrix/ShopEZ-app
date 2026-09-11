export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Corrupted entry or storage blocked (private mode, disabled cookies).
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked; state stays in memory for this session.
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to recover from.
  }
}
