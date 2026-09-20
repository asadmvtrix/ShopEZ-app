export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage (private mode / quota).
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (private mode / quota).
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore remove failures (private mode / quota).
  }
}
