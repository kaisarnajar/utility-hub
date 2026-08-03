import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const QRCodeTool: React.FC = () => {
  const { theme } = useTheme();
  const [text, setText] = useState<string>('https://github.com');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [size, setSize] = useState<number>(256);

  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto select foreground & background colors matching active theme mode
  const darkColor = theme === 'dark' ? '#ffffff' : '#000000';
  const lightColor = theme === 'dark' ? '#141c2e' : '#ffffff';

  useEffect(() => {
    if (canvasRef.current && text.trim().length > 0) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          width: size,
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: errorCorrectionLevel,
        },
        (error) => {
          if (error) console.error('QR Code render error', error);
        }
      );
    }
  }, [text, darkColor, lightColor, errorCorrectionLevel, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.warn('Clipboard image copy not supported', err);
    }
  };

  return (
    <div className="tool-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Input Text / URL */}
        <div className="tool-input-group">
          <label className="tool-label">Content / URL to Encode</label>
          <input
            type="text"
            className="tool-input-field"
            placeholder="Type text or enter website URL..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* QR Code Canvas Preview & Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-subtle)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          {text.trim().length > 0 ? (
            <canvas ref={canvasRef} style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <QrIcon size={48} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <p>Enter text or URL above to generate QR Code</p>
            </div>
          )}

          {text.trim().length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleDownload} className="btn-primary">
                <Download size={18} /> Download PNG
              </button>
              <button onClick={handleCopyImage} className="btn-secondary">
                {copied ? <Check size={18} color="var(--badge-ready-color)" /> : <Copy size={18} />}
                {copied ? 'Copied Image!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </div>

        {/* Customization Options */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="tool-input-group">
            <label className="tool-label">Error Correction</label>
            <select
              className="tool-select-field"
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div className="tool-input-group">
            <label className="tool-label">Size (px)</label>
            <select
              className="tool-select-field"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={180}>180 x 180</option>
              <option value={256}>256 x 256</option>
              <option value={350}>350 x 350</option>
              <option value={512}>512 x 512</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
