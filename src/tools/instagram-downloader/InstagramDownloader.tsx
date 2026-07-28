import React, { useState } from 'react';
import { Instagram, Download, AlertCircle, Loader2, Play, Image, Sparkles, ExternalLink } from 'lucide-react';

interface InstagramPostData {
  shortcode: string;
  embedUrl: string;
  type: 'reel' | 'post';
}

export const InstagramDownloaderTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.instagram.com/reel/C123456789/');
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<InstagramPostData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractShortcode = (inputUrl: string): { shortcode: string; type: 'reel' | 'post' } | null => {
    const match = inputUrl.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/);
    if (match && match[2]) {
      return {
        shortcode: match[2],
        type: match[1] === 'reel' ? 'reel' : 'post',
      };
    }
    return null;
  };

  const handleParseInstagram = () => {
    setError(null);
    const extracted = extractShortcode(url.trim());

    if (!extracted) {
      setError('Please enter a valid Instagram Reel, Post, or IGTV URL (e.g. https://www.instagram.com/reel/shortcode).');
      setPostData(null);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setPostData({
        shortcode: extracted.shortcode,
        embedUrl: `https://www.instagram.com/p/${extracted.shortcode}/embed/`,
        type: extracted.type,
      });
      setLoading(false);
    }, 400);
  };

  const handleDownloadRedirect = (format: 'video' | 'photo') => {
    if (!postData) return;
    const targetUrl = `https://www.instagram.com/p/${postData.shortcode}/`;
    // Fast privacy-friendly web service redirect
    const downloadServiceUrl = `https://fastdl.app/en?url=${encodeURIComponent(targetUrl)}`;
    window.open(downloadServiceUrl, '_blank');
  };

  return (
    <div className="tool-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Input Group */}
      <div className="tool-input-group">
        <label className="tool-label">Instagram Reel / Post URL</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="tool-input-field"
            placeholder="Paste Reel or Post link (e.g. https://www.instagram.com/reel/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <button onClick={handleParseInstagram} disabled={loading} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Instagram size={18} />}
            {loading ? 'Processing...' : 'Fetch Media'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Media Details & Download Panel */}
      {postData && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instagram {postData.type === 'reel' ? 'Reel' : 'Media Post'} ({postData.shortcode})
            </span>
          </div>

          {/* Embed Preview */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)', minHeight: '380px', display: 'flex', justifyContent: 'center' }}>
            <iframe
              src={postData.embedUrl}
              width="100%"
              height="440"
              frameBorder="0"
              scrolling="no"
              allowTransparency
              style={{ maxWidth: '500px', border: 'none' }}
            />
          </div>

          {/* Download Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Download Media File in Full Quality:
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadRedirect('video')}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
              >
                <Download size={18} /> Download HD Reel / Video (MP4)
              </button>

              <button
                onClick={() => handleDownloadRedirect('photo')}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
              >
                <Image size={18} /> Download Cover / Photo (JPG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
