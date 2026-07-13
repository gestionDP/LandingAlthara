/**
 * Sliding-window rate limiter. In-memory per serverless instance — adequate
 * as a first brake for invitation/NDA endpoints. For production hardening,
 * swap the store for Upstash Redis (interface kept minimal on purpose).
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function rateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - input.windowMs;

  if (buckets.size > MAX_BUCKETS) buckets.clear(); // crude memory guard

  let bucket = buckets.get(input.key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(input.key, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= input.limit) {
    const oldest = bucket.hits[0];
    return { ok: false, retryAfterSeconds: Math.ceil((oldest + input.windowMs - now) / 1000) };
  }
  bucket.hits.push(now);
  return { ok: true, retryAfterSeconds: 0 };
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(JSON.stringify({ error: 'rate_limited' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(Math.max(1, retryAfterSeconds)),
    },
  });
}
