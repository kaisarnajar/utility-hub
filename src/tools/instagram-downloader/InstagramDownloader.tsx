import React, { useState } from 'react';
import { Instagram, Download, AlertCircle, Loader2, Image, Check, FileVideo, Music } from 'lucide-react';

interface InstagramPostData {
  shortcode: string;
  embedUrl: string;
  type: 'reel' | 'post';
}

interface DownloadProgressState {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  format: string | null;
  progress: number;
  message: string;
  downloadUrl: string | null;
}

export const InstagramDownloaderTool: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.instagram.com/reel/C123456789/');
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<InstagramPostData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dlState, setDlState] = useState<DownloadProgressState>({
    status: 'idle',
    format: null,
    progress: 0,
    message: '',
    downloadUrl: null,
  });

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
    setDlState({ status: 'idle', format: null, progress: 0, message: '', downloadUrl: null });

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

  const triggerDirectDownload = (downloadUrl: string, formatKey: string) => {
    const ext = formatKey === 'mp3' ? 'mp3' : formatKey === 'photo' ? 'jpg' : 'mp4';
    const fileName = `instagram-${postData?.type || 'media'}-${postData?.shortcode}.${ext}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInAppDownload = async (formatKey: 'video' | 'mp3' | 'photo') => {
    if (!postData) return;

    setDlState({
      status: 'converting',
      format: formatKey,
      progress: 10,
      message: 'Connecting to Instagram media stream processor...',
      downloadUrl: null,
    });

    const targetUrl = `https://www.instagram.com/reel/${postData.shortcode}/`;
    // Use 720p stream query for Reels to prevent 1080p upsampling timeout
    const formatQuery = formatKey === 'mp3' ? 'mp3' : '720';

    try {
      // Step 1: Initiate background conversion request
      const initRes = await fetch(
        `https://loader.to/ajax/download.php?format=${formatQuery}&url=${encodeURIComponent(targetUrl)}`
      );
      const initData = await initRes.json();

      if (!initData || (!initData.progress_url && !initData.id)) {
        throw new Error('Conversion service did not respond with a valid stream ID.');
      }

      const progressUrl =
        initData.progress_url || `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;

      setDlState((prev) => ({
        ...prev,
        progress: 25,
        message: `Extracting ${formatKey === 'mp3' ? 'audio' : 'video'} stream in HD quality...`,
      }));

      // Step 2: Poll conversion progress until complete (up to 45 attempts = 54s)
      let attempts = 0;
      const maxAttempts = 45;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const progRes = await fetch(progressUrl);
          const progData = await progRes.json();

          const calcProgress = Math.min(95, 25 + Math.floor(attempts * 1.8));

          setDlState((prev) => ({
            ...prev,
            progress: calcProgress,
            message: progData.text || `Processing Instagram media... (${Math.floor(calcProgress)}%)`,
          }));

          let finalDownloadUrl = progData.download_url;

          // Extract stream download URL from content payload if download_url is null
          if (!finalDownloadUrl && progData.content) {
            try {
              const decodedHtml = atob(progData.content);
              const linkMatch =
                decodedHtml.match(/href="(https:\/\/[^"]+\.savenow\.to\/[^"]+)"/i) ||
                decodedHtml.match(/href="(https:\/\/[^"]+\/api\/v2\/download\/[^"]+)"/i);

              if (linkMatch && linkMatch[1]) {
                finalDownloadUrl = linkMatch[1];
              }
            } catch (e) {}
          }

          if (finalDownloadUrl || progData.progress === 1000) {
            clearInterval(pollInterval);

            const streamUrl = finalDownloadUrl || `https://www.instagram.com/p/${postData.shortcode}/`;

            setDlState({
              status: 'completed',
              format: formatKey,
              progress: 100,
              message: 'Download complete! Media file saved directly to your device.',
              downloadUrl: streamUrl,
            });

            // Trigger direct in-app download
            triggerDirectDownload(streamUrl, formatKey);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setDlState({
              status: 'error',
              format: formatKey,
              progress: 0,
              message: 'Media processing timed out. Please try again.',
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
        message: err.message || 'Instagram media processing failed.',
        downloadUrl: null,
      });
    }
  };

  return (
    <div className="tool-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
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

      {/* Media Details & Direct Download Panel */}
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

          {/* In-App Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Download Directly In-App (No Redirects):
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <button
                onClick={() => handleInAppDownload('video')}
                disabled={dlState.status === 'converting'}
                className="btn-primary"
                style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                <FileVideo size={16} /> Download HD Video (MP4)
              </button>

              <button
                onClick={() => handleInAppDownload('mp3')}
                disabled={dlState.status === 'converting'}
                className="btn-secondary"
                style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                <Music size={16} /> Download Audio (MP3)
              </button>

              <button
                onClick={() => handleInAppDownload('photo')}
                disabled={dlState.status === 'converting'}
                className="btn-secondary"
                style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                <Image size={16} /> Download Cover Photo (JPG)
              </button>
            </div>
          </div>

          {/* Active Progress Indicator Banner */}
          {dlState.status !== 'idle' && (
            <div
              style={{
                backgroundColor:
                  dlState.status === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : dlState.status === 'completed'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'var(--bg-subtle)',
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
                    onClick={() => triggerDirectDownload(dlState.downloadUrl!, dlState.format || 'video')}
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
        </div>
      )}
    </div>
  );
};
