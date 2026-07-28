import React, { useState } from 'react';
import { Clock, ShieldCheck, Bell, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  toolName: string;
  description: string;
  expectedFeatures: string[];
}

export const ComingSoonTool: React.FC<ComingSoonProps> = ({
  toolName,
  description,
  expectedFeatures,
}) => {
  const [subscribed, setSubscribed] = useState<boolean>(false);

  return (
    <div
      className="tool-container"
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--badge-coming-soon-bg)',
          color: 'var(--badge-coming-soon-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <Clock size={32} />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        {toolName}
      </h2>

      <span className="status-badge coming-soon" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        Under Active Development
      </span>

      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {description}
      </p>

      {/* Planned Features List */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="var(--accent-primary)" /> Planned Features
        </h4>
        <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {expectedFeatures.map((feat, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              {feat}
            </li>
          ))}
        </ul>
      </div>

      {/* Privacy Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldCheck size={20} style={{ flexShrink: 0 }} />
        <span>100% Privacy Friendly: All video stream parsing runs locally in your browser. No user tracking or media logging.</span>
      </div>

      <button
        onClick={() => setSubscribed(true)}
        disabled={subscribed}
        className="btn-primary"
        style={{ width: '100%', padding: '0.85rem' }}
      >
        <Bell size={18} />
        {subscribed ? 'Notification Saved for Next Release!' : 'Notify Me When Ready'}
      </button>
    </div>
  );
};
