import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, Upload, FileText, AlertCircle } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputText, setInputText] = useState<string>('Hello World! Privacy-first utilities in browser.');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const getOutputText = (): string => {
    setError(null);
    if (!inputText) return '';
    try {
      if (mode === 'encode') {
        // UTF-8 friendly encoding
        const encoded = btoa(
          encodeURIComponent(inputText).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
      } else {
        // Decode
        let cleanInput = inputText.trim();
        if (urlSafe) {
          cleanInput = cleanInput.replace(/-/g, '+').replace(/_/g, '/');
          while (cleanInput.length % 4) {
            cleanInput += '=';
          }
        }
        const decoded = decodeURIComponent(
          Array.from(atob(cleanInput))
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return decoded;
      }
    } catch (e: any) {
      setError(mode === 'encode' ? 'Failed to encode text' : 'Invalid Base64 string format');
      return '';
    }
  };

  const outputText = getOutputText();

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (mode === 'encode') {
        // Extract raw base64 part
        const base64Data = result.split(',')[1] || result;
        setInputText(base64Data);
      } else {
        setInputText(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="tool-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Mode & Config Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setMode('encode')}
            className={mode === 'encode' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={mode === 'decode' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            Decode
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
          />
          URL-Safe Base64 (- and _ instead of + and /)
        </label>
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

      {/* Input / Output Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        <div className="tool-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="tool-label">Input ({mode === 'encode' ? 'Plain Text' : 'Base64 String'})</label>
            <label className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              <Upload size={14} /> Upload File
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <textarea
            className="tool-textarea-field mono"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter text to ${mode}...`}
            style={{ width: '100%' }}
          />
        </div>

        <div className="tool-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="tool-label">Result Output</label>
            <button onClick={handleCopy} disabled={!outputText} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              {copied ? <Check size={14} color="var(--badge-ready-color)" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
          <textarea
            className="tool-textarea-field mono"
            rows={6}
            value={outputText}
            readOnly
            placeholder="Result will appear here automatically..."
            style={{ width: '100%', backgroundColor: 'var(--bg-subtle)' }}
          />
        </div>
      </div>
    </div>
  );
};
