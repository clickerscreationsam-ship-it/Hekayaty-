import { Router, type IRouter } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { isDraft } from '../lib/publicationStatus';

const router: IRouter = Router();

// In-memory analytics for share tracking
interface ShareRecord {
  platform: string;
  contentType: string;
  contentId: string;
  url: string;
  timestamp: string;
}

const shareAnalytics: ShareRecord[] = [];

/**
 * Dynamic XML Sitemap
 * Route: GET /api/seo/sitemap.xml
 */
router.get('/seo/sitemap.xml', async (_req, res) => {
  try {
    const baseUrl = 'https://hekayaty.com';
    const now = new Date().toISOString().split('T')[0];

    // Fetch published entities in parallel
    const [comicsRes, storiesRes, charactersRes, worldsRes] = await Promise.all([
      supabaseAdmin.from('comics').select('id, updated_at').limit(100),
      supabaseAdmin.from('stories').select('id, updated_at').limit(100),
      supabaseAdmin.from('characters').select('id, updated_at').limit(100),
      supabaseAdmin.from('worlds').select('id, updated_at').limit(100),
    ]);

    const comics = (comicsRes.data || []).filter((c) => !isDraft(c.id));
    const stories = (storiesRes.data || []).filter((s) => !isDraft(s.id));
    const characters = charactersRes.data || [];
    const worlds = worldsRes.data || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Core Static Portals -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />
  </url>
  <url><loc>${baseUrl}/comics</loc><lastmod>${now}</lastmod><priority>0.9</priority></url>
  <url><loc>${baseUrl}/stories</loc><lastmod>${now}</lastmod><priority>0.9</priority></url>
  <url><loc>${baseUrl}/characters</loc><lastmod>${now}</lastmod><priority>0.85</priority></url>
  <url><loc>${baseUrl}/worlds</loc><lastmod>${now}</lastmod><priority>0.85</priority></url>
  <url><loc>${baseUrl}/timeline</loc><lastmod>${now}</lastmod><priority>0.8</priority></url>
  <url><loc>${baseUrl}/encyclopedia</loc><lastmod>${now}</lastmod><priority>0.8</priority></url>
  <url><loc>${baseUrl}/news</loc><lastmod>${now}</lastmod><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events</loc><lastmod>${now}</lastmod><priority>0.75</priority></url>
  <url><loc>${baseUrl}/selected</loc><lastmod>${now}</lastmod><priority>0.75</priority></url>
`;

    // Dynamic Stories
    for (const s of stories) {
      const date = (s.updated_at || now).split('T')[0];
      xml += `  <url><loc>${baseUrl}/stories/${s.id}</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>\n`;
    }

    // Dynamic Comics
    for (const c of comics) {
      const date = (c.updated_at || now).split('T')[0];
      xml += `  <url><loc>${baseUrl}/comics/${c.id}</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>\n`;
    }

    // Dynamic Characters
    for (const ch of characters) {
      const date = (ch.updated_at || now).split('T')[0];
      xml += `  <url><loc>${baseUrl}/characters/${ch.id}</loc><lastmod>${date}</lastmod><priority>0.75</priority></url>\n`;
    }

    // Dynamic Worlds
    for (const w of worlds) {
      const date = (w.updated_at || now).split('T')[0];
      xml += `  <url><loc>${baseUrl}/worlds/${w.id}</loc><lastmod>${date}</lastmod><priority>0.75</priority></url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=14400');
    return res.send(xml);
  } catch (err: any) {
    return res.status(500).send(`<!-- Error generating sitemap: ${err.message} -->`);
  }
});

/**
 * Dynamic SVG Social Card Renderer (1200x630)
 * Route: GET /api/seo/og-card
 */
