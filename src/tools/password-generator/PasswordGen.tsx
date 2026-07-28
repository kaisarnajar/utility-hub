import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';

export const PasswordGenTool: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [batchList, setBatchList] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    let numberChars = '0123456789';
    let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      uppercaseChars = uppercaseChars.replace(/[IO]/g, '');
      lowercaseChars = lowercaseChars.replace(/[l]/g, '');
      numberChars = numberChars.replace(/[01]/g, '');
    }

    let charPool = '';
    if (includeUppercase) charPool += uppercaseChars;
    if (includeLowercase) charPool += lowercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    if (!charPool) {
      setPassword('');
      setBatchList([]);
      return;
    }

    const generateOne = () => {
      let result = '';
      const cryptoObj = window.crypto || (window as any).msCrypto;
      const randomValues = new Uint32Array(length);
      cryptoObj.getRandomValues(randomValues);

      for (let i = 0; i < length; i++) {
        result += charPool[randomValues[i] % charPool.length];
      }
      return result;
    };

    const primary = generateOne();
    setPassword(primary);

    if (batchCount > 1) {
      const list = [primary];
      for (let i = 1; i < batchCount; i++) {
        list.push(generateOne());
      }
      setBatchList(list);
    } else {
      setBatchList([]);
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous, batchCount]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const calculateStrength = () => {
    if (!password) return { label: 'None', score: 0, color: 'var(--text-muted)' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 14) score += 1;
    if (password.length >= 20) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 25, color: '#ef4444' };
    if (score <= 4) return { label: 'Fair', score: 50, color: '#f59e0b' };
    if (score <= 6) return { label: 'Strong', score: 75, color: '#10b981' };
    return { label: 'Very Secure', score: 100, color: '#6366f1' };
  };

  const strength = calculateStrength();

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-container" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Primary Generated Password Output Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.35rem',
            fontWeight: 700,
            wordBreak: 'break-all',
            color: password ? 'var(--text-main)' : 'var(--text-muted)',
          }}
        >
          {password || 'Select options below'}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={generatePassword}
            className="btn-secondary"
            style={{ padding: '0.65rem' }}
            title="Generate New Password"
          >
            <RefreshCw size={20} />
          </button>

          <button
            onClick={() => handleCopy(password)}
            disabled={!password}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Strength Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            {strength.score > 50 ? <ShieldCheck size={16} color={strength.color} /> : <ShieldAlert size={16} color={strength.color} />}
            Password Strength:
          </span>
          <span style={{ color: strength.color }}>{strength.label}</span>
        </div>
        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${strength.score}%`, backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
        </div>
      </div>

      {/* Controls & Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Length Slider */}
        <div className="tool-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="tool-label">Password Length</label>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
              {length} characters
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Checkbox Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            Include Uppercase (A-Z)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            Include Lowercase (a-z)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            Include Numbers (0-9)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            Include Symbols (!@#$)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', gridColumn: '1 / -1' }}>
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            Exclude Ambiguous Characters (l, 1, I, O, 0)
          </label>
        </div>

        {/* Batch Generate Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label className="tool-label" style={{ whiteSpace: 'nowrap' }}>Batch Generate:</label>
          <select
            className="tool-select-field"
            value={batchCount}
            onChange={(e) => setBatchCount(Number(e.target.value))}
            style={{ width: '140px' }}
          >
            <option value={1}>1 Password</option>
            <option value={5}>5 Passwords</option>
            <option value={10}>10 Passwords</option>
          </select>
        </div>
      </div>

      {/* Batch List Display */}
      {batchList.length > 1 && (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Batch Passwords ({batchList.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {batchList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              >
                <span>{item}</span>
                <button
                  onClick={() => handleCopy(item)}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
