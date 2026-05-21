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

const fallbackRateLimiter = {
  limit: async (ip: string) => ({ success: true, pending: Promise.resolve() })
};

// AI Suggestion Rate Limiter (3 requests per 1 minute window)
export const aiRateLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/ai',
    })
  : fallbackRateLimiter;

// Send Message Rate Limiter (3 requests per 1 minute window)
export const messageRateLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/message',
    })
  : fallbackRateLimiter;
