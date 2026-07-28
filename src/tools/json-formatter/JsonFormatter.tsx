import React, { useState } from 'react';
import { Copy, Download, Trash2, Check, AlertCircle, FileCode, Code } from 'lucide-react';

const SAMPLE_JSON = `{
  "name": "Utility Hub",
  "version": "1.0.0",
  "privacy": "100% Client-Side",
  "features": [
    "Fast & Lightweight",
    "Offline PWA Support",
    "No Backend Required"
  ],
  "author": {
    "organization": "Utility Hub Team",
    "license": "MIT"
  }
}`;

export const JsonFormatterTool: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatJson = (spaces: number = indent) => {
    setErrorMsg(null);
    if (!inputJson.trim()) {
      setFormattedJson('');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setFormattedJson(JSON.stringify(parsed, null, spaces));
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
    }
  };

  const minifyJson = () => {
    setErrorMsg(null);
    if (!inputJson.trim()) {
      setFormattedJson('');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setFormattedJson(JSON.stringify(parsed));
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
    }
  };

  const handleCopy = () => {
    const textToCopy = formattedJson || inputJson;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = formattedJson || inputJson;
    if (!content) return;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'formatted.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputJson('');
    setFormattedJson('');
    setErrorMsg(null);
  };

  return (
    <div className="tool-container" style={{ width: '100%' }}>
      {/* Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => formatJson(2)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Code size={16} /> Format (Pretty)
          </button>

          <button onClick={minifyJson} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Minify
          </button>

          <select
            className="tool-select-field"
            value={indent}
            onChange={(e) => {
              const spaces = Number(e.target.value);
              setIndent(spaces);
              formatJson(spaces);
            }}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value={2}>2 Spaces Indent</option>
            <option value={4}>4 Spaces Indent</option>
          </select>

          <button
            onClick={() => {
              setInputJson(SAMPLE_JSON);
              setErrorMsg(null);
            }}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <FileCode size={16} /> Sample JSON
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
            {copied ? <Check size={16} color="var(--badge-ready-color)" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button onClick={handleDownload} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
            <Download size={16} /> Save JSON
          </button>

          <button onClick={handleClear} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', color: '#ef4444' }}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {/* Error Alert if JSON syntax fails */}
      {errorMsg && (
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
          <span><strong>JSON Syntax Error:</strong> {errorMsg}</span>
        </div>
      )}

      {/* Two Panel Input / Output Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="tool-input-group">
          <label className="tool-label">Input Raw JSON</label>
          <textarea
            className="tool-textarea-field mono"
            placeholder="Paste your unformatted JSON string here..."
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              setErrorMsg(null);
            }}
            rows={16}
            style={{ width: '100%', resize: 'vertical', minHeight: '340px' }}
          />
        </div>

        <div className="tool-input-group">
          <label className="tool-label">Formatted Output</label>
          <textarea
            className="tool-textarea-field mono"
            placeholder="Formatted result will appear here..."
            value={formattedJson}
            readOnly
            rows={16}
            style={{ width: '100%', resize: 'vertical', minHeight: '340px', backgroundColor: 'var(--bg-subtle)' }}
          />
        </div>
      </div>
    </div>
  );
};
