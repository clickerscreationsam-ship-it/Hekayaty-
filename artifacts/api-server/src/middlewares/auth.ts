import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'reader' | 'writer' | 'publishing_house' | 'admin';
        displayName: string;
        avatarUrl?: string | null;
        bio?: string | null;
      };
      sessionToken?: string;
    }
  }
}

// ---------------------------------------------------------------------------
// Crypto Utilities (Scrypt, Session Tokens & Timing-Safe Hashing)
// ---------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';
let rawSecret = process.env.SESSION_SECRET;

if (isProduction) {
  if (!rawSecret || rawSecret.length < 32 || rawSecret === 'hekayaty_core_secret_key_2027_production') {
    const errorMsg = '[FATAL SECURITY ERROR] SESSION_SECRET must be set to a high-entropy string of at least 32 characters in production! Server refused to start.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
} else {
  if (!rawSecret || rawSecret.length < 32 || rawSecret === 'hekayaty_core_secret_key_2027_production') {
    rawSecret = process.env.SESSION_SECRET_DEV || 'hekayaty_dev_secret_key_32_characters_minimum!';
  }
}

const SESSION_SECRET: string = rawSecret;

export function createSessionToken(userId: string, expiresInDays = 90): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID provided for session creation');
  }
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const payload = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const b64 = Buffer.from(payload).toString('base64url');
  return `hky_${b64}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  if (!token || typeof token !== 'string' || !token.startsWith('hky_')) return null;
  const parts = token.slice(4).split('.');
  if (parts.length !== 2) return null;
  const [b64, signature] = parts;
  if (!b64 || !signature || signature.length !== 64) return null;
  try {
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const [userId, expiresAtStr] = payload.split(':');
    const expiresAt = Number(expiresAtStr);
    if (!userId || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return null;
    }
    return { userId };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = Buffer.from(key, 'hex');
        const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ---------------------------------------------------------------------------
// Authentication Middleware (Direct Supabase JWT & Profile Verification)
// ---------------------------------------------------------------------------
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.['session_token'];
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return next();
    }

    req.sessionToken = token;

    // 1. Check if token is our long-lived signed session token (90 days)
    const session = verifySessionToken(token);
    if (session) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', session.userId)
        .maybeSingle();

      if (profile) {
        if (profile.is_active === false) {
          return next();
        }

        req.user = {
          id: profile.id,
          email: profile.email || '',
          role: (profile.role as any) || 'reader',
          displayName: profile.display_name || profile.email?.split('@')[0] || 'مستكشف حكاياتي',
          avatarUrl: profile.avatar_url || null,
          bio: profile.bio || null,
        };
        return next();
      } else if (!isProduction) {
        // Development & automated testing fallback when DB connection is offline or test ID is unseeded
        req.user = {
          id: session.userId,
          email: 'dev-test@hekayaty.com',
          role: 'admin',
          displayName: 'مطور حكاياتي للاختبار',
          avatarUrl: null,
          bio: null,
        };
        return next();
      }
    }

    // 2. Fallback: Verify standard Supabase JWT token
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authData?.user && !authError) {
      const u = authData.user;
      
      // Fetch full active profile from public.profiles
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        // Inactive / deactivated account
        return next();
      }

      req.user = {
        id: u.id,
        email: u.email || '',
        role: (profile?.role as any) || (u.user_metadata?.role as any) || 'reader',
        displayName: profile?.display_name || u.user_metadata?.displayName || u.email?.split('@')[0] || 'مستكشف حكاياتي',
        avatarUrl: profile?.avatar_url || null,
        bio: profile?.bio || null,
      };
    }

    next();
  } catch (err) {
    next();
  }
}

// ---------------------------------------------------------------------------
// Require Logged-In User
// ---------------------------------------------------------------------------
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'يرجى تسجيل الدخول للوصول إلى هذه الميزة',
      code: 'UNAUTHORIZED',
    });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC)
// ---------------------------------------------------------------------------
export function requireRole(...allowedRoles: Array<'reader' | 'writer' | 'publishing_house' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'يرجى تسجيل الدخول للتحقق من الصلاحيات',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}
