import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { ToolItem } from '../tools/toolsRegistry';

interface ToolCardProps {
  tool: ToolItem;
  onOpen: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onOpen }) => {
  const IconComponent = tool.icon;
  const isReady = tool.status === 'ready';

  const handleCardClick = () => {
    if (isReady) {
      onOpen(tool);
    }
  };

  return (
    <div
      className={`tool-card ${isReady ? 'clickable' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: isReady ? 'pointer' : 'default' }}
    >
      <div>
        <div className="tool-card-header">
          <div className="tool-icon-wrapper">
            <IconComponent size={24} />
          </div>
          {!isReady && (
            <span className="status-badge coming-soon">
              Coming Soon
            </span>
          )}
        </div>

        <div className="tool-card-body">
          <h3 className="tool-title">{tool.name}</h3>
          <p className="tool-description">{tool.description}</p>
        </div>
      </div>

      <div className="tool-card-footer">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isReady) onOpen(tool);
          }}
          className={`open-tool-btn ${isReady ? '' : 'disabled'}`}
        >
          {isReady ? (
            <>
              Open Tool <ArrowRight size={18} />
            </>
          ) : (
            <>
              <Clock size={16} /> Coming Soon
            </>
          )}
        </button>
      </div>
    </div>
  );
};
