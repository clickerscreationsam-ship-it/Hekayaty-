import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/auth";
import { generalApiLimiter } from "./middlewares/rateLimiter";

const app: Express = express();
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// Reverse Proxy & Client IP Configuration
// ---------------------------------------------------------------------------
// Do not blindly trust all headers from untrusted clients.
// In production behind reverse proxy, trust loopback/internal hops or explicit config.
const trustProxySetting = process.env.TRUST_PROXY
  ? (process.env.TRUST_PROXY === 'true'
      ? true
      : Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY)
  : (process.env.NODE_ENV === 'production' ? 'loopback, linklocal, uniquelocal' : false);

app.set('trust proxy', trustProxySetting);

const httpLogger = (pinoHttp as any)?.default || (pinoHttp as any);

app.use(
  httpLogger({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ---------------------------------------------------------------------------
// Security Headers Middleware
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

// ---------------------------------------------------------------------------
// Strict Exact CORS Allowlist (No Wildcards / Suffix Matching)
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set<string>([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://hekayaty-v3.vercel.app",
  "https://hekayaty.com",
  "https://www.hekayaty.com",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, internal server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Strict exact match against verified allowlist
      if (ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }
      // Explicitly reject any unverified origin
      return callback(null, false);
    },
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// CSRF Defense for Mutating State Requests
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If request has Origin header, verify it strictly belongs to ALLOWED_ORIGINS
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({
      error: 'Cross-Origin Request Blocked by Security Policy',
      code: 'CSRF_ORIGIN_REJECTED',
    });
  }

  // If request has session cookie and Referer header, verify referer origin
  if (req.cookies?.session_token && referer) {
    try {
      const refUrl = new URL(referer);
      if (!ALLOWED_ORIGINS.has(refUrl.origin)) {
        return res.status(403).json({
          error: 'Untrusted Referer for Authenticated Request',
          code: 'CSRF_REFERER_REJECTED',
        });
      }
    } catch {
      return res.status(403).json({
        error: 'Malformed Referer header',
        code: 'CSRF_MALFORMED_REFERER',
      });
    }
  }

  next();
});

app.use(cookieParser());
// Limit body payload to prevent DoS memory exhaustion
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// General API Rate Limiting & Auth Parsing
app.use("/api", generalApiLimiter);
app.use(authMiddleware);

// API Routes (mounted at both /api and / to support direct API calls and reverse proxies)
app.use("/api", router);
app.use("/", router);

export default app;
