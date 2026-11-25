# HEKAYATY (حكاياتي) — EXPRESS BUSINESS LOGIC & SERVICE LAYER SPECIFICATION

The Express API Server serves as the central business orchestration and authorization layer.

---

## 1. Authentication & Security Middleware

### 1.1 Supabase JWT Verification Middleware (`verifySupabaseJWT`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface AuthenticatedUser {
  id: string; // UUID from auth.users
  email: string;
  role: 'reader' | 'writer' | 'publishing_house' | 'admin';
  displayName: string;
}

export async function verifySupabaseJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Unauthenticated guest
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate JWT through Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'رمز التوثيق غير صالح أو منتهي الصلاحية' });
    }

    // Retrieve verified profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'reader',
      displayName: profile?.display_name || user.email!,
    };
    req.userScopedSupabase = supabase; // Retain user context for RLS queries

    next();
  } catch (err) {
    return res.status(401).json({ error: 'خطأ أثناء التحقق من الجلسة' });
  }
}
```

---

## 2. Core Business Domains Orchestrated by Express

### 2.1 Protected Originals Reader Authorization (`GET /api/comics/:id/pages`)
When a reader accesses a comic issue:
1. Express checks if `comics.is_free === true`. If free, returns full page URLs immediately.
2. If paid:
   - Verifies whether user is authenticated (`req.user`).
   - Queries `entitlements` where `user_id = req.user.id AND content_id = :id`.
   - If not entitled, checks `subscriptions` where `user_id = req.user.id AND status = 'active'`.
   - If neither exists, returns `HTTP 403 Forbidden` with purchase/subscription link.
   - If entitled, fetches page records via Service-Role client, converts Cloudinary public IDs into signed, time-limited delivery URLs, and returns page sequence.

### 2.2 Marketplace & Checkout Orchestration (`POST /api/orders/checkout`)
Express guarantees financial and inventory integrity:
1. **Server-Side Price Recalculation**: Fetches products by ID from PostgreSQL. Completely ignores any client-sent price values.
2. **Inventory Lock**: For physical items (`is_digital === false`), checks `stock_count >= quantity`.
3. **Idempotency Key**: Prevents duplicate double-charges via `X-Idempotency-Key` header.
4. **Order Record**: Inserts order with `status = 'pending'`.
5. **Payment Provider Session**: Generates payment checkout session (e.g., Paymob/Stripe).
6. **Returns Checkout URL**: Redirects user to secure payment gateway.

### 2.3 Verified Payment Webhook Handler (`POST /api/webhooks/payment`)
1. Verifies cryptographic HMAC-SHA256 signature from provider headers.
2. Reads transaction status and matched internal `order_id`.
3. Atomically:
   - Updates order status to `'paid'`.
   - Decrements stock for physical items.
   - Inserts `entitlements` records for all digital comics/stories in the order.
   - Writes immutable entry to `audit_logs`.

### 2.4 Writer vs. Publisher Business Constraints
```typescript
export function enforcePublisherRules(req: Request, res: Response, next: NextFunction) {
  const { is_digital } = req.body;
  if (req.user?.role === 'writer' && is_digital === false) {
    return res.status(403).json({
      error: 'قيود الدور: الكُتّاب مصرح لهم بنشر القصص والكتب الإلكترونية الرقمية فقط. نشر المنتجات الملموسة مقتصر على دور النشر والشركاء الرسميين.',
      code: 'WRITER_DIGITAL_ONLY'
    });
  }
  next();
}
```

### 2.5 Cloudinary Signed Upload Authorization (`POST /api/media/sign-upload`)
Express computes and returns signed upload parameters:
```typescript
import { v2 as cloudinary } from 'cloudinary';

router.post('/media/sign-upload', requireAuth, (req, res) => {
  const { folder, resource_type = 'image' } = req.body;
  
  // Authorize folder based on user role
  if (folder.startsWith('covers') && !['writer', 'publishing_house', 'admin'].includes(req.user!.role)) {
    return res.status(403).json({ error: 'غير مصرح برفع أغلفة الكتب' });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder: `hekayaty/${folder}`,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return res.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: `hekayaty/${folder}`,
  });
});
```
