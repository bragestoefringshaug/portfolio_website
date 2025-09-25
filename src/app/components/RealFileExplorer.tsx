"use client";

import { useState, useRef, useEffect } from "react";
import { Grid2x2, List } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  lastModified: Date | string;
  path: string;
  extension?: string;
  isDirectory: boolean;
}

interface RealFileExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  size: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onMaximize?: () => void;
}

const RealFileExplorer: React.FC<RealFileExplorerProps> = ({ 
  isOpen, 
  onClose, 
  position, 
  onPositionChange,
  size,
  onSizeChange,
  isMinimized = false,
  onMinimize,
  isMaximized = false,
  onMaximize
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['files', 'portfolio']);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileExplorerRef = useRef<HTMLDivElement>(null);

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Get file type based on extension
  const getFileType = (extension: string): string => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    const textExts = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html'];
    const docExts = ['pdf', 'doc', 'docx'];
    const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go'];
    
    if (imageExts.includes(extension)) return 'image';
    if (textExts.includes(extension)) return 'text';
    if (docExts.includes(extension)) return 'document';
    if (codeExts.includes(extension)) return 'code';
    return 'file';
  };

  // Get file icon
  const getFileIcon = (file: FileItem): string => {
    if (file.isDirectory) return '📁';
    
    const type = getFileType(file.extension || '');
    switch (type) {
      case 'image': return '🖼️';
      case 'text': return '📄';
      case 'document': return '📕';
      case 'code': return '💻';
      default: return '📄';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch files from API
  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        console.error('Failed to fetch files');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch file content
  const fetchFileContent = async (filePath: string) => {
    setContentLoading(true);
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content || '');
      } else {
        console.error('Failed to fetch file content');
        setFileContent('Error loading file content');
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error loading file content');
    } finally {
      setContentLoading(false);
    }
  };

  // Load files when path changes
  useEffect(() => {
    if (isOpen) {
      const path = currentPath.join('/');
      fetchFiles(path);
    }
  }, [currentPath, isOpen]);

  // Navigate to folder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSelectedFile(null);
    setFileContent('');
    setImagePreview('');
  };

  // Navigate back
  const navigateBack = () => {
    if (currentPath.length > 2) { // Keep at least 'files/portfolio'
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
      setFileContent('');
      setImagePreview('');
    }
  };

  // Navigate to parent
  const navigateToParent = () => {
    if (currentPath.length > 2) { // Keep at least 'files/portfolio'
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
      setFileContent('');
      setImagePreview('');
    }
  };

  // Open file
  const openFile = (file: FileItem) => {
    if (file.isDirectory) {
      navigateToFolder(file.name);
    } else {
      setSelectedFile(file);
      // If it's a text file, fetch its content
      if (file.extension && ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go'].includes(file.extension)) {
        fetchFileContent(file.path);
        setImagePreview('');
      } else if (file.extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(file.extension)) {
        // For images, set the image preview URL
        setImagePreview(`/${file.path}`);
        setFileContent('');
      } else {
        setFileContent('');
        setImagePreview('');
      }
    }
  };

  // Download file
  const downloadFile = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = `/${file.path}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.file-explorer-header') && 
        !(e.target as HTMLElement).closest('.resize-handle')) {
      e.stopPropagation();
      setIsDragging(true);
      const rect = fileExplorerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && fileExplorerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - fileExplorerRef.current.offsetWidth;
      const maxY = window.innerHeight - fileExplorerRef.current.offsetHeight;
      
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
    
    if (fileExplorerRef.current) {
      const rect = fileExplorerRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && fileExplorerRef.current) {
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
      ref={fileExplorerRef}
      className={`fixed file-explorer-window rounded-lg shadow-2xl border ${
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
      <div className="file-explorer-header rounded-t-lg px-4 py-2 flex items-center justify-between select-none" style={{ backgroundColor: 'var(--button-bg)' }}>
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
        <span className="text-gray-300 text-sm font-medium">
          File Explorer - {currentPath.join(' > ')}
        </span>
        <div className="w-16"></div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b flex items-center gap-4" style={{ backgroundColor: 'var(--button-bg)', borderColor: 'var(--window-border)' }}>
         <div className="flex items-center gap-4">
           <button
             onClick={navigateBack}
             disabled={currentPath.length <= 2}
             className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-gray-300 rounded text-sm transition-colors back-button"
           >
             ← Back
           </button>
         </div>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <List />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid2x2 />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex" style={{ height: `${size.height - 120}px` }}>
        {/* File List */}
        <div className="flex-1 p-4 overflow-y-auto file-explorer-content">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading files...</div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => openFile(file)}
                  onDoubleClick={() => {
                    if (!file.isDirectory && file.extension && ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(file.extension)) {
                      openFile(file);
                    }
                  }}
                  className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors file-item"
                >
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <span className="text-lg">{getFileIcon(file)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-300 font-medium truncate">{file.name}</div>
                    <div className="text-gray-500 text-sm">
                      {file.isDirectory ? 'Folder' : `${formatFileSize(file.size || 0)} • ${formatDate(file.lastModified)}`}
                    </div>
                  </div>
                  {!file.isDirectory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="ml-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-base rounded transition-colors min-w-[40px] min-h-[36px]"
                      title="Download file"
                    >
                      ↓
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => openFile(file)}
                  onDoubleClick={() => {
                    if (!file.isDirectory && file.extension && ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(file.extension)) {
                      openFile(file);
                    }
                  }}
                  className="flex flex-col items-center p-4 hover:bg-gray-800 rounded cursor-pointer transition-colors file-grid-item file-item"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <span className="text-3xl">{getFileIcon(file)}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-center truncate w-full" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-gray-500 text-xs text-center">
                    {file.isDirectory ? 'Folder' : formatFileSize(file.size || 0)}
                  </div>
                  {!file.isDirectory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="mt-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-base rounded transition-colors min-w-[80px] min-h-[36px]"
                      title="Download file"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="w-80 border-l border-gray-700 p-4 bg-gray-800">
            <div className="mb-4">
              <h3 className="text-gray-300 font-medium text-lg mb-2">{selectedFile.name}</h3>
              <div className="text-gray-500 text-sm space-y-1">
                <div>Type: {getFileType(selectedFile.extension || '')}</div>
                <div>Size: {formatFileSize(selectedFile.size || 0)}</div>
                <div>Modified: {formatDate(selectedFile.lastModified)}</div>
                <div className="truncate" title={selectedFile.path}>
                  Path: {selectedFile.path}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm transition-colors"
                >
                  Download File
                </button>
              </div>
              
              <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto">
                {contentLoading ? (
                  <div className="text-gray-400 text-center py-8">
                    <div className="text-sm">Loading file content...</div>
                  </div>
                ) : imagePreview ? (
                  <div className="flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt={selectedFile.name}
                      className="max-w-full max-h-56 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-gray-400 text-center py-8">
                      <div className="text-4xl mb-2">{getFileIcon(selectedFile)}</div>
                      <div className="text-sm">Image could not be loaded</div>
                    </div>
                  </div>
                ) : fileContent ? (
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {fileContent}
                  </pre>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    <div className="text-4xl mb-2">{getFileIcon(selectedFile)}</div>
                    <div className="text-sm">
                      {selectedFile.isDirectory ? 'Folder' : 
                       selectedFile.extension && ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go'].includes(selectedFile.extension) ? 
                       'Click to view content' : 
                       selectedFile.extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(selectedFile.extension) ?
                       'Click to view image' :
                       'Click download to get this file'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div 
        className="resize-handle resize-bottom-right"
        onMouseDown={handleResizeMouseDown}
      ></div>
    </div>
  );
};

export default RealFileExplorer;
