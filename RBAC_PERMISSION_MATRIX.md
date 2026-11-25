# HEKAYATY (حكاياتي) — RBAC PERMISSION MATRIX

## 1. Role Definitions

| Role | Code | Description |
| :--- | :--- | :--- |
| **Reader** | `reader` | Standard platform user. Reads free comics/stories, purchases subscriptions or individual issues, tracks reading progress, saves favorites, creates personal collections, participates in card showcase. |
| **Writer** | `writer` | Creative author. Has permission to author and submit **digital e-books and illustrated stories only**. **Strictly prohibited** from publishing or handling physical merchandise or physical comics. |
| **Publishing House** | `publishing_house` | Certified publishing partner (e.g. استوديو مدارات). Permitted to publish both **digital comics/stories and physical book catalog items**, manage physical stock levels, and view distribution metrics. |
| **Admin** | `admin` | Internal platform governance. Full oversight over user roles, content moderation, billing audits, catalog pricing, and system parameters. |

---

## 2. Granular Permissions Matrix

| Resource / Action | Reader | Writer | Publishing House | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Read Public Content (Worlds, Characters, Lore)** | ✅ | ✅ | ✅ | ✅ |
| **Read Free Comics & Stories** | ✅ | ✅ | ✅ | ✅ |
| **Read Paid Content (with Entitlement/Subscription)** | ✅ | ✅ | ✅ | ✅ |
| **Track Reading Progress & Favorites** | ✅ | ✅ | ✅ | ✅ |
| **Create & Edit Own Reading Collections** | ✅ | ✅ | ✅ | ✅ |
| **Purchase Comics, Cards, Subscriptions** | ✅ | ✅ | ✅ | ✅ |
| **Submit New E-Book / Digital Story** | ❌ | ✅ | ✅ | ✅ |
| **Submit / Manage Physical Products** | ❌ | ❌ *(Strict Constraint)* | ✅ | ✅ |
| **Publish Official Collaboration Comics** | ❌ | ❌ | ✅ | ✅ |
| **Update Physical Product Inventory Counts** | ❌ | ❌ | ✅ | ✅ |
| **Manage User Roles & Bans** | ❌ | ❌ | ❌ | ✅ |
| **View Financial Ledger & Platform Revenue** | ❌ | ❌ | Partner Scope Only | ✅ |
| **View System Audit Logs** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Server Enforcement Implementation

RBAC is enforced via centralized Express middleware `requireRole(roles: UserRole[])`:

```typescript
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح: يجب تسجيل الدخول' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء',
        requiredRoles: allowedRoles 
      });
    }
    next();
  };
}
```

### Domain Rule: Writer Physical Product Lockout
```typescript
if (req.user.role === 'writer' && req.body.isDigital === false) {
  return res.status(403).json({
    error: 'قيود الدور: الكُتّاب مسموح لهم بنشر المحتوى الرقمي والكتب الإلكترونية فقط. نشر المنتجات الملموسة مخصص لدور النشر والشركاء الرسميين.'
  });
}
```
