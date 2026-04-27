/**
 * FileTreePanel - File explorer panel
 */

import React, { useState } from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileItem[];
}

interface FileTreePanelProps {
  onFileSelect?: (path: string) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
}

const sampleFiles: FileItem[] = [
  { name: 'src', type: 'folder', path: '/src', children: [
    { name: 'index.ts', type: 'file', path: '/src/index.ts' },
    { name: 'components', type: 'folder', path: '/src/components', children: [
      { name: 'App.tsx', type: 'file', path: '/src/components/App.tsx' },
      { name: 'Sidebar.tsx', type: 'file', path: '/src/components/Sidebar.tsx' },
    ]},
    { name: 'utils', type: 'folder', path: '/src/utils', children: [
      { name: 'helpers.ts', type: 'file', path: '/src/utils/helpers.ts' },
    ]},
  ]},
  { name: 'tests', type: 'folder', path: '/tests', children: [
    { name: 'index.test.ts', type: 'file', path: '/tests/index.test.ts' },
  ]},
  { name: 'package.json', type: 'file', path: '/package.json' },
  { name: 'tsconfig.json', type: 'file', path: '/tsconfig.json' },
  { name: 'README.md', type: 'file', path: '/README.md' },
];

export function FileTreePanel({ onFileSelect, onNewFile, onNewFolder }: FileTreePanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/src', '/src/components', '/src/utils', '/tests']));
  const [selected, setSelected] = useState<string | null>(null);
  
  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };
  
  const handleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      toggleExpand(item.path);
    } else {
      setSelected(item.path);
      onFileSelect?.(item.path);
    }
  };
  
  const renderItem = (item: FileItem, depth: number = 0) => {
    const isExpanded = expanded.has(item.path);
    const isSelected = selected === item.path;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.path}>
        <div 
          className={`file-item ${isSelected ? 'selected' : ''} ${item.type}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleClick(item)}
        >
          <span className="item-icon">
            {item.type === 'folder' ? (isExpanded ? '📂' : '📁') : getFileIcon(item.name)}
          </span>
          <span className="item-name">{item.name}</span>
        </div>
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div className="folder-children">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const getFileIcon = (name: string): string => {
    const ext = name.split('.').pop() || '';
    const icons: Record<string, string> = {
      ts: '📄', tsx: '⚛️', js: '📄', jsx: '⚛️',
      json: '📋', md: '📝', css: '🎨', scss: '🎨',
      html: '🌐', png: '🖼️', jpg: '🖼️', svg: '🖼️',
      test: '🧪', spec: '🧪',
    };
    return icons[ext] || '📄';
  };
  
  return (
    <div className="file-tree">
      <div className="tree-header">
        <span>EXPLORER</span>
        <div className="tree-actions">
          <button onClick={onNewFile} title="New File">+📄</button>
          <button onClick={onNewFolder} title="New Folder">+📁</button>
        </div>
      </div>
      
      <div className="tree-content">
        {sampleFiles.map(item => renderItem(item))}
      </div>
      
      <style>{`
        .file-tree { display: flex; flex-direction: column; height: 100%; background: var(--color-bg-secondary); }
        
        .tree-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--color-border); font-size: 11px; font-weight: 600; color: var(--color-text-muted); letter-spacing: 0.5px; }
        .tree-actions { display: flex; gap: 4px; }
        .tree-actions button { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 12px; }
        .tree-actions button:hover { background: var(--color-bg-tertiary); }
        
        .tree-content { flex: 1; overflow-y: auto; padding: 8px 0; }
        
        .file-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; cursor: pointer; font-size: 13px; }
        .file-item:hover { background: var(--color-bg-tertiary); }
        .file-item.selected { background: var(--color-accent); color: white; }
        .item-icon { font-size: 14px; }
        .item-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </div>
  );
}