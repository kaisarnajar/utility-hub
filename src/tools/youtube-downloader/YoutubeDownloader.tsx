import React, { useState } from 'react';
import { Youtube, Download, Image, Check, AlertCircle, Loader2, RefreshCw, FileVideo, Music } from 'lucide-react';

interface YoutubeVideoInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  thumbnails: { quality: string; resolution: string; url: string }[];
}

interface DownloadProgressState {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  format: string | null;
  progress: number;
  message: string;
  downloadUrl: string | null;
}

export const YoutubeDownloaderTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<YoutubeVideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dlState, setDlState] = useState<DownloadProgressState>({
    status: 'idle',
    format: null,
    progress: 0,
    message: '',
    downloadUrl: null,
  });

  const extractVideoId = (inputUrl: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = inputUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleParse = async () => {
    setError(null);
    setDlState({ status: 'idle', format: null, progress: 0, message: '', downloadUrl: null });

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
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `thumbnail-${quality}.jpg`;
      link.target = '_blank';
      link.click();
    }
  };

  const triggerDirectDownload = (downloadUrl: string, formatKey: string) => {
    const ext = formatKey === 'mp3' ? 'mp3' : formatKey === 'm4a' ? 'm4a' : 'mp4';
    const safeTitle = (videoInfo?.title || 'youtube-video').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeTitle}_${formatKey}.${ext}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInAppDownload = async (formatKey: '1080' | '720' | '360' | 'mp3' | 'm4a') => {
    if (!videoInfo) return;

    setDlState({
      status: 'converting',
      format: formatKey,
      progress: 10,
      message: 'Connecting to media stream processor...',
      downloadUrl: null,
    });

    const targetUrl = `https://www.youtube.com/watch?v=${videoInfo.videoId}`;

    try {
      // Step 1: Initiate background conversion request
      const initRes = await fetch(
        `https://loader.to/ajax/download.php?format=${formatKey}&url=${encodeURIComponent(targetUrl)}`
      );
      const initData = await initRes.json();

      if (!initData || (!initData.progress_url && !initData.id)) {
        throw new Error('Conversion service did not respond with a stream queue ID.');
      }

      const progressUrl =
        initData.progress_url || `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;

      setDlState((prev) => ({
        ...prev,
        progress: 25,
        message: 'Converting video/audio stream in high quality...',
      }));

      // Step 2: Poll conversion progress until complete
      let attempts = 0;
      const maxAttempts = 30;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const progRes = await fetch(progressUrl);
          const progData = await progRes.json();

          const calcProgress = Math.min(95, 25 + Math.floor(attempts * 2.5));

          setDlState((prev) => ({
            ...prev,
            progress: calcProgress,
            message: progData.text || `Processing stream... (${attempts * 4}%)`,
          }));

          if (progData.download_url) {
            clearInterval(pollInterval);

            setDlState({
              status: 'completed',
              format: formatKey,
              progress: 100,
              message: 'Download complete! File saved directly to your device.',
              downloadUrl: progData.download_url,
            });

            // Trigger direct in-app download
            triggerDirectDownload(progData.download_url, formatKey);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setDlState({
              status: 'error',
              format: formatKey,
              progress: 0,
              message: 'Conversion timed out. Please try again or pick another format.',
              downloadUrl: null,
            });
          }
        } catch (pollErr) {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setDlState({
              status: 'error',
              format: formatKey,
              progress: 0,
              message: 'Failed to poll stream progress.',
              downloadUrl: null,
            });
          }
        }
      }, 1200);
    } catch (err: any) {
      setDlState({
        status: 'error',
        format: formatKey,
        progress: 0,
        message: err.message || 'Stream processing failed.',
        downloadUrl: null,
      });
    }
  };

  return (
    <div className="tool-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Input Group */}
      <div className="tool-input-group">
        <label className="tool-label">YouTube Video or Shorts Link</label>
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
            {/* Embedded Player */}
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

            {/* Title, Details & In-App Direct Download Options */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {videoInfo.author}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                  {videoInfo.title}
                </h3>
              </div>

              {/* In-App Media Downloader Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Download Directly In-App (No Redirects):
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleInAppDownload('1080')}
                    disabled={dlState.status === 'converting'}
                    className="btn-primary"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', justifyContent: 'center' }}
                  >
                    <FileVideo size={15} /> MP4 (1080p HD)
                  </button>

                  <button
                    onClick={() => handleInAppDownload('720')}
                    disabled={dlState.status === 'converting'}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', justifyContent: 'center' }}
                  >
                    <FileVideo size={15} /> MP4 (720p HD)
                  </button>

                  <button
                    onClick={() => handleInAppDownload('mp3')}
                    disabled={dlState.status === 'converting'}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', justifyContent: 'center' }}
                  >
                    <Music size={15} /> MP3 Audio
                  </button>

                  <button
                    onClick={() => handleInAppDownload('m4a')}
                    disabled={dlState.status === 'converting'}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', justifyContent: 'center' }}
                  >
                    <Music size={15} /> M4A Audio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active In-App Conversion Progress Banner */}
          {dlState.status !== 'idle' && (
            <div
              style={{
                backgroundColor:
                  dlState.status === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : dlState.status === 'completed'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${
                  dlState.status === 'error'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : dlState.status === 'completed'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'var(--border-color)'
                }`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {dlState.status === 'converting' && <Loader2 size={18} className="animate-spin" color="var(--accent-primary)" />}
                  {dlState.status === 'completed' && <Check size={18} color="#10b981" />}
                  {dlState.status === 'error' && <AlertCircle size={18} color="#ef4444" />}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {dlState.message}
                  </span>
                </div>

                {dlState.downloadUrl && (
                  <button
                    onClick={() => triggerDirectDownload(dlState.downloadUrl!, dlState.format || 'mp4')}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <Download size={14} /> Download File Again
                  </button>
                )}
              </div>

              {dlState.status === 'converting' && (
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--border-color)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${dlState.progress}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-primary)',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              )}
            </div>
          )}

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
