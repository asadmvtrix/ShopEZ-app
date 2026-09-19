const FALLBACK = "Something went wrong. Please try again.";

const RULES = [
  [/failed to fetch|networkerror|load failed|network request failed/i, "Check your connection and try again."],
  [/abort(ed)?|timeout|timed out/i, "That took too long. Please try again."],
  [/invalid login credentials/i, "Incorrect email or password."],
  [/user already registered/i, "An account with this email already exists."],
  [/email not confirmed/i, "Check your inbox for the confirmation link, then sign in."],
  [/new password should be different|same password/i, "The new password matches the current one."],
  [/rate limit|too many requests|over_request_rate/i, "Too many attempts. Wait a moment and try again."],
  [/jwt expired|session.*expired|refresh.?token/i, "Your session expired. Sign in again."],
  [/not authorized|unauthorized|403/i, "You don’t have permission to do that."],
];

export function toUserMessage(error, fallback = FALLBACK) {
  if (error == null || error === "") return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (!trimmed) return fallback;
    return humanize(trimmed, fallback);
  }

  if (typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
    return humanize(error.message.trim(), fallback);
  }

  return fallback;
}

function humanize(message, fallback) {
  for (const [pattern, text] of RULES) {
    if (pattern.test(message)) return text;
  }

  if (message.length <= 160 && !looksTechnical(message)) {
    return message;
  }

  return fallback;
}

function looksTechnical(message) {
  return /stack|exception|undefined|null is not|cannot read|supabase|postgres|pgrst|rpc|at\s+\w+\s+\(/i.test(
    message
  );
}
