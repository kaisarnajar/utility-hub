import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolCard } from './components/ToolCard';
import { ToolModal } from './components/ToolModal';
import { TOOLS_REGISTRY, CATEGORIES, Category, ToolItem } from './tools/toolsRegistry';
import { ThemeProvider } from './context/ThemeContext';
import { SearchX, Sparkles, Shield, Zap } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);

  // Sync hash routing e.g. #tool/pomodoro
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#tool/')) {
        const toolId = hash.replace('#tool/', '');
        const found = TOOLS_REGISTRY.find((t) => t.id === toolId);
        if (found) {
          setActiveTool(found);
        } else {
          setActiveTool(null);
        }
      } else {
        setActiveTool(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openTool = (tool: ToolItem) => {
    setActiveTool(tool);
    window.location.hash = `#tool/${tool.id}`;
  };

  const closeTool = () => {
    setActiveTool(null);
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  // Filter tools by search query and category
  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="app-layout">
      {/* Header Navigation */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogoClick={closeTool}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Banner Section */}
        <section className="hero-section">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent-primary)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <Zap size={15} /> Fast, Private & 100% In-Browser
          </div>
          <h1 className="hero-title">
            All Your Everyday Utilities <br />
            <span className="brand-title-accent">One Privacy-First Hub</span>
          </h1>
          <p className="hero-subtitle">
            Lightweight, offline-ready web utilities built with zero server logging, zero auth, and zero friction.
          </p>
        </section>

        {/* Category Filters Bar */}
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dashboard Grid View */}
        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={openTool} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <SearchX size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Utilities Found</h3>
            <p className="empty-state-text">
              We couldn't find any tool matching "{searchQuery}". Try searching for another keyword or view all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-secondary"
              style={{ marginTop: '1.25rem' }}
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </main>

      {/* Modal / Overlay for Active Tool */}
      <ToolModal tool={activeTool} onClose={closeTool} />

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
