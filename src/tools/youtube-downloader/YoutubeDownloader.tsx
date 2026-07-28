import React, { useState } from 'react';
import { Youtube, Download, Image, Play, Check, AlertCircle, ExternalLink, Loader2, Sparkles } from 'lucide-react';

interface YoutubeVideoInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  thumbnails: { quality: string; resolution: string; url: string }[];
}

export const YoutubeDownloaderTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<YoutubeVideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const extractVideoId = (inputUrl: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = inputUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleParse = async () => {
    setError(null);
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setError('Please enter a valid YouTube video or Shorts URL.');
      setVideoInfo(null);
      return;
    }

    setLoading(true);

    try {
      // Fetch oEmbed metadata for title and author
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await res.json();

      const info: YoutubeVideoInfo = {
        videoId,
        title: data.title || 'YouTube Video',
        author: data.author_name || 'YouTube Channel',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        thumbnails: [
          { quality: 'Max Resolution (1080p)', resolution: '1920 x 1080', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
          { quality: 'Standard HD (720p)', resolution: '1280 x 720', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
          { quality: 'High Quality (480p)', resolution: '640 x 480', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
          { quality: 'Medium Quality (360p)', resolution: '320 x 180', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
        ],
      };

      setVideoInfo(info);
    } catch (err) {
      // Fallback info if noembed network request fails
      setVideoInfo({
        videoId,
        title: 'YouTube Video',
        author: 'YouTube Channel',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        thumbnails: [
          { quality: 'Max Resolution (1080p)', resolution: '1920 x 1080', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
          { quality: 'High Quality (480p)', resolution: '640 x 480', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadThumbnail = async (imgUrl: string, quality: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `youtube-thumbnail-${videoInfo?.videoId}-${quality.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      window.open(imgUrl, '_blank');
    }
  };

  const handleDownloadMedia = (format: 'mp4-1080' | 'mp4-720' | 'mp3') => {
    if (!videoInfo) return;
    setDownloadingFormat(format);
    
    // Privacy-friendly web service redirect link for media extraction
    const targetUrl = `https://www.youtube.com/watch?v=${videoInfo.videoId}`;
    let downloadServiceUrl = '';

    if (format === 'mp3') {
      downloadServiceUrl = `https://ytmp3.cc/en/?url=${encodeURIComponent(targetUrl)}`;
    } else {
      downloadServiceUrl = `https://y2mate.is/en/?url=${encodeURIComponent(targetUrl)}`;
    }

    window.open(downloadServiceUrl, '_blank');
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  return (
    <div className="tool-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Input Group */}
      <div className="tool-input-group">
        <label className="tool-label">YouTube Video / Shorts Link</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="tool-input-field"
            placeholder="Paste URL (e.g. https://www.youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <button onClick={handleParse} disabled={loading} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Youtube size={18} />}
            {loading ? 'Parsing...' : 'Fetch Media'}
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

      {/* Video Details & Media Downloads */}
      {videoInfo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Embedded Player / Thumbnail */}
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#000', position: 'relative' }}>
              <iframe
                width="100%"
                height="210"
                src={`https://www.youtube-nocookie.com/embed/${videoInfo.videoId}`}
                title={videoInfo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>

            {/* Title, Details & Video/Audio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {videoInfo.author}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                  {videoInfo.title}
                </h3>
              </div>

              {/* Download Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Download Video & Audio Streams:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleDownloadMedia('mp4-1080')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <Download size={16} /> MP4 (HD Video)
                  </button>

                  <button
                    onClick={() => handleDownloadMedia('mp3')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <Download size={16} /> MP3 Audio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Downloader Section */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={18} color="var(--accent-primary)" /> Download Cover Thumbnails
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {videoInfo.thumbnails.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <img
                    src={t.url}
                    alt={t.quality}
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}
                    onError={(e) => {
                      // Fallback image if 1080p thumbnail isn't generated for low res videos
                      (e.target as HTMLElement).setAttribute('src', videoInfo.thumbnailUrl);
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.quality}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.resolution}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadThumbnail(t.url, t.quality)}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}
                  >
                    <Download size={14} /> Save Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
