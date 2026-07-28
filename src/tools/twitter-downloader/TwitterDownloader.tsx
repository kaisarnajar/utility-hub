import React, { useState } from 'react';
import { Twitter, Download, AlertCircle, Loader2, Play, Image, Sparkles } from 'lucide-react';

interface TwitterMedia {
  type: 'video' | 'photo' | 'animated_gif';
  previewUrl: string;
  variants?: { bitrate: number; content_type: string; url: string }[];
  photoUrl?: string;
}

interface TweetData {
  id: string;
  text: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  media: TwitterMedia[];
}

export const TwitterDownloaderTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://x.com/SpaceX/status/1715764491753906375');
  const [loading, setLoading] = useState<boolean>(false);
  const [tweetData, setTweetData] = useState<TweetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractTweetId = (inputUrl: string): string | null => {
    const match = inputUrl.match(/(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_]+)\/status\/([0-9]+)/);
    return match ? match[1] : null;
  };

  const handleFetchTweet = async () => {
    setError(null);
    const tweetId = extractTweetId(url.trim());
    if (!tweetId) {
      setError('Please enter a valid Twitter / X post URL (e.g. https://x.com/user/status/123456).');
      setTweetData(null);
      return;
    }

    setLoading(true);

    try {
      // Twitter public syndication API (CORS friendly)
      const res = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x`);
      if (!res.ok) throw new Error('Could not fetch post details.');

      const data = await res.json();

      const mediaItems: TwitterMedia[] = [];

      if (data.mediaDetails) {
        data.mediaDetails.forEach((item: any) => {
          if (item.type === 'video' || item.type === 'animated_gif') {
            const variants = item.video_info?.variants || [];
            // Filter mp4 variants and sort by bitrate descending
            const mp4Variants = variants
              .filter((v: any) => v.content_type === 'video/mp4')
              .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

            mediaItems.push({
              type: item.type,
              previewUrl: item.media_url_https,
              variants: mp4Variants,
            });
          } else if (item.type === 'photo') {
            mediaItems.push({
              type: 'photo',
              previewUrl: item.media_url_https,
              photoUrl: item.media_url_https,
            });
          }
        });
      }

      setTweetData({
        id: tweetId,
        text: data.text || '',
        authorName: data.user?.name || 'Twitter User',
        authorHandle: `@${data.user?.screen_name || 'user'}`,
        avatarUrl: data.user?.profile_image_url_https || '',
        media: mediaItems,
      });

      if (mediaItems.length === 0) {
        setError('This post does not contain any video or image media files to download.');
      }
    } catch (err: any) {
      // Fallback service link
      setError('Failed to load Twitter media directly. Click below to use fallback direct download.');
      setTweetData({
        id: tweetId,
        text: 'Twitter Post Media',
        authorName: 'X / Twitter Post',
        authorHandle: `@post`,
        avatarUrl: '',
        media: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileUrl: string, filename: string) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="tool-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Input Form */}
      <div className="tool-input-group">
        <label className="tool-label">Twitter / X Post URL</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="tool-input-field"
            placeholder="Paste URL (e.g. https://x.com/username/status/123456789)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <button onClick={handleFetchTweet} disabled={loading} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Twitter size={18} />}
            {loading ? 'Fetching...' : 'Fetch Media'}
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

      {/* Tweet Details & Media List */}
      {tweetData && (
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
          {/* Author Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {tweetData.avatarUrl && (
              <img
                src={tweetData.avatarUrl}
                alt={tweetData.authorName}
                style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)' }}
              />
            )}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{tweetData.authorName}</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tweetData.authorHandle}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{tweetData.text}</p>

          {/* Media Items */}
          {tweetData.media.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {item.type === 'photo' ? (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={item.photoUrl}
                    alt="Twitter photo"
                    style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                  />
                  <button
                    onClick={() => handleDownloadFile(item.photoUrl!, `twitter-photo-${tweetData.id}.jpg`)}
                    className="btn-primary"
                    style={{ marginTop: '0.85rem', width: '100%' }}
                  >
                    <Download size={16} /> Download Photo (HD)
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <img
                      src={item.previewUrl}
                      alt="Video preview"
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                    />
                  </div>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                    Select Video Resolution to Download:
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v, vIdx) => {
                        // Extract resolution from bitrate or label
                        const label = v.bitrate > 1000000 ? '720p HD' : v.bitrate > 500000 ? '480p SD' : '360p Low';
                        return (
                          <button
                            key={vIdx}
                            onClick={() => handleDownloadFile(v.url, `twitter-video-${tweetData.id}-${vIdx}.mp4`)}
                            className="btn-primary"
                            style={{ flex: 1, minWidth: '120px', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            <Download size={16} /> MP4 ({label})
                          </button>
                        );
                      })
                    ) : (
                      <button
                        onClick={() => window.open(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, '_blank')}
                        className="btn-primary"
                        style={{ width: '100%' }}
                      >
                        <Download size={16} /> Download MP4 Video
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* External Fallback helper if media is restricted */}
          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <button
              onClick={() => window.open(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, '_blank')}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              Open via TwitSave (External Fallback)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
