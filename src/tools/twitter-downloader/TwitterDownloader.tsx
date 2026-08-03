import React, { useState } from 'react';
import { Twitter, Download, AlertCircle, Loader2, Play, Image, Check, FileVideo } from 'lucide-react';

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
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const extractTweetId = (inputUrl: string): string | null => {
    const match = inputUrl.match(/(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_]+)\/status\/([0-9]+)/);
    return match ? match[1] : null;
  };

  const handleFetchTweet = async () => {
    setError(null);
    setDownloadSuccess(null);

    const tweetId = extractTweetId(url.trim());
    if (!tweetId) {
      setError('Please enter a valid Twitter / X post URL (e.g. https://x.com/username/status/123456789).');
      setTweetData(null);
      return;
    }

    setLoading(true);

    try {
      // Primary API: FxTwitter API (Handles all video formats, amplified media & URLs with /video/1)
      const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData.code === 200 && fxData.tweet) {
          const tweet = fxData.tweet;
          const mediaItems: TwitterMedia[] = [];

          if (tweet.media) {
            // Check video items
            if (tweet.media.videos && Array.isArray(tweet.media.videos)) {
              tweet.media.videos.forEach((v: any) => {
                const variants = (v.variants || v.formats || [])
                  .filter((item: any) => item.content_type === 'video/mp4' || item.container === 'mp4')
                  .map((item: any) => ({
                    bitrate: item.bitrate || 1000000,
                    content_type: 'video/mp4',
                    url: item.url,
                  }))
                  .sort((a: any, b: any) => b.bitrate - a.bitrate);

                if (variants.length === 0 && v.url) {
                  variants.push({ bitrate: 1000000, content_type: 'video/mp4', url: v.url });
                }

                mediaItems.push({
                  type: 'video',
                  previewUrl: v.thumbnail_url || v.url,
                  variants,
                });
              });
            }

            // Check photo items
            if (tweet.media.photos && Array.isArray(tweet.media.photos)) {
              tweet.media.photos.forEach((p: any) => {
                const pUrl = p.url || p;
                mediaItems.push({
                  type: 'photo',
                  previewUrl: pUrl,
                  photoUrl: pUrl,
                });
              });
            }
          }

          setTweetData({
            id: tweetId,
            text: tweet.text || 'Twitter / X Post',
            authorName: tweet.author?.name || 'X User',
            authorHandle: `@${tweet.author?.screen_name || 'user'}`,
            avatarUrl: tweet.author?.avatar_url || '',
            media: mediaItems,
          });

          if (mediaItems.length === 0) {
            setError('This Twitter post does not contain any video or image media files.');
          }
          setLoading(false);
          return;
        }
      }

      // Secondary Fallback API: Twitter Syndication
      const synRes = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x`);
      if (synRes.ok) {
        const data = await synRes.json();
        const mediaItems: TwitterMedia[] = [];

        if (data.mediaDetails && Array.isArray(data.mediaDetails)) {
          data.mediaDetails.forEach((item: any) => {
            if (item.type === 'video' || item.type === 'animated_gif') {
              const mp4Variants = (item.video_info?.variants || [])
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
          text: data.text || 'Twitter / X Post',
          authorName: data.user?.name || 'X User',
          authorHandle: `@${data.user?.screen_name || 'user'}`,
          avatarUrl: data.user?.profile_image_url_https || '',
          media: mediaItems,
        });

        if (mediaItems.length === 0) {
          setError('This Twitter post does not contain any video or image media files.');
        }
        setLoading(false);
        return;
      }

      throw new Error('Unable to fetch post media. Please check the URL and try again.');
    } catch (err: any) {
      setError(err.message || 'Failed to parse Twitter media.');
      setTweetData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileUrl: string, filename: string) => {
    setDownloadingFile(filename);
    setDownloadSuccess(null);

    try {
      // Attempt in-app CORS fetch blob
      const res = await fetch(fileUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Network fetch blocked');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(filename);
    } catch (e) {
      // Native browser trigger without navigating or opening external web pages
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filename;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(filename);
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className="tool-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
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

      {/* Tweet Details & In-App Media Downloader */}
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
                    style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                  />
                  <button
                    onClick={() => handleDownloadFile(item.photoUrl!, `twitter-photo-${tweetData.id}-${idx + 1}.jpg`)}
                    disabled={downloadingFile === `twitter-photo-${tweetData.id}-${idx + 1}.jpg`}
                    className="btn-primary"
                    style={{ marginTop: '0.85rem', width: '100%', justifyContent: 'center' }}
                  >
                    {downloadingFile === `twitter-photo-${tweetData.id}-${idx + 1}.jpg` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : downloadSuccess === `twitter-photo-${tweetData.id}-${idx + 1}.jpg` ? (
                      <Check size={16} color="#10b981" />
                    ) : (
                      <Image size={16} />
                    )}
                    {downloadingFile === `twitter-photo-${tweetData.id}-${idx + 1}.jpg`
                      ? 'Downloading Image...'
                      : downloadSuccess === `twitter-photo-${tweetData.id}-${idx + 1}.jpg`
                      ? 'Downloaded to Device!'
                      : 'Download High-Res Image'}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Embedded Video Player */}
                  {item.variants && item.variants.length > 0 && (
                    <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem' }}>
                      <video
                        src={item.variants[0].url}
                        controls
                        poster={item.previewUrl}
                        style={{ width: '100%', maxHeight: '350px', display: 'block' }}
                      />
                    </div>
                  )}

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                    Download Video Directly In-App (No Redirects):
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v, vIdx) => {
                        const label = v.bitrate > 1000000 ? '1080p / 720p HD' : v.bitrate > 500000 ? '480p SD' : '360p Mobile';
                        const fileName = `twitter-video-${tweetData.id}-${vIdx + 1}.mp4`;
                        const isDownloading = downloadingFile === fileName;
                        const isDone = downloadSuccess === fileName;

                        return (
                          <button
                            key={vIdx}
                            onClick={() => handleDownloadFile(v.url, fileName)}
                            disabled={isDownloading}
                            className="btn-primary"
                            style={{ flex: 1, minWidth: '130px', padding: '0.6rem 0.85rem', fontSize: '0.83rem', justifyContent: 'center' }}
                          >
                            {isDownloading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isDone ? (
                              <Check size={16} color="#10b981" />
                            ) : (
                              <FileVideo size={16} />
                            )}
                            {isDownloading ? 'Downloading...' : `MP4 (${label})`}
                          </button>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No downloadable video streams found for this post.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
