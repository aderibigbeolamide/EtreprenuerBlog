import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgsxskcmd',
  api_key: process.env.CLOUDINARY_API_KEY || '275965937962349',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YmzagfndSNtvT3ntNN42DnhxRyg',
});

// Configure multer for memory storage (files will be uploaded to Cloudinary directly)
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image' || file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image uploads'));
      }
    } else if (file.fieldname === 'video' || file.fieldname === 'videos') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video uploads'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

interface UploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  public_id?: string;
  transformation?: any[];
}

/**
 * Upload file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'auto' as const,
      folder: 'entrepreneurship-blog',
      use_filename: true,
      unique_filename: true,
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a readable stream from the buffer
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: Express.Multer.File[],
  options: UploadOptions = {}
): Promise<any[]> {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, {
      ...options,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.split('.')[0]}`
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width || 800,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    fetch_format: 'auto',
    ...options
  });
}

/**
 * Get video URL with transformations
 */
export function getOptimizedVideoUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width: options.width || 720,
    height: options.height,
    quality: options.quality || 'auto',
    format: options.format || 'mp4',
    ...options
  });
}

export { cloudinary };