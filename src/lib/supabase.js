import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);


export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

export function authRedirectTo(path = "/auth?mode=update-password") {
  const base = window.location.origin;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const OAUTH_ATTEMPT_KEY = "shopez.oauth.attempt";

export function markGoogleOAuthAttempt() {
  try {
    sessionStorage.setItem(OAUTH_ATTEMPT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearGoogleOAuthAttempt() {
  try {
    sessionStorage.removeItem(OAUTH_ATTEMPT_KEY);
  } catch {
    /* ignore */
  }
}

export function consumeGoogleOAuthAttempt() {
  try {
    const pending = sessionStorage.getItem(OAUTH_ATTEMPT_KEY) === "1";
    if (pending) sessionStorage.removeItem(OAUTH_ATTEMPT_KEY);
    return pending;
  } catch {
    return false;
  }
}
