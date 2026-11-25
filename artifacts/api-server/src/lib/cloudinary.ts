import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'x2f63nf1',
  api_key: process.env.CLOUDINARY_API_KEY || '813327926331626',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TioPFn21jFmzOHKh-AJpT43ucZQ',
  secure: true,
});

export { cloudinary };
