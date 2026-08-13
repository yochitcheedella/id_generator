import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel config: disable default body parser to handle multipart formData
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const bucket = process.env.SUPABASE_BUCKET || 'hh-goa-generated';

// A simple in-memory rate limiter for serverless (very naive, usually use Redis)
// For Vercel free tier, instances spin down, but it stops rapid abuse per instance.
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Rate Limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rl = rateLimits.get(ip as string) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > rl.resetAt) {
    rl.count = 0;
    rl.resetAt = now + WINDOW_MS;
  }
  rl.count++;
  rateLimits.set(ip as string, rl);

  if (rl.count > MAX_REQUESTS) {
    return res.status(429).json({ success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' });
  }

  // Ensure storage is configured
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      success: false, 
      code: 'STORAGE_ERROR', 
      message: 'Storage backend is not configured on this server.' 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse form
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit for generated image
      multiples: false,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const imageFileArray = files.image;
    if (!imageFileArray) {
      return res.status(400).json({ success: false, message: 'Missing image file' });
    }
    const imageFile = Array.isArray(imageFileArray) ? imageFileArray[0] : imageFileArray;

    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ success: false, message: 'Invalid image file' });
    }

    // Validate MIME type
    const mime = imageFile.mimetype || '';
    if (mime !== 'image/png' && mime !== 'image/jpeg') {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PNG or JPEG allowed.' });
    }

    // Upload to Supabase Storage
    const ext = mime === 'image/jpeg' ? 'jpg' : 'png';
    const shareId = uuidv4();
    const objectKey = `${shareId}.${ext}`;

    const fileData = fs.readFileSync(imageFile.filepath);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(objectKey, fileData, {
        contentType: mime,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ success: false, code: 'STORAGE_ERROR', message: 'Failed to save image to storage.' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(objectKey);

    const imageUrl = publicUrlData.publicUrl;
    
    // Determine base URL
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = process.env.VITE_APP_BASE_URL || `${protocol}://${host}`;

    const shareUrl = `${baseUrl}/share/${shareId}`;

    return res.status(201).json({
      success: true,
      shareId,
      shareUrl,
      imageUrl,
    });

  } catch (error: any) {
    console.error('Share API Error:', error);
    if (error.code === 1009) { // formidable max file size exceeded
      return res.status(413).json({ success: false, code: 'TOO_LARGE', message: 'Image size exceeded maximum allowed limit.' });
    }
    return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'An unexpected error occurred.' });
  }
}
