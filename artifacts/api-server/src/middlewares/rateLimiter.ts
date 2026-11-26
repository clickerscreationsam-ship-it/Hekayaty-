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
 * High-performance sliding-window in-memory rate limiter.
 * Securely relies on Express's sanitized `req.ip` (configured via `app.set('trust proxy')`)
 * and NEVER reads unverified `X-Forwarded-For` directly from client headers.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'تم تجاوز الحد المسموح به من الطلبات. يرجى الانتظار والمحاولة لاحقاً.',
    statusCode = 429,
    keyGenerator = (req: Request) => {
      // Prioritize authenticated user ID if present
      if (req.user?.id) return `user_${req.user.id}`;
      // Use Express's managed req.ip which respects 'trust proxy' configuration, fallback to socket remoteAddress
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      return `ip_${clientIp}`;
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

// Granular Security Rate Limiters
export const authLoginLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // 5 login attempts per minute per IP
  message: 'محاولات دخول كثيرة جداً. لحماية أمان الحساب، يرجى الانتظار دقيقة واحدة قبل المحاولة مجدداً.',
});

export const authRegisterLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 3,              // 3 registration attempts per minute per IP
  message: 'تم تجاوز الحد المسموح به لإنشاء الحسابات في الدقيقة. يرجى الانتظار قليلاً.',
});

export const authPasswordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,                   // 3 password reset requests per 15 min per IP
  message: 'تم تجاوز عدد محاولات استعادة كلمة المرور. يرجى الانتظار 15 دقيقة.',
});

export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300,            // 300 requests per minute
  message: 'تم تجاوز معدل استدعاء الواجهة البرمجية (API Rate Limit). يرجى تقليل سرعة الطلبات.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 uploads per minute per user/IP
  message: 'تم تجاوز الحد المسموح به لرفع الملفات في الدقيقة الواحدة.',
});

export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute
  message: 'تم تجاوز الحد الأقصى للعمليات الإدارية في الدقيقة.',
});

// Backwards-compatible alias
export const authRateLimiter = authLoginLimiter;
