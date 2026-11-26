import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth';
import { uploadRateLimiter } from '../middlewares/rateLimiter';
import { cloudinary } from '../lib/cloudinary';

const router: IRouter = Router();

// SSRF prevention: disallow internal network ranges
function isSsrfSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Upload an image via Base64 or validated remote URL
router.post('/upload', requireAuth, uploadRateLimiter, async (req, res) => {
  try {
    const { image, folder = 'hekayaty' } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data or URL is required' });
    }

    // Input Validation & Path Traversal Prevention
    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'hekayaty';

    // Validate payload type and prevent dangerous formats
    if (image.startsWith('data:')) {
      const mimeMatch = image.match(/^data:([a-zA-Z0-9\/+-]+);base64,/);
      if (!mimeMatch) {
        return res.status(400).json({ error: 'صيغة Base64 غير صالحة' });
      }
      const mime = mimeMatch[1].toLowerCase();
      const safeMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'];
      if (!safeMimes.includes(mime)) {
        return res.status(400).json({ error: 'نوع الملف غير مدعوم. الأنواع المسموحة: JPG, PNG, WEBP, GIF, PDF' });
      }
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      if (!isSsrfSafeUrl(image)) {
        return res.status(400).json({ error: 'الرابط المقدم غير مسموح به لأسباب أمنية (SSRF Protection)' });
      }
    } else {
      return res.status(400).json({ error: 'يجب توفير صورة بصيغة Base64 مشفرة أو رابط خارجي آمن' });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: `hekayaty/${safeFolder}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'webp', 'gif', 'pdf', 'jpeg'],
    });

    return res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload media to Cloudinary' });
  }
});

// Provide signature for direct client-side upload
router.get('/upload/signature', requireAuth, (_req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'hekayaty' },
      process.env.CLOUDINARY_API_SECRET || 'TioPFn21jFmzOHKh-AJpT43ucZQ'
    );

    return res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'x2f63nf1',
      apiKey: process.env.CLOUDINARY_API_KEY || '813327926331626',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
