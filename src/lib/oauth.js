const OAUTH_ATTEMPT_KEY = "shopez.oauth.attempt";

export function markGoogleOAuthAttempt() {
  try {
    sessionStorage.setItem(OAUTH_ATTEMPT_KEY, "1");
  } catch {

  }
}

export function clearGoogleOAuthAttempt() {
  try {
    sessionStorage.removeItem(OAUTH_ATTEMPT_KEY);
  } catch {

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
