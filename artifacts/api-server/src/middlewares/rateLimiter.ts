import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * High-performance sliding-window in-memory rate limiter with automated memory cleanup.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'تم تجاوز الحد المسموح به من الطلبات. يرجى الانتظار والمحاولة لاحقاً.',
    statusCode = 429,
    keyGenerator = (req: Request) => {
      // Prioritize authenticated user ID, otherwise client IP
      if (req.user?.id) return `user_${req.user.id}`;
      const forwarded = req.headers['x-forwarded-for'];
      const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.ip || req.socket.remoteAddress || '127.0.0.1';
      return `ip_${ip}`;
    },
  } = options;

  const hits = new Map<string, ClientRecord>();

  // Periodically sweep expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 120_000);
  cleanupInterval.unref(); // Do not block process exit

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator(req);
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(statusCode).json({
        error: message,
        retryAfterSeconds: resetSeconds,
      });
    }

    return next();
  };
}

// Preconfigured security rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 attempts per minute per IP
  message: 'محاولات دخول كثيرة جداً. لحماية أمان الحساب، يرجى الانتظار دقيقة واحدة قبل المحاولة مجدداً.',
});

export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300,            // 300 requests per minute
  message: 'تم تجاوز معدل استدعاء الواجهة البرمجية (API Rate Limit). يرجى تقليل سرعة الطلبات.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 uploads per minute
  message: 'تم تجاوز الحد المسموح به لرفع الملفات في الدقيقة الواحدة.',
});
