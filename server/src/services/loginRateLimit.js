export const LOGIN_RATE_LIMIT_MAX = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 10_000;
const PRUNE_INTERVAL_MS = 60 * 1000;

const failures = new Map();
let lastPrunedAt = 0;

function pruneExpired(now) {
  for (const [key, entry] of failures) {
    if (entry.resetAt <= now) {
      failures.delete(key);
    }
  }

  while (failures.size > MAX_TRACKED_KEYS) {
    const oldestKey = failures.keys().next().value;
    failures.delete(oldestKey);
  }
}

function maybePrune(now) {
  if (failures.size > MAX_TRACKED_KEYS || now - lastPrunedAt >= PRUNE_INTERVAL_MS) {
    pruneExpired(now);
    lastPrunedAt = now;
  }
}

export function buildLoginRateLimitKey(ip, email) {
  return `${ip ?? 'unknown'}|${email}`;
}

export function getLoginRetryAfterMs(key, now = Date.now()) {
  const entry = failures.get(key);

  if (!entry) {
    return 0;
  }

  if (entry.resetAt <= now) {
    failures.delete(key);
    return 0;
  }

  return entry.count >= LOGIN_RATE_LIMIT_MAX ? entry.resetAt - now : 0;
}

export function recordLoginAttempt(key, now = Date.now()) {
  maybePrune(now);

  const entry = failures.get(key);

  if (!entry || entry.resetAt <= now) {
    failures.set(key, {
      count: 1,
      resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  entry.count += 1;
}

export function clearLoginFailures(key) {
  failures.delete(key);
}

export function resetLoginRateLimiter() {
  failures.clear();
  lastPrunedAt = 0;
}
