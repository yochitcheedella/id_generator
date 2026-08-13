// Public Share Page
// In a serverless/SSR environment like Vercel, the HTML is sent from the server with OG tags.
// This client-side page just shows a clean fallback preview and a CTA to create your own.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export function Share() {
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we're on the client, we might not have the image URL in state if we navigated here directly.
    // The server injects the OG tags, but we also want to display it.
    // In a real SSR app (Next.js/Remix), this would be simpler.
    // For this SPA, we'll try to parse the meta tag that the server injected.

    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage && ogImage.startsWith('http')) {
      setImageUrl(ogImage);
    } else {
      // In development or if meta tag parsing fails, we could fetch the share data.
      // For this build, we'll just show the CTA if we can't find it.
      // Usually, the SSR server will render this directly.
      if (id) {
        fetch(`/api/share/${id}?json=true`)
          .then(res => res.json())
          .then(data => {
            if (data.imageUrl) setImageUrl(data.imageUrl);
            else setError(true);
          })
          .catch(() => setError(true));
      }
    }
  }, [id]);

  return (
    <div className="share-page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="HH Goa 2026 Graphic" 
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} 
            />
            <div style={{ marginTop: '32px' }}>
              <Link to="/" className="btn btn-primary btn-lg">
                Create Your Own Frame
              </Link>
            </div>
          </>
        ) : error ? (
          <div style={{ padding: '60px 20px', background: 'var(--color-surface)', borderRadius: '12px' }}>
            <h2>This share link has expired or doesn't exist.</h2>
            <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '24px' }}>
              Create a New Frame
            </Link>
          </div>
        ) : (
          <div className="spinner" />
        )}
      </div>
    </div>
  );
}
