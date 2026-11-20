import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (error) {
  console.warn("Failed to initialize Redis. Rate limiting will be bypassed.", error);
}

type Limiter = { limit: (identifier: string) => Promise<{ success: boolean }> };

const fallbackRateLimiter: Limiter = {
  limit: async () => ({ success: true })
};

// Fail open: if Redis is unreachable (deleted DB, network issue, bad creds),
// allow the request instead of crashing the route with a 500.
function failOpen(limiter: Ratelimit): Limiter {
  return {
    limit: async (identifier: string) => {
      try {
        return await limiter.limit(identifier);
      } catch (error) {
        console.error("Rate limiter unavailable, allowing request:", error);
        return { success: true };
      }
    },
  };
}

// AI Suggestion Rate Limiter (3 requests per 1 minute window)
export const aiRateLimiter = redis
  ? failOpen(new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/ai',
    }))
  : fallbackRateLimiter;

// Send Message Rate Limiter (3 requests per 1 minute window)
export const messageRateLimiter = redis
  ? failOpen(new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/message',
    }))
  : fallbackRateLimiter;
