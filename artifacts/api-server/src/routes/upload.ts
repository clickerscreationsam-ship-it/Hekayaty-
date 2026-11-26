import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth';
import { uploadRateLimiter } from '../middlewares/rateLimiter';
import { cloudinary } from '../lib/cloudinary';

const router: IRouter = Router();

// Strict Magic Bytes / File Signature Detector
function detectMagicMime(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // GIF: GIF87a or GIF89a (47 49 46 38 37 61 / 47 49 46 38 39 61)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // PDF: %PDF- (25 50 44 46 2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return 'application/pdf';
  }

  return null;
}

// Upload endpoint: strictly accepts Base64 encoded media only, rejecting external URLs to prevent SSRF
router.post('/upload', requireAuth, uploadRateLimiter, async (req, res) => {
  try {
    const { image, folder = 'hekayaty' } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required in Base64 data URI format' });
    }

    // SSRF Elimination: Disallow any remote URL string
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('//')) {
      return res.status(400).json({
        error: 'رفع الملفات عبر الروابط الخارجية غير مسموح به لأسباب أمنية. يرجى رفع الملف مباشرة بصيغة Base64 أو عبر التوقيع الرقمي المباشر.',
        code: 'REMOTE_FETCH_DISABLED',
      });
    }

    // Validate Base64 data URI format
    const match = image.match(/^data:([a-zA-Z0-9\/+-]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      return res.status(400).json({
        error: 'صيغة Base64 غير صالحة. يجب أن تبدأ بـ data:image/...;base64,',
        code: 'INVALID_BASE64_FORMAT',
      });
    }

    const declaredMime = match[1].toLowerCase();
    const base64Data = match[2];

    const safeMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!safeMimes.includes(declaredMime)) {
      return res.status(400).json({
        error: 'نوع الملف المعلن غير مدعوم. الأنواع المسموحة فقط: JPEG, PNG, WEBP, GIF, PDF',
        code: 'UNSUPPORTED_MIME_TYPE',
      });
    }

    // Decode to Buffer safely
    const buffer = Buffer.from(base64Data, 'base64');
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'محتوى الملف فارغ أو تعذر فك تشفيره' });
    }

    // Enforce size limits: Max 10MB for images, 25MB for PDF
    const maxSizeBytes = declaredMime === 'application/pdf' ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return res.status(400).json({
        error: `حجم الملف (${Math.round(buffer.length / 1024 / 1024)}MB) يتجاوز الحد المسموح به (${maxSizeBytes / 1024 / 1024}MB)`,
        code: 'FILE_TOO_LARGE',
      });
    }

    // Magic Bytes Verification
    const detectedMime = detectMagicMime(buffer);
    if (!detectedMime) {
      return res.status(400).json({
        error: 'فشل التحقق من التوقيع السحري للملف (Magic Bytes). الملف تالف أو غير صالح.',
        code: 'INVALID_FILE_SIGNATURE',
      });
    }

    // Verify declared MIME matches real binary signature
    if (declaredMime !== detectedMime) {
      return res.status(400).json({
        error: `تعارض أمني بين النوع المعلن (${declaredMime}) والتوقيع الفعلي للملف (${detectedMime})`,
        code: 'MIME_SPOOFING_DETECTED',
      });
    }

    // Sanitize destination folder to prevent path traversal
    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'hekayaty';

    // Upload to Cloudinary with verified MIME
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${detectedMime};base64,${base64Data}`,
      {
        folder: `hekayaty/${safeFolder}`,
        resource_type: detectedMime === 'application/pdf' ? 'raw' : 'image',
        allowed_formats: ['jpg', 'png', 'webp', 'gif', 'pdf', 'jpeg'],
      }
    );

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

// Provide signature for direct client-side upload to Cloudinary (authenticated & rate-limited)
router.get('/upload/signature', requireAuth, uploadRateLimiter, (_req, res) => {
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
