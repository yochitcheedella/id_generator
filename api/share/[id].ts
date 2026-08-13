import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const bucket = process.env.SUPABASE_BUCKET || 'hh-goa-generated';

// Basic HTML template for the social preview
function renderHtml(imageUrl: string, baseUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HH Goa 2026</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="HH Goa 2026" />
  <meta name="description" content="My HH Goa 2026 frame" />
  <meta name="robots" content="noindex, nofollow" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}" />
  <meta property="og:title" content="HH Goa 2026" />
  <meta property="og:description" content="My HH Goa 2026 frame" />
  <meta property="og:image" content="${imageUrl}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${baseUrl}" />
  <meta name="twitter:title" content="HH Goa 2026" />
  <meta name="twitter:description" content="My HH Goa 2026 frame" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Redirect immediately to the app so actual users don't see this bare page -->
  <meta http-equiv="refresh" content="0; url=/?shared=true" />
</head>
<body style="background: #04101F; color: #fff; font-family: sans-serif; text-align: center; padding: 50px;">
  <img src="${imageUrl}" alt="HH Goa 2026 Graphic" style="max-width: 100%; border-radius: 12px;" />
  <p style="margin-top: 20px;">Redirecting...</p>
  <script>
    window.location.href = '/?shared=true';
  </script>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, json } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing share ID' });
  }

  // If storage is not configured, we can't resolve it
  if (!supabaseUrl || !supabaseKey) {
    if (json) return res.status(500).json({ error: 'Storage not configured' });
    return res.status(500).send('Storage not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // We don't know if it's .png or .jpg, so we just attempt to get public URL for both.
  // A cleaner way is to store metadata in a DB, but keeping it minimal:
  // Supabase getPublicUrl doesn't check if file exists, it just builds the URL.
  // We'll check if file exists by downloading its header or listing it.
  
  const { data, error } = await supabase.storage.from(bucket).list('', {
    search: id,
    limit: 1
  });

  if (error || !data || data.length === 0) {
    if (json) return res.status(404).json({ error: 'Not found or expired' });
    return res.status(404).send('Share link not found or expired.');
  }

  const fileInfo = data[0];
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileInfo.name);

  const imageUrl = publicUrlData.publicUrl;

  if (json) {
    return res.status(200).json({ imageUrl });
  }

  // Determine base URL
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = process.env.VITE_APP_BASE_URL || `${protocol}://${host}`;

  const html = renderHtml(imageUrl, `${baseUrl}/share/${id}`);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).send(html);
}
