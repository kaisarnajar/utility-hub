import React, { useState, useEffect } from 'react';
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

function highlightJsonToHtml(json: string): string {
  if (!json) return '';

  const htmlEscaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return htmlEscaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[\{\}\[\]])/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          const keyText = match.slice(0, -1);
          return `<span class="json-key">${keyText}</span><span class="json-colon">:</span>`;
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      } else if (/[\{\}\[\]]/.test(match)) {
        return `<span class="json-bracket">${match}</span>`;
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function tryFixMissingBrackets(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (inString) {
      if (char === '\\' && !isEscaped) {
        isEscaped = true;
      } else {
        if (char === '"' && !isEscaped) {
          inString = false;
        }
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        stack.push('}');
      } else if (char === '[') {
        stack.push(']');
      } else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  if (stack.length > 0 && !inString) {
    const candidate = trimmed + stack.reverse().join('');
    try {
      JSON.parse(candidate);
      return candidate;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export const JsonFormatterTool: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fixableJson, setFixableJson] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatJson = (spaces: number = indent, customInput?: string) => {
    setErrorMsg(null);
    const textToParse = customInput !== undefined ? customInput : inputJson;
    if (!textToParse.trim()) {
      setFormattedJson('');
      setFixableJson(null);
      return;
    }
    try {
      const parsed = JSON.parse(textToParse);
      setFormattedJson(JSON.stringify(parsed, null, spaces));
      setFixableJson(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
      const fixed = tryFixMissingBrackets(textToParse);
      setFixableJson(fixed);
    }
  };

  useEffect(() => {
    formatJson(2, SAMPLE_JSON);
  }, []);

  const minifyJson = () => {
    setErrorMsg(null);
    if (!inputJson.trim()) {
      setFormattedJson('');
      setFixableJson(null);
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setFormattedJson(JSON.stringify(parsed));
      setFixableJson(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
      const fixed = tryFixMissingBrackets(inputJson);
      setFixableJson(fixed);
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
    setFixableJson(null);
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
          <button onClick={() => formatJson(indent)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
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
              formatJson(indent, SAMPLE_JSON);
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
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span><strong>JSON Syntax Error:</strong> {errorMsg}</span>
          </div>

          {fixableJson && (
            <button
              onClick={() => {
                setInputJson(fixableJson);
                formatJson(indent, fixableJson);
              }}
              className="btn-primary"
              style={{
                backgroundColor: '#ef4444',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
              }}
            >
              Auto-Fix Missing Closing Brackets
            </button>
          )}
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
              const val = e.target.value;
              setInputJson(val);
              setErrorMsg(null);
              formatJson(indent, val);
            }}
            rows={16}
            style={{ width: '100%', resize: 'vertical', minHeight: '340px' }}
          />
        </div>

        <div className="tool-input-group">
          <label className="tool-label">Formatted & Colorized Output</label>
          {formattedJson ? (
            <pre
              className="json-highlight-container"
              dangerouslySetInnerHTML={{ __html: highlightJsonToHtml(formattedJson) }}
            />
          ) : (
            <div className="json-highlight-container" style={{ color: 'var(--text-muted)' }}>
              Formatted result with color highlighting will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
