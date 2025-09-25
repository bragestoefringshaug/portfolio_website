"use client";

import { useState, useRef, useEffect } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  size: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onMaximize?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  position, 
  onPositionChange,
  size,
  onSizeChange,
  theme,
  onThemeChange,
  soundEnabled,
  onSoundToggle,
  isMinimized = false,
  onMinimize,
  isMaximized = false,
  onMaximize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const settingsRef = useRef<HTMLDivElement>(null);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.settings-header') && 
        !(e.target as HTMLElement).closest('.resize-handle')) {
      e.stopPropagation();
      setIsDragging(true);
      const rect = settingsRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && settingsRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - settingsRef.current.offsetWidth;
      const maxY = window.innerHeight - settingsRef.current.offsetHeight;
      
      onPositionChange({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    if (settingsRef.current) {
      const rect = settingsRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && settingsRef.current) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(400, resizeStart.width + deltaX);
      const newHeight = Math.max(300, resizeStart.height + deltaY);

      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      onSizeChange({ 
        width: Math.min(newWidth, maxWidth), 
        height: Math.min(newHeight, maxHeight)
      });
    }
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, resizeStart, position]);

  if (!isOpen) return null;

  return (
    <div
      ref={settingsRef}
      className={`fixed settings-window rounded-lg shadow-2xl border ${
        isDragging ? 'cursor-grabbing dragging' : 'cursor-move'
      } ${isMinimized ? 'window-minimizing' : ''} ${isMaximized ? 'window-maximizing' : ''} window-opening`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 1000,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(e);
      }}
    >
      {/* Header */}
      <div className="settings-header rounded-t-lg px-4 py-2 flex items-center justify-between select-none" style={{ backgroundColor: 'var(--button-bg)' }}>
        <div className="flex items-center gap-2">
          <div className="w-1"></div>
          <div 
            className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
            style={{ backgroundColor: '#dc2626' }}
            onClick={onClose}
            title="Close"
          >
            <span className="text-red-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</span>
          </div>
           <div 
             className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
             style={{ backgroundColor: '#ca8a04' }}
             onClick={onMinimize}
             title="Minimize"
           >
             <span className="text-yellow-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">−</span>
           </div>
           <div 
             className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
             style={{ backgroundColor: '#16a34a' }}
             onClick={onMaximize}
             title={isMaximized ? "Restore" : "Maximize"}
           >
             <span className="text-green-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{isMaximized ? '❐' : '□'}</span>
           </div>
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Settings
        </span>
        <div className="w-16"></div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto settings-content" style={{ height: `${size.height - 60}px` }}>
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Theme</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`settings-button ${
                      theme === 'dark' 
                        ? 'settings-button-active' 
                        : 'settings-button-inactive'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`settings-button ${
                      theme === 'light' 
                        ? 'settings-button-active' 
                        : 'settings-button-inactive'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Audio</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Sound Effects</span>
                <button
                  onClick={() => onSoundToggle(!soundEnabled)}
                  className={`settings-button ${
                    soundEnabled 
                      ? 'settings-button-enabled' 
                      : 'settings-button-disabled'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>System</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div>OS: Portfolio OS v1.0</div>
              <div>Browser: {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown'}</div>
              <div>Resolution: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}</div>
              <div>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div 
        className="resize-handle resize-bottom-right"
        onMouseDown={handleResizeMouseDown}
      ></div>
    </div>
  );
};

export default SettingsPanel;
