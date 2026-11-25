import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';

const router: IRouter = Router();

// In-memory user state fallback for guests
const userProgressStore = new Map<string, any[]>();
const userFavoritesStore = new Map<string, any[]>();
const userCollectionsStore = new Map<string, any[]>();

// ---------------------------------------------------------------------------
// READING PROGRESS
// ---------------------------------------------------------------------------
router.get('/progress', async (req, res) => {
  try {
    if (req.user?.id) {
      const { data, error } = await supabaseAdmin
        .from('reading_progress')
        .select('*')
        .eq('user_id', req.user.id);

      if (!error && data) {
        return res.json(
          data.map((p) => ({
            contentType: p.content_type,
            contentId: p.content_id,
            progress: p.progress,
            isCompleted: p.is_completed,
            updatedAt: p.updated_at,
          }))
        );
      }
    }

    const userId = req.user?.id ? String(req.user.id) : 'guest';
    const list = userProgressStore.get(userId) || [];
    return res.json(list);
  } catch {
    return res.json([]);
  }
});

router.post('/progress', async (req, res) => {
  try {
    const { contentType, contentId, progress, isCompleted } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const entry = {
      contentType,
      contentId,
      progress: progress || 0,
      isCompleted: !!isCompleted,
      updatedAt: new Date().toISOString(),
    };

    if (req.user?.id) {
      await supabaseAdmin.from('reading_progress').upsert(
        {
          user_id: req.user.id,
          content_type: contentType,
          content_id: contentId,
          progress: progress || 0,
          is_completed: !!isCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,content_type,content_id' }
      );
    }

    const userId = req.user?.id ? String(req.user.id) : 'guest';
    let list = userProgressStore.get(userId) || [];
    const existingIdx = list.findIndex(
      (item) => item.contentType === contentType && item.contentId === contentId
    );

    if (existingIdx >= 0) {
      list[existingIdx] = entry;
    } else {
      list.push(entry);
    }

    userProgressStore.set(userId, list);
    return res.json({ success: true, entry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء حفظ التقدم' });
  }
});

// ---------------------------------------------------------------------------
// FAVORITES
// ---------------------------------------------------------------------------
router.get('/favorites', async (req, res) => {
  try {
    if (req.user?.id) {
      const { data, error } = await supabaseAdmin
        .from('favorites')
        .select('*')
        .eq('user_id', req.user.id);

      if (!error && data) {
        return res.json(
          data.map((f) => ({
            id: f.content_id,
            contentType: f.content_type,
            contentId: f.content_id,
            createdAt: f.created_at,
          }))
        );
      }
    }

    const userId = req.user?.id ? String(req.user.id) : 'guest';
    const favs = userFavoritesStore.get(userId) || [];
    return res.json(favs);
  } catch {
    return res.json([]);
  }
});

router.post('/favorites/toggle', async (req, res) => {
  try {
    const { contentType, contentId } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    if (req.user?.id) {
      const { data: existing } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();

      let favorited = false;
      if (existing) {
        await supabaseAdmin.from('favorites').delete().eq('id', existing.id);
      } else {
        await supabaseAdmin.from('favorites').insert({
          user_id: req.user.id,
          content_type: contentType,
          content_id: contentId,
        });
        favorited = true;
      }

      const { count } = await supabaseAdmin
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id);

      return res.json({ favorited, count: count || 0 });
    }

    const userId = 'guest';
    let favs = userFavoritesStore.get(userId) || [];
    const index = favs.findIndex(
      (f) => f.contentType === contentType && f.contentId === contentId
    );

    let favorited = false;
    if (index >= 0) {
      favs.splice(index, 1);
    } else {
      favs.push({
        id: contentId,
        contentType,
        contentId,
        createdAt: new Date().toISOString(),
      });
      favorited = true;
    }

    userFavoritesStore.set(userId, favs);
    return res.json({ favorited, count: favs.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحديث المفضلة' });
  }
});

// ---------------------------------------------------------------------------
// COLLECTIONS
// ---------------------------------------------------------------------------
router.get('/collections', async (req, res) => {
  try {
    if (req.user?.id) {
      const { data, error } = await supabaseAdmin
        .from('collections')
        .select('*')
        .eq('user_id', req.user.id);

      if (!error && data && data.length > 0) {
        return res.json(
          data.map((c) => ({
            id: c.id,
            nameAr: c.name_ar,
            contentIds: c.content_ids || [],
            itemsCount: (c.content_ids || []).length,
            createdAt: c.created_at,
          }))
        );
      }
    }

    const userId = req.user?.id ? String(req.user.id) : 'guest';
    const cols = userCollectionsStore.get(userId) || [];
    return res.json(cols);
  } catch {
    return res.json([]);
  }
});

router.post('/collections', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { nameAr, contentIds } = req.body;

    if (!nameAr) {
      return res.status(400).json({ error: 'اسم المجموعة مطلوب' });
    }

    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: userId,
        name_ar: nameAr,
        content_ids: contentIds || [],
        is_public: false,
      })
      .select()
      .single();

    if (!error && data) {
      return res.status(201).json({
        success: true,
        collection: {
          id: data.id,
          nameAr: data.name_ar,
          contentIds: data.content_ids || [],
          createdAt: data.created_at,
        },
      });
    }

    let cols = userCollectionsStore.get(String(userId)) || [];
    const newCol = {
      id: cols.length + 1,
      nameAr,
      contentIds: contentIds || [],
      createdAt: new Date().toISOString(),
    };
    cols.push(newCol);
    userCollectionsStore.set(String(userId), cols);

    return res.status(201).json({ success: true, collection: newCol });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إنشاء المجموعة' });
  }
});

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
router.get('/notifications', async (req, res) => {
  try {
    if (req.user?.id) {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json(
          data.map((n) => ({
            id: n.id,
            titleAr: n.title_ar,
            bodyAr: n.body_ar,
            linkUrl: n.link_url,
            isRead: n.is_read,
            createdAt: n.created_at,
          }))
        );
      }
    }

    return res.json([]);
  } catch {
    return res.json([]);
  }
});

router.post('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    if (req.user?.id) {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'فشل في تحديث الإشعارات' });
  }
});

router.post('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', req.user.id);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'فشل في تحديث الإشعار' });
  }
});

export default router;
