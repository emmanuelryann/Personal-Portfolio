import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: isPDF ? 'portfolio/docs' : 'portfolio/uploads',
      allowed_formats: isPDF ? ['pdf'] : ['jpg', 'png', 'gif', 'webp'],
      public_id: `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}`,
      resource_type: isPDF ? 'image' : 'image',
    };
  },
});

export default cloudinary;
