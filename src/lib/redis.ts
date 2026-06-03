import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';

let redis: Redis | null = null;

if (redisUrl && redisUrl !== 'disabled') {
  try {
    redis = new Redis(redisUrl);
    redis.on('error', () => { redis = null; });
  } catch {
    redis = null;
  }
}

export { redis };

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {}
}
