import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, UnfoldVertical, FoldVertical } from 'lucide-react';

const RAINBOW_BRACKET_COLORS_LIGHT = [
  '#d97706', // Depth 0: Gold / Yellow
  '#dc2626', // Depth 1: Red
  '#2563eb', // Depth 2: Blue
  '#059669', // Depth 3: Green
  '#9333ea', // Depth 4: Purple
  '#db2777', // Depth 5: Pink
  '#ea580c', // Depth 6: Orange
];

const RAINBOW_BRACKET_COLORS_DARK = [
  '#fbbf24', // Depth 0: Bright Gold / Yellow
  '#ef4444', // Depth 1: Bright Red
  '#60a5fa', // Depth 2: Bright Blue
  '#34d399', // Depth 3: Bright Green
  '#c084fc', // Depth 4: Bright Purple
  '#f472b6', // Depth 5: Bright Pink
  '#fb923c', // Depth 6: Bright Orange
];

interface JsonTreeNodeProps {
  data: any;
  propName?: string;
  depth?: number;
  isLast?: boolean;
  expandSignal?: number; // Even number = Expand All, Odd number = Collapse All
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  data,
  propName,
  depth = 0,
  isLast = true,
  expandSignal = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Synchronize collapse/expand state when toolbar buttons are clicked
  useEffect(() => {
    if (expandSignal > 0) {
      // expandSignal % 2 === 1 -> Expand All, expandSignal % 2 === 0 -> Collapse All
      setCollapsed(expandSignal % 2 === 0);
    }
  }, [expandSignal]);

  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);

  // Determine bracket color by nesting depth
  const palette =
    document.documentElement.getAttribute('data-theme') === 'dark'
      ? RAINBOW_BRACKET_COLORS_DARK
      : RAINBOW_BRACKET_COLORS_LIGHT;
  const bracketColor = palette[depth % palette.length];

  if (!isObject) {
    return (
      <div className="json-tree-row">
        {propName !== undefined && (
          <span className="json-key">"{propName}": </span>
        )}
        {typeof data === 'string' && (
          <span className="json-string">"{data}"</span>
        )}
        {typeof data === 'number' && (
          <span className="json-number">{String(data)}</span>
        )}
        {typeof data === 'boolean' && (
          <span className="json-boolean">{String(data)}</span>
        )}
        {data === null && <span className="json-null">null</span>}
        {!isLast && <span className="json-colon">,</span>}
      </div>
    );
  }

  const keys = isArray ? data : Object.keys(data);
  const openChar = isArray ? '[' : '{';
  const closeChar = isArray ? ']' : '}';
  const countLabel = isArray ? `${keys.length} items` : `${keys.length} keys`;

  if (keys.length === 0) {
    return (
      <div className="json-tree-row">
        {propName !== undefined && (
          <span className="json-key">"{propName}": </span>
        )}
        <span style={{ color: bracketColor, fontWeight: 700 }}>
          {openChar}{closeChar}
        </span>
        {!isLast && <span className="json-colon">,</span>}
      </div>
    );
  }

  return (
    <div className="json-tree-block">
      <div className="json-tree-row">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="json-fold-btn"
          title={collapsed ? 'Expand section' : 'Collapse section'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {propName !== undefined && (
          <span className="json-key">"{propName}": </span>
        )}

        <span style={{ color: bracketColor, fontWeight: 700 }}>{openChar}</span>

        {collapsed ? (
          <span
            className="json-collapsed-summary"
            onClick={() => setCollapsed(false)}
            title="Click to expand"
          >
            {` ... ${countLabel} `}
          </span>
        ) : null}

        {collapsed && (
          <>
            <span style={{ color: bracketColor, fontWeight: 700 }}>
              {closeChar}
            </span>
            {!isLast && <span className="json-colon">,</span>}
          </>
        )}
      </div>

      {!collapsed && (
        <>
          <div
            className="json-tree-children"
            style={{
              paddingLeft: '1.25rem',
              borderLeft: `1.5px dashed ${bracketColor}40`,
              marginLeft: '0.45rem',
            }}
          >
            {isArray
              ? data.map((item: any, idx: number) => (
                  <JsonTreeNode
                    key={idx}
                    data={item}
                    depth={depth + 1}
                    isLast={idx === data.length - 1}
                    expandSignal={expandSignal}
                  />
                ))
              : Object.keys(data).map((k: string, idx: number, arr: string[]) => (
                  <JsonTreeNode
                    key={k}
                    propName={k}
                    data={data[k]}
                    depth={depth + 1}
                    isLast={idx === arr.length - 1}
                    expandSignal={expandSignal}
                  />
                ))}
          </div>

          <div className="json-tree-row" style={{ marginLeft: '0.45rem' }}>
            <span style={{ color: bracketColor, fontWeight: 700 }}>
              {closeChar}
            </span>
            {!isLast && <span className="json-colon">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

interface JsonTreeViewerProps {
  parsedData: any;
}

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({ parsedData }) => {
  const [expandSignal, setExpandSignal] = useState<number>(1);

  const handleExpandAll = () => setExpandSignal((prev) => (prev % 2 === 0 ? prev + 1 : prev + 2));
  const handleCollapseAll = () => setExpandSignal((prev) => (prev % 2 === 1 ? prev + 1 : prev + 2));

  return (
    <div className="json-tree-viewer-wrapper">
      {/* Controls Bar for Tree Viewer */}
      <div className="json-tree-toolbar">
        <button
          onClick={handleExpandAll}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
          title="Expand all nested sections"
        >
          <UnfoldVertical size={13} /> Expand All
        </button>
        <button
          onClick={handleCollapseAll}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
          title="Collapse all nested sections"
        >
          <FoldVertical size={13} /> Collapse All
        </button>
      </div>

      {/* Main Tree Container */}
      <div className="json-highlight-container json-tree-content">
        <JsonTreeNode data={parsedData} depth={0} isLast={true} expandSignal={expandSignal} />
      </div>
    </div>
  );
};