router.get('/seo/og-card', (req, res) => {
  const title = (req.query.title as string) || 'حكاياتي | HEKAYATY';
  const subtitle = (req.query.subtitle as string) || 'عوالم خيالية لا تنتهي • أدب وروايات رقمية غامرة';
  const tag = (req.query.tag as string) || 'HEKAYATY ORIGINALS';

  // Sanitize for XML
  const cleanTitle = title.replace(/[<>&"]/g, '');
  const cleanSubtitle = subtitle.replace(/[<>&"]/g, '');
  const cleanTag = tag.replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E131F" />
      <stop offset="60%" stop-color="#111C2B" />
      <stop offset="100%" stop-color="#070B14" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE08B" />
      <stop offset="50%" stop-color="#E1C58B" />
      <stop offset="100%" stop-color="#C5A15B" />
    </linearGradient>
    <linearGradient id="teal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#087C7B" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Ambient Light Orbs -->
  <circle cx="1050" cy="120" r="280" fill="url(#gold)" opacity="0.12" filter="url(#glow)" />
  <circle cx="150" cy="520" r="320" fill="url(#teal)" opacity="0.16" filter="url(#glow)" />

  <!-- Decorative Outer Border -->
  <rect x="24" y="24" width="1152" height="582" rx="32" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.3" />

  <!-- Feather Quill Logo -->
  <g transform="translate(100, 100) scale(0.65)">
    <rect width="120" height="120" rx="28" fill="#152238" stroke="url(#gold)" stroke-width="2" />
    <path d="M60,15 C75,25 88,45 88,72 C88,82 82,92 78,97 C80,90 79,80 75,71 C73,66 69,60 66,56 C70,50 73,41 72,35 C67,42 63,48 60,55 Z" fill="url(#gold)" />
    <path d="M60,15 C48,27 35,47 35,73 C35,84 40,95 46,100 C42,92 43,82 47,72 C51,62 55,56 60,50 C56,44 52,35 53,30 C56,35 58,42 60,47 Z" fill="url(#teal)" />
    <path d="M60,12 L59,102 L60,110 L61,102 Z" fill="#FFF4D4" />
  </g>

  <!-- Brand Typography -->
  <text x="200" y="145" font-family="'Cinzel', serif, sans-serif" font-size="34" font-weight="900" fill="#E1C58B" letter-spacing="4">HEKAYATY</text>
  <text x="200" y="180" font-family="'Tajawal', 'Amiri', sans-serif" font-size="18" font-weight="bold" fill="#087C7B" letter-spacing="3">حِــكَــايَــاتِــي • الأكوان القصصية</text>

  <!-- Content Pill Tag -->
  <rect x="100" y="250" width="220" height="42" rx="21" fill="#087C7B" fill-opacity="0.25" stroke="#087C7B" stroke-width="1.5" />
  <text x="210" y="277" font-family="'Tajawal', sans-serif" font-size="14" font-weight="bold" fill="#5EEAD4" text-anchor="middle">${cleanTag}</text>

  <!-- Title (Arabic RTL Friendly) -->
  <text x="100" y="380" font-family="'Tajawal', 'Amiri', sans-serif" font-size="52" font-weight="bold" fill="#FFFFFF">${cleanTitle}</text>

  <!-- Subtitle / Excerpt -->
  <text x="100" y="440" font-family="'Tajawal', sans-serif" font-size="24" fill="#D1D5DB">${cleanSubtitle}</text>

  <!-- Bottom CTA Badge -->
  <line x1="100" y1="510" x2="1100" y2="510" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
  <text x="100" y="555" font-family="'Tajawal', sans-serif" font-size="18" fill="#C5A15B" font-weight="bold">✦ اقرأ الرواية والكوميكس الآن على hekayaty.com</text>
  <text x="1100" y="555" font-family="'Cinzel', sans-serif" font-size="16" fill="#9CA3AF" text-anchor="end">Official Literary Universe</text>
</svg>`;

  res.header('Content-Type', 'image/svg+xml');
  res.header('Cache-Control', 'public, max-age=86400');
  return res.send(svg);
});

/**
 * Share Analytics Tracking Endpoint
 * Route: POST /api/events/share
 */
router.post('/events/share', (req, res) => {
  const { platform, content_type, content_id, url } = req.body;
  const record: ShareRecord = {
    platform: platform || 'copy_link',
    contentType: content_type || 'general',
    contentId: content_id || '',
    url: url || '',
    timestamp: new Date().toISOString(),
  };

  shareAnalytics.unshift(record);
  if (shareAnalytics.length > 500) shareAnalytics.pop();

  return res.json({ success: true, count: shareAnalytics.length });
});

/**
 * Get Share Analytics (For Admin Dashboard)
 * Route: GET /api/admin/share-analytics
 */
router.get('/admin/share-analytics', (_req, res) => {
  const totalShares = shareAnalytics.length;
  const byPlatform: Record<string, number> = {};
  for (const item of shareAnalytics) {
    byPlatform[item.platform] = (byPlatform[item.platform] || 0) + 1;
  }

  return res.json({
    totalShares,
    byPlatform,
    recent: shareAnalytics.slice(0, 20),
  });
});

export default router;
