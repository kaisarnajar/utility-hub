import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check, Download, Hash } from 'lucide-react';

export const UuidGenTool: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [removeHyphens, setRemoveHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const generateUuidV4 = useCallback(() => {
    let raw: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      raw = crypto.randomUUID();
    } else {
      // Fallback RFC4122 compliance generator
      raw = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    if (removeHyphens) {
      raw = raw.replace(/-/g, '');
    }

    return uppercase ? raw.toUpperCase() : raw.toLowerCase();
  }, [uppercase, removeHyphens]);

  const generateBatch = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateUuidV4());
    }
    setUuids(list);
  }, [count, generateUuidV4]);

  useEffect(() => {
    generateBatch();
  }, [generateBatch]);

  const handleCopyOne = (index: number, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `uuids-${count}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Settings Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label className="tool-label" style={{ whiteSpace: 'nowrap' }}>Count ({count}):</label>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: '160px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          <button onClick={generateBatch} className="btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
            <RefreshCw size={16} /> Regenerate
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
            />
            Uppercase Letters (A-F)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={removeHyphens}
              onChange={(e) => setRemoveHyphens(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
            />
            Remove Hyphens (-)
          </label>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Generated {uuids.length} UUID v4 identifier{uuids.length > 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopyAll} className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            {copiedAll ? <Check size={16} color="var(--badge-ready-color)" /> : <Copy size={16} />}
            {copiedAll ? 'Copied All!' : 'Copy All'}
          </button>
          <button onClick={handleDownloadTxt} className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            <Download size={16} /> Download .txt
          </button>
        </div>
      </div>

      {/* UUID List Display */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '0.25rem',
        }}
      >
        {uuids.map((id, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {id}
            </span>
            <button
              onClick={() => handleCopyOne(index, id)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              {copiedIndex === index ? <Check size={14} color="var(--badge-ready-color)" /> : <Copy size={14} />}
              {copiedIndex === index ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
