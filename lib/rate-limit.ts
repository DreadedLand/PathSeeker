import { ApiRouteError } from "@/lib/api-response";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitBucket>;

type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

const globalWithRateLimiter = globalThis as typeof globalThis & {
  __pathseekerRateLimitStore?: RateLimitStore;
};

function getRateLimitStore() {
  if (!globalWithRateLimiter.__pathseekerRateLimitStore) {
    globalWithRateLimiter.__pathseekerRateLimitStore = new Map();
  }

  return globalWithRateLimiter.__pathseekerRateLimitStore;
}

function pruneExpiredEntries(store: RateLimitStore, now: number) {
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function enforceRateLimit(options: RateLimitOptions) {
  const { key, maxRequests, windowMs } = options;
  const now = Date.now();
  const store = getRateLimitStore();
  pruneExpiredEntries(store, now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= maxRequests) {
    throw new ApiRouteError(429, "RATE_LIMITED", "Too many requests. Please try again shortly.");
  }

  bucket.count += 1;
  store.set(key, bucket);
}
