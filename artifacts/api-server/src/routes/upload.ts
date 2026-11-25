import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth';
import { cloudinary } from '../lib/cloudinary';

const router: IRouter = Router();

// Upload an image via Base64 or remote URL
router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { image, folder = 'hekayaty' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data or URL is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: `hekayaty/${folder}`,
      resource_type: 'auto',
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
