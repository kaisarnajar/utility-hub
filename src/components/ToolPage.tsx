import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { ToolItem, CATEGORIES } from '../tools/toolsRegistry';

interface ToolPageProps {
  tool: ToolItem;
  onBack: () => void;
}

export const ToolPage: React.FC<ToolPageProps> = ({ tool, onBack }) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // Return to dashboard on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const IconComponent = tool.icon;
  const ToolComponent = tool.component;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === tool.category)?.label || tool.category;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#tool/${tool.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="tool-page-wrapper">
      {/* Breadcrumb & Top Controls */}
      <div className="tool-page-nav">
        <button
          onClick={onBack}
          className="btn-secondary tool-back-btn"
          title="Return to Utilities Catalog (Esc)"
        >
          <ArrowLeft size={18} />
          <span>Back to Utilities</span>
        </button>

        <div className="tool-page-nav-meta">
          <span className="tool-category-badge">{categoryLabel}</span>
          <button
            onClick={handleShare}
            className="btn-secondary share-btn"
            title="Copy direct share link to this utility"
          >
            {copiedShare ? (
              <Check size={16} color="var(--badge-ready-color)" />
            ) : (
              <Share2 size={16} />
            )}
            <span>{copiedShare ? 'Link Copied' : 'Share Tool'}</span>
          </button>
        </div>
      </div>

      {/* Main Tool Header Card */}
      <div className="tool-page-header">
        <div className="tool-page-header-info">
          <div className="tool-page-icon-wrapper">
            <IconComponent size={32} />
          </div>
          <div>
            <div className="tool-page-title-row">
              <h1 className="tool-page-title">{tool.name}</h1>
              <span className="status-badge ready">Available</span>
            </div>
            <p className="tool-page-description">{tool.description}</p>
          </div>
        </div>
      </div>

      {/* Full Page Body Container */}
      <div className="tool-page-body">
        <ToolComponent {...(tool.componentProps || {})} />
      </div>
    </div>
  );
};
