import { Router, type IRouter } from 'express';
import { requireAuth, createSessionToken } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://naxqsbyupqrljciubvyx.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDMxNzYsImV4cCI6MjExMDgxOTE3Nn0.BaRd-HZPjx0DrowZ_hBuCOyY2sJ-B9iteSGdJNFU9NM';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const router: IRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: 'جميع الحقول مطلوبة: البريد الإلكتروني، كلمة المرور، والاسم الكامل',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        error: 'صيغة البريد الإلكتروني غير صالحة',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'يجب ألا تقل كلمة المرور عن 8 خانات وتحتوي على مزيج من الأحرف والأرقام',
      });
    }

    // Role Enforcement: Public registration CANNOT grant 'admin'
    const allowedRegistrationRoles = ['reader', 'writer', 'publishing_house'];
    const assignedRole = allowedRegistrationRoles.includes(role) ? role : 'reader';

    // 1. Create User in Supabase Auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        displayName: displayName.trim(),
        role: assignedRole,
      },
    });

    if (createError) {
      if (
        createError.message?.toLowerCase().includes('already') ||
        (createError as any).status === 422 ||
        (createError as any).code === '23505'
      ) {
        return res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل في منصة حكاياتي' });
      }
      return res.status(400).json({ error: createError.message || 'فشل إنشاء الحساب في نظام التوثيق' });
    }

    const userId = createData.user.id;

    // 2. Ensure Profile in public.profiles table
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      display_name: displayName.trim(),
      role: assignedRole,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    // 3. Obtain real session token via Supabase Anon client
    await supabaseAnon.auth.signInWithPassword({
      email: cleanEmail,
      password,
    }).catch(() => {});

    // Generate persistent 90-day signed session token
    const token = createSessionToken(userId, 90);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        id: userId,
        email: cleanEmail,
        displayName: displayName.trim(),
        role: assignedRole,
      },
      token,
      message: 'تم إنشاء حسابك بنجاح في حكاياتي! مرحباً بك.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ غير متوقع أثناء معالجة التسجيل' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Authenticate with Supabase
    const { data: signData, error: signError } = await supabaseAnon.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signError || !signData?.user || !signData?.session) {
      return res.status(401).json({
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    const u = signData.user;

    // Fetch verified profile from public.profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .maybeSingle();

    if (profile && profile.is_active === false) {
      return res.status(403).json({
        error: 'تم تعطيل هذا الحساب. يرجى التواصل مع إدارة حكاياتي للاستفسار.',
      });
    }

    // Update last_login_at
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', u.id);

    // Generate persistent 90-day signed session token
    const token = createSessionToken(u.id, 90);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    const userPayload = {
      id: u.id,
      email: u.email || cleanEmail,
      displayName: profile?.display_name || u.user_metadata?.displayName || u.email?.split('@')[0],
      role: profile?.role || u.user_metadata?.role || 'reader',
      avatarUrl: profile?.avatar_url || null,
      bio: profile?.bio || null,
    };

    return res.json({
      user: userPayload,
      token,
      message: 'تم تسجيل الدخول بنجاح، مرحباً بك مجدداً!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تسجيل الدخول' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.json({
      user: null,
      isAuthenticated: false,
    });
  }

  try {
    // Check subscription status in Supabase
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*, subscription_plans(name_ar)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .maybeSingle();

    return res.json({
      user: req.user,
      isAuthenticated: true,
      subscription: sub
        ? {
            status: sub.status,
            planName: sub.subscription_plans?.name_ar || 'اشتراك حكاياتي بلس',
            currentPeriodEnd: sub.current_period_end,
          }
        : null,
    });
  } catch {
    return res.json({
      user: req.user,
      isAuthenticated: true,
      subscription: null,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('session_token');
    if (req.sessionToken) {
      await supabaseAnon.auth.signOut();
    }
    return res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: 'خطأ أثناء تسجيل الخروج' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'يرجى تزويد البريد الإلكتروني' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const origin = req.headers.origin || 'http://localhost:3000';

    await supabaseAnon.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/reset-password`,
    });

    return res.json({
      message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى تعليمات استعادة كلمة المرور عبر بريدك.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'تعذر إرسال طلب استعادة كلمة المرور' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { newPassword, accessToken } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 8 خانات' });
    }

    const token = accessToken || req.cookies?.['session_token'];
    if (!token) {
      return res.status(401).json({ error: 'جلسة إعادة التعيين غير صالحة أو منتهية، يرجى إعادة الطلب' });
    }

    // Update password with token
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      return res.status(400).json({ error: error.message || 'فشل تحديث كلمة المرور' });
    }

    return res.json({ message: 'تم تعيين كلمة المرور الجديدة بنجاح. يمكنك الآن تسجيل الدخول بها.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إعادة تعيين كلمة المرور' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/change-password (Authenticated User)
// ---------------------------------------------------------------------------
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 8 خانات' });
    }

    // Verify current password by signing in
    const { error: verifyError } = await supabaseAnon.auth.signInWithPassword({
      email: req.user!.email,
      password: currentPassword,
    });

    if (verifyError) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }

    // Update to new password via admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(req.user!.id, {
      password: newPassword,
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message || 'فشل تحديث كلمة المرور' });
    }

    return res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تغيير كلمة المرور' });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/auth/profile (Update Profile Info)
// ---------------------------------------------------------------------------
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName, bio, avatarUrl } = req.body;
    const userId = req.user!.id;

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (displayName && typeof displayName === 'string') {
      updates.display_name = displayName.trim();
    }
    if (bio !== undefined) {
      updates.bio = bio;
    }
    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl;
    }

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message || 'فشل تحديث الملف الشخصي' });
    }

    return res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        displayName: updatedProfile.display_name,
        role: updatedProfile.role,
        avatarUrl: updatedProfile.avatar_url,
        bio: updatedProfile.bio,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحديث الملف الشخصي' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/auth/account (Deactivate Account)
// ---------------------------------------------------------------------------
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Soft delete / deactivate in public.profiles
    await supabaseAdmin
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    res.clearCookie('session_token');
    return res.json({ message: 'تم تعطيل الحساب بنجاح. نأسف لمغادرتك عوالم حكاياتي.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تعطيل الحساب' });
  }
});

export default router;
