# HEKAYATY (حكاياتي) — OFFICIAL SECURITY REQUIREMENTS SPECIFICATION

This specification outlines the non-negotiable security controls across the hybrid architecture.

---

## 1. Zero Trust & Authoritative Validation

1. **Client Price Disregard**: Express and Supabase database functions must never accept prices, totals, or discounts provided by the client. Prices are retrieved strictly from `public.products` or `public.comics`.
2. **Client Role Disregard**: The user's role (`reader`, `writer`, `publishing_house`, `admin`) is derived solely from the cryptographically verified JWT issued by Supabase Auth and the corresponding record in `public.profiles`.
3. **Entitlement Verification Before Delivery**: Protected comic pages and premium story chapters are never served unless Express verifies that `is_free === true` or a valid record exists in `public.entitlements` or `public.subscriptions`.

---

## 2. Credential & Environment Variable Segregation

| Secret / Credential | Safe Location | Strictly Prohibited Location |
| :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Express backend `.env` | Frontend codebase or git repository |
| `CLOUDINARY_API_SECRET` | Express backend `.env` | Frontend codebase or git repository |
| `PAYMENT_WEBHOOK_SECRET` | Express backend `.env` | Frontend codebase or git repository |
| `SUPABASE_JWT_SECRET` | Express backend `.env` | Frontend codebase or git repository |
| `VITE_SUPABASE_URL` | Frontend & Express `.env` | OK (Public parameter) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Express `.env` | OK (Safe with RLS enabled) |
| `VITE_CLOUDINARY_CLOUD_NAME`| Frontend & Express `.env` | OK (Public identifier) |

---

## 3. Cryptographic Verification & Signatures

### 3.1 Webhook Verification (HMAC-SHA256)
All inbound payment and external integration webhooks must be verified using the raw request body before JSON parsing:
```typescript
const computedSignature = crypto
  .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET!)
  .update(rawBody)
  .digest('hex');

const signatureMatch = crypto.timingSafeEqual(
  Buffer.from(signatureHeader, 'hex'),
  Buffer.from(computedSignature, 'hex')
);

if (!signatureMatch) {
  return res.status(401).json({ error: 'توقيع الويب هوك غير صالح' });
}
```

### 3.2 Cloudinary Upload Signature Verification
Upload signatures are generated server-side using SHA-1 HMAC over sorted parameter strings with a maximum 10-minute expiry window (`timestamp`).

---

## 4. Row-Level Security (RLS) Enforcement

- All 18 tables in `public` have RLS explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Anonymous access (`anon`) is restricted exclusively to public `SELECT` queries on approved lore and published comics.
- Mutations (`INSERT`, `UPDATE`, `DELETE`) on core entities require either `auth.uid() = user_id` or explicit `service_role` authorization.
- Self-role escalation is prevented by trigger and RLS `CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()))`.
