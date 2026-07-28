import React, { useState, useEffect } from 'react';
import { Wrench, Sun, Moon, Search, Download, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onLogoClick,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div className="brand-logo" onClick={onLogoClick} title="Return to Dashboard">
          <div className="logo-icon-wrapper">
            <Wrench size={22} />
          </div>
          <span>
            Utility <span className="brand-title-accent">Hub</span>
          </span>
        </div>

        {/* Search Bar in Header */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search utilities (e.g. Pomodoro, QR, Password)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear search">
              &times;
            </button>
          )}
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          {/* PWA Install Button if browser supports */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              title="Install Web App for Offline Use"
            >
              <Download size={16} /> Install App
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
};
