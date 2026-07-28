import React, { useEffect } from 'react';
import { X, ArrowLeft, Share2, Check } from 'lucide-react';
import { ToolItem } from '../tools/toolsRegistry';

interface ToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [copiedShare, setCopiedShare] = React.useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (tool) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [tool, onClose]);

  if (!tool) return null;

  const IconComponent = tool.icon;
  const ToolComponent = tool.component;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#tool/${tool.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="tool-modal-overlay" onClick={onClose}>
      <div className="tool-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tool-modal-header">
          <div className="modal-header-info">
            <button className="modal-close-btn" onClick={onClose} title="Back to Dashboard">
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2 }}>{tool.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tool.description}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleShare}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              title="Copy Direct Link to this Tool"
            >
              {copiedShare ? <Check size={14} color="var(--badge-ready-color)" /> : <Share2 size={14} />}
              {copiedShare ? 'Link Copied' : 'Share'}
            </button>

            <button className="modal-close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Container for active Tool */}
        <div className="tool-modal-body">
          <ToolComponent {...(tool.componentProps || {})} />
        </div>
      </div>
    </div>
  );
};
