import React from 'react';
import { Github, Shield, HardDrive, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={16} color="var(--badge-ready-color)" /> 100% Client-Side Privacy
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <HardDrive size={16} color="var(--accent-primary)" /> Offline Ready PWA
          </span>
        </div>

        <div className="footer-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            title="GitHub Repository"
          >
            <Github size={18} />
            <span>GitHub Repo</span>
          </a>
          <span className="footer-copyright">v1.0.0</span>
          <span className="footer-copyright">
            © {new Date().getFullYear()} Utility Hub. Built for fast, local computation.
          </span>
        </div>
      </div>
    </footer>
  );
};
