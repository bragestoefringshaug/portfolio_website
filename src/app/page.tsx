"use client";

import { useState, useEffect, useRef } from "react";
import RealFileExplorer from "./components/RealFileExplorer";
import SettingsPanel from "./components/SettingsPanel";
import { soundManager } from "./utils/sounds";

export default function Home() {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [originalSize, setOriginalSize] = useState({ width: 800, height: 600 });
  const [originalPosition, setOriginalPosition] = useState({ x: 50, y: 50 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [showVideo, setShowVideo] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false);
  const [fileExplorerPosition, setFileExplorerPosition] = useState({ x: 100, y: 100 });
  const [fileExplorerSize, setFileExplorerSize] = useState({ width: 800, height: 600 });
  const [isFileExplorerMinimized, setIsFileExplorerMinimized] = useState(false);
  const [isFileExplorerMaximized, setIsFileExplorerMaximized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsPosition, setSettingsPosition] = useState({ x: 200, y: 150 });
  const [settingsSize, setSettingsSize] = useState({ width: 400, height: 500 });
  const [isSettingsMinimized, setIsSettingsMinimized] = useState(false);
  const [isSettingsMaximized, setIsSettingsMaximized] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [shortcutPositions, setShortcutPositions] = useState({
    terminal: { x: 32, y: 32 },
    fileExplorer: { x: 128, y: 32 },
    settings: { x: 224, y: 32 }
  });
  const [draggingShortcut, setDraggingShortcut] = useState<string | null>(null);
  const [shortcutDragOffset, setShortcutDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [selectedShortcuts, setSelectedShortcuts] = useState<Set<string>>(new Set());
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionDragOffset, setSelectionDragOffset] = useState({ x: 0, y: 0 });
  const [hasMultiDragged, setHasMultiDragged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Commands for the terminal
  const commands = {
    help: `Available commands:
  about     - Learn about me
  projects  - View my projects
  skills    - See my technical skills
  contact   - Get in touch
  hobbies   - My interests and activities
  files     - Open file explorer
  secret  - Are you brave enough to discover the secret?
  date      - Current date and time
  clear     - Clear the terminal
  exit      - Close the terminal`,
    
    about: `Hello! My name is Brage and I am a developer. 
    I got my first computer when I was 6 years old and I fell in love with it.  
    Tinkering and creating things with it has been a passion of mine ever since.
    Now I'm looking to make a career doing what I love.`,
    
    projects: `Recent Projects (Details on Github):
  • Old Portfolio Website
  • Flicksy, Movie Recommendation App
  • Portfolio Website`,
    
    skills: `Technical Skills:
  Languages: Python, JavaScript, HTML
  Frontend: React, Next.js, Tailwind CSS
  Backend: Node.js
  Database: MongoDB, SPARQL, SQLite3
  Tools: Git, Docker
  Design: Figma, Photoshop`,
    
    contact: `Get in Touch:
  📧 Email: bragestoefringshaug@gmail.com
  💻 GitHub: github.com/bragestoefringshaug
  💼 LinkedIn: linkedin.com/in/brage-støfringshaug
  📸 Instagram: @bragesto`,
    
    hobbies: `My Hobbies & Interests:
    
  🎮 Gaming with friends
  💪 Strength Training
  💻 Coding
  `,
    
    files: () => {
      setIsFileExplorerOpen(true);
      if (soundEnabled) soundManager.playWindowOpen();
      return "File Explorer opened! Browse and download my portfolio files.";
    },
    settings: () => {
      setIsSettingsOpen(true);
      if (soundEnabled) soundManager.playWindowOpen();
      return "Settings opened! Customize your experience.";
    },
    
    secret: () => {
      setShowVideo(true);
    },
    
    closevideo: () => {
      setShowVideo(false);
      return "Video closed. Back to terminal!";
    },
    
    date: new Date().toLocaleString(),
    
    clear: () => {
      setCommandHistory([]);
      setOutputHistory([]);
      setHistoryIndex(-1);
      if (soundEnabled) soundManager.playClick();
      return "";
    },
    
    exit: () => {
      handleClose();
      return "Terminal closed. Goodbye!";
    },
  };

  const scrollToBottom = () => {
    if (terminalRef.current) {
      const terminalBody = terminalRef.current.querySelector('.terminal-body');
      if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd === "clear") {
      commands.clear();
      return;
    }

    if (trimmedCmd === "exit") {
      const result = commands.exit();
      if (typeof result === 'string') {
        setOutputHistory(prev => [...prev, result]);
      }
      return;
    }

    if (trimmedCmd === "secret") {
      const result = commands.secret();
      if (typeof result === 'string') {
        setOutputHistory(prev => [...prev, result]);
      }
      return;
    }

    if (trimmedCmd === "closevideo") {
      const result = commands.closevideo();
      if (typeof result === 'string') {
        setOutputHistory(prev => [...prev, result]);
      }
      return;
    }

    if (trimmedCmd === "hobbies") {
      setOutputHistory(prev => [...prev, commands.hobbies]);
      return;
    }

    if (trimmedCmd === "files") {
      const result = commands.files();
      if (typeof result === 'string') {
        setOutputHistory(prev => [...prev, result]);
      }
      return;
    }

    if (trimmedCmd in commands) {
      setOutputHistory(prev => [...prev, commands[trimmedCmd as keyof typeof commands] as string]);
    } else {
      setOutputHistory(prev => [...prev, `Command not found: ${cmd}. Type 'help' for available commands.`]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (currentCommand.trim()) {
        setCommandHistory(prev => [...prev, currentCommand]);
        handleCommand(currentCommand);
        setCurrentCommand("");
        setHistoryIndex(-1);
        // Scroll to bottom after command execution
        setTimeout(scrollToBottom, 100);
      }
    } else if (e.key === "Escape" && showVideo) {
      setShowVideo(false);
      setOutputHistory(prev => [...prev, "Video closed. Back to terminal!"]);
      // Scroll to bottom after closing video
      setTimeout(scrollToBottom, 100);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header, not from resize handle
    if ((e.target as HTMLElement).closest('.terminal-header') && 
        !(e.target as HTMLElement).closest('.resize-handle')) {
      setIsDragging(true);
      const rect = terminalRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && terminalRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep terminal within viewport bounds
      const maxX = window.innerWidth - terminalRef.current.offsetWidth;
      const maxY = window.innerHeight - terminalRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Center the terminal on double-click
    if (terminalRef.current) {
      const centerX = (window.innerWidth - terminalRef.current.offsetWidth) / 2;
      const centerY = (window.innerHeight - terminalRef.current.offsetHeight) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  };

  // Simple resize functionality (bottom-right only)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    if (terminalRef.current) {
      const rect = terminalRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && terminalRef.current) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(400, resizeStart.width + deltaX);
      const newHeight = Math.max(300, resizeStart.height + deltaY);

      // Keep within viewport bounds
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      setSize({ 
        width: Math.min(newWidth, maxWidth), 
        height: Math.min(newHeight, maxHeight) 
      });
    }
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  // Window control functions
  const handleMinimize = () => {
    setIsMinimized(true);
    if (soundEnabled) soundManager.playClick();
  };

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore to original size and position
      setSize(originalSize);
      setPosition(originalPosition);
      setIsMaximized(false);
    } else {
      // Save current size and position
      setOriginalSize(size);
      setOriginalPosition(position);
      // Maximize but leave space for taskbar and window controls
      const taskbarHeight = 60; // Height of the taskbar
      const margin = 20; // Margin from edges
      setSize({ 
        width: window.innerWidth - (margin * 2), 
        height: window.innerHeight - taskbarHeight - (margin * 2) 
      });
      setPosition({ x: margin, y: margin });
      setIsMaximized(true);
    }
    if (soundEnabled) soundManager.playClick();
  };

  const handleClose = () => {
    // Clear terminal content when closing
    setCommandHistory([]);
    setOutputHistory([]);
    setHistoryIndex(-1);
    setCurrentCommand("");
    setIsClosed(true);
    if (soundEnabled) soundManager.playWindowClose();
  };

  const handleRestore = () => {
    setIsMinimized(false);
    if (soundEnabled) soundManager.playWindowOpen();
  };

  // File Explorer handlers
  const handleFileExplorerMinimize = () => {
    setIsFileExplorerMinimized(true);
  };

  const handleFileExplorerMaximize = () => {
    if (isFileExplorerMaximized) {
      // Restore to original size and position
      setFileExplorerSize({ width: 800, height: 600 });
      setFileExplorerPosition({ x: 100, y: 100 });
      setIsFileExplorerMaximized(false);
    } else {
      // Maximize but leave space for taskbar and window controls
      const taskbarHeight = 60; // Height of the taskbar
      const margin = 20; // Margin from edges
      setFileExplorerSize({ 
        width: window.innerWidth - (margin * 2), 
        height: window.innerHeight - taskbarHeight - (margin * 2) 
      });
      setFileExplorerPosition({ x: margin, y: margin });
      setIsFileExplorerMaximized(true);
    }
    if (soundEnabled) soundManager.playClick();
  };

  // Settings handlers
  const handleSettingsMinimize = () => {
    setIsSettingsMinimized(true);
  };

  const handleSettingsMaximize = () => {
    if (isSettingsMaximized) {
      // Restore to original size and position
      setSettingsSize({ width: 400, height: 500 });
      setSettingsPosition({ x: 200, y: 150 });
      setIsSettingsMaximized(false);
    } else {
      // Maximize but leave space for taskbar and window controls
      const taskbarHeight = 60; // Height of the taskbar
      const margin = 20; // Margin from edges
      setSettingsSize({ 
        width: window.innerWidth - (margin * 2), 
        height: window.innerHeight - taskbarHeight - (margin * 2) 
      });
      setSettingsPosition({ x: margin, y: margin });
      setIsSettingsMaximized(true);
    }
    if (soundEnabled) soundManager.playClick();
  };

  // Shortcut drag handlers
  const handleShortcutMouseDown = (e: React.MouseEvent, shortcutType: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If this shortcut is part of a multi-selection, handle it as multi-drag
    if (selectedShortcuts.has(shortcutType) && selectedShortcuts.size > 1) {
      handleSelectedShortcutsMouseDown(e);
      return;
    }
    
    // Otherwise, handle as single shortcut drag
    setDraggingShortcut(shortcutType);
    setHasDragged(false);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setShortcutDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleShortcutMouseMove = (e: React.MouseEvent) => {
    if (draggingShortcut) {
      e.preventDefault();
      setHasDragged(true);
      const newX = e.clientX - shortcutDragOffset.x;
      const newY = e.clientY - shortcutDragOffset.y;
      
      setShortcutPositions(prev => ({
        ...prev,
        [draggingShortcut]: { x: newX, y: newY }
      }));
    }
  };

  const handleShortcutMouseUp = () => {
    setDraggingShortcut(null);
    // Reset hasDragged after a short delay to allow click detection
    setTimeout(() => setHasDragged(false), 100);
  };

  // Check if a shortcut is within the selection area
  const isShortcutInSelection = (shortcutType: string) => {
    if (!isSelecting) return false;
    
    const shortcutPos = shortcutPositions[shortcutType as keyof typeof shortcutPositions];
    const selectionLeft = Math.min(selectionStart.x, selectionEnd.x);
    const selectionTop = Math.min(selectionStart.y, selectionEnd.y);
    const selectionRight = Math.max(selectionStart.x, selectionEnd.x);
    const selectionBottom = Math.max(selectionStart.y, selectionEnd.y);
    
    // Check if shortcut center is within selection area (with some padding for the shortcut size)
    const shortcutCenterX = shortcutPos.x + 48; // 48px is half the shortcut width
    const shortcutCenterY = shortcutPos.y + 48; // 48px is half the shortcut height
    
    return shortcutCenterX >= selectionLeft && 
           shortcutCenterX <= selectionRight && 
           shortcutCenterY >= selectionTop && 
           shortcutCenterY <= selectionBottom;
  };

  // Handle selection end to select shortcuts
  const handleSelectionEnd = () => {
    if (isSelecting) {
      const newSelectedShortcuts = new Set<string>();
      
      // Check each shortcut
      ['terminal', 'fileExplorer', 'settings'].forEach(shortcutType => {
        if (isShortcutInSelection(shortcutType)) {
          newSelectedShortcuts.add(shortcutType);
        }
      });
      
      setSelectedShortcuts(newSelectedShortcuts);
    }
    setIsSelecting(false);
  };

  // Handle dragging selected shortcuts
  const handleSelectedShortcutsMouseDown = (e: React.MouseEvent) => {
    if (selectedShortcuts.size > 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingSelection(true);
      setSelectionDragOffset({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleSelectedShortcutsMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSelection && selectedShortcuts.size > 0) {
      e.preventDefault();
      setHasMultiDragged(true);
      const deltaX = e.clientX - selectionDragOffset.x;
      const deltaY = e.clientY - selectionDragOffset.y;
      
      setShortcutPositions(prev => {
        const newPositions = { ...prev };
        selectedShortcuts.forEach(shortcutType => {
          const currentPos = newPositions[shortcutType as keyof typeof newPositions];
          newPositions[shortcutType as keyof typeof newPositions] = {
            x: currentPos.x + deltaX,
            y: currentPos.y + deltaY
          };
        });
        return newPositions;
      });
      
      setSelectionDragOffset({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleSelectedShortcutsMouseUp = () => {
    setIsDraggingSelection(false);
    // Reset hasMultiDragged after a short delay to allow click detection
    setTimeout(() => setHasMultiDragged(false), 100);
  };

  // Selection area functionality
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    // Only start selection if clicking on background (not on terminal, shortcut, or file explorer)
    if (!(e.target as HTMLElement).closest('.terminal-window') && 
        !(e.target as HTMLElement).closest('.desktop-shortcut') &&
        !(e.target as HTMLElement).closest('.file-explorer-window') &&
        !(e.target as HTMLElement).closest('.settings-window')) {
      // Clear existing selection when starting new selection
      setSelectedShortcuts(new Set());
      setIsSelecting(true);
      setSelectionStart({ x: e.clientX, y: e.clientY });
      setSelectionEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSelectionMouseMove = (e: MouseEvent) => {
    if (isSelecting) {
      setSelectionEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSelectionMouseUp = () => {
    handleSelectionEnd();
    // Clear selection after a short delay
    setTimeout(() => {
      setSelectionStart({ x: 0, y: 0 });
      setSelectionEnd({ x: 0, y: 0 });
    }, 200);
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
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, resizeStart, position, handleResizeMouseMove, handleResizeMouseUp]);

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleSelectionMouseMove);
      document.addEventListener('mouseup', handleSelectionMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleSelectionMouseMove);
        document.removeEventListener('mouseup', handleSelectionMouseUp);
      };
    }
  }, [isSelecting, handleSelectionMouseMove, handleSelectionMouseUp]);

  // Auto-scroll to bottom when output history changes
  useEffect(() => {
    scrollToBottom();
  }, [outputHistory, showVideo]);


  // Handle loading state - simple timer
  useEffect(() => {
    if (isMusicLoading) {
      const timer = setTimeout(() => {
        setIsMusicLoading(false);
      }, 750); // .75 seconds

      return () => clearTimeout(timer);
    }
  }, [isMusicLoading]);

  // Add global mouse event listeners for shortcut dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingShortcut) {
        e.preventDefault();
        setHasDragged(true);
        const newX = e.clientX - shortcutDragOffset.x;
        const newY = e.clientY - shortcutDragOffset.y;
        
        setShortcutPositions(prev => ({
          ...prev,
          [draggingShortcut]: { x: newX, y: newY }
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      setDraggingShortcut(null);
      // Reset hasDragged after a short delay to allow click detection
      setTimeout(() => setHasDragged(false), 100);
    };

    if (draggingShortcut) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingShortcut, shortcutDragOffset]);

  // Add global mouse event listeners for selected shortcuts dragging
  useEffect(() => {
    const handleGlobalSelectedMouseMove = (e: MouseEvent) => {
      if (isDraggingSelection && selectedShortcuts.size > 0) {
        e.preventDefault();
        setHasMultiDragged(true);
        const deltaX = e.clientX - selectionDragOffset.x;
        const deltaY = e.clientY - selectionDragOffset.y;
        
        setShortcutPositions(prev => {
          const newPositions = { ...prev };
          selectedShortcuts.forEach(shortcutType => {
            const currentPos = newPositions[shortcutType as keyof typeof newPositions];
            newPositions[shortcutType as keyof typeof newPositions] = {
              x: currentPos.x + deltaX,
              y: currentPos.y + deltaY
            };
          });
          return newPositions;
        });
        
        setSelectionDragOffset({
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleGlobalSelectedMouseUp = () => {
      setIsDraggingSelection(false);
      // Reset hasMultiDragged after a short delay to allow click detection
      setTimeout(() => setHasMultiDragged(false), 100);
    };

    if (isDraggingSelection) {
      document.addEventListener('mousemove', handleGlobalSelectedMouseMove);
      document.addEventListener('mouseup', handleGlobalSelectedMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalSelectedMouseMove);
      document.removeEventListener('mouseup', handleGlobalSelectedMouseUp);
    };
  }, [isDraggingSelection, selectedShortcuts, selectionDragOffset]);


  return (
    <div 
      className={`min-h-screen text-purple-400 font-mono relative wallpaper-bg ${isSelecting ? 'selecting' : ''}`}
      data-theme={theme}
      onMouseDown={handleSelectionMouseDown}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-overlay"></div>
      
      {/* Selection Area */}
      {isSelecting && (
        <div
          className="absolute selection-area pointer-events-none z-30"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
          }}
        />
      )}
      
          {/* Desktop Shortcuts - always visible */}
          <div 
            className={`fixed z-40 desktop-shortcut ${draggingShortcut === 'terminal' ? 'dragging' : ''} ${selectedShortcuts.has('terminal') ? 'selected' : ''}`}
            style={{ 
              left: shortcutPositions.terminal.x, 
              top: shortcutPositions.terminal.y 
            }}
          >
            <div 
              className={`rounded-lg p-6 transition-colors flex flex-col items-center space-y-3 group shadow-lg ${
                isDraggingSelection ? 'cursor-grabbing' : 
                draggingShortcut === 'terminal' ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ backgroundColor: 'var(--shortcut-bg)' }}
              onMouseDown={(e) => handleShortcutMouseDown(e, 'terminal')}
              onClick={(e) => {
                if (!draggingShortcut && !hasDragged && !isDraggingSelection && !hasMultiDragged) {
                  if (isMinimized) {
                    // Restore if minimized
                    setIsMinimized(false);
                  } else {
                    // Open if closed
                    setIsClosed(false);
                    setIsMinimized(false);
                  }
                  if (soundEnabled) soundManager.playClick();
                }
              }}
              title="Open Terminal"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <div className="text-purple-400 text-3xl font-mono">{'>'}</div>
              </div>
              <span className="text-sm text-gray-300 text-center font-medium">Terminal</span>
            </div>
          </div>

          {/* File Explorer Shortcut */}
          <div 
            className={`fixed z-40 desktop-shortcut ${draggingShortcut === 'fileExplorer' ? 'dragging' : ''} ${selectedShortcuts.has('fileExplorer') ? 'selected' : ''}`}
            style={{ 
              left: shortcutPositions.fileExplorer.x, 
              top: shortcutPositions.fileExplorer.y 
            }}
          >
            <div 
              className={`rounded-lg p-6 transition-colors flex flex-col items-center space-y-3 group shadow-lg ${
                isDraggingSelection ? 'cursor-grabbing' : 
                draggingShortcut === 'fileExplorer' ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ backgroundColor: 'var(--shortcut-bg)' }}
              onMouseDown={(e) => handleShortcutMouseDown(e, 'fileExplorer')}
              onClick={(e) => {
                if (!draggingShortcut && !hasDragged && !isDraggingSelection && !hasMultiDragged) {
                  if (isFileExplorerMinimized) {
                    // Restore if minimized
                    setIsFileExplorerMinimized(false);
                  } else {
                    // Open if closed
                    setIsFileExplorerOpen(true);
                  }
                  if (soundEnabled) soundManager.playClick();
                }
              }}
              title="Open File Explorer"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <div className="text-yellow-400 text-3xl">📁</div>
              </div>
              <span className="text-sm text-gray-300 text-center font-medium">Files</span>
            </div>
          </div>

          {/* Settings Shortcut */}
          <div 
            className={`fixed z-40 desktop-shortcut ${draggingShortcut === 'settings' ? 'dragging' : ''} ${selectedShortcuts.has('settings') ? 'selected' : ''}`}
            style={{ 
              left: shortcutPositions.settings.x, 
              top: shortcutPositions.settings.y 
            }}
          >
            <div 
              className={`rounded-lg p-6 transition-colors flex flex-col items-center space-y-3 group shadow-lg ${
                isDraggingSelection ? 'cursor-grabbing' : 
                draggingShortcut === 'settings' ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ backgroundColor: 'var(--shortcut-bg)' }}
              onMouseDown={(e) => handleShortcutMouseDown(e, 'settings')}
              onClick={(e) => {
                if (!draggingShortcut && !hasDragged && !isDraggingSelection && !hasMultiDragged) {
                  if (isSettingsMinimized) {
                    // Restore if minimized
                    setIsSettingsMinimized(false);
                  } else {
                    // Open if closed
                    setIsSettingsOpen(true);
                  }
                  if (soundEnabled) soundManager.playClick();
                }
              }}
              title="Open Settings"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <div className="text-blue-400 text-3xl">⚙️</div>
              </div>
              <span className="text-sm text-gray-300 text-center font-medium">Settings</span>
            </div>
          </div>

          {/* Taskbar */}
          <div className="fixed bottom-0 left-0 right-0 taskbar z-50 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Terminal taskbar item */}
                {isMinimized && (
                  <button
                    onClick={handleRestore}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 flex items-center gap-2 transition-colors"
                    title="Restore Terminal"
                  >
                    <span className="text-purple-400"></span>
                    Terminal
                  </button>
                )}
                
                {/* File Explorer taskbar item */}
                {isFileExplorerMinimized && (
                  <button
                  onClick={() => {
                    setIsFileExplorerMinimized(false);
                    if (soundEnabled) soundManager.playWindowOpen();
                  }}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 flex items-center gap-2 transition-colors"
                    title="Restore File Explorer"
                  >
                    <span className="text-yellow-400">📁</span>
                    File Explorer
                  </button>
                )}
                
                {/* Settings taskbar item */}
                {isSettingsMinimized && (
                  <button
                  onClick={() => {
                    setIsSettingsMinimized(false);
                    if (soundEnabled) soundManager.playWindowOpen();
                  }}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 flex items-center gap-2 transition-colors"
                    title="Restore Settings"
                  >
                    <span className="text-blue-400">⚙️</span>
                    Settings
                  </button>
                )}
              </div>
              
              {/* System info */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Portfolio OS v1.0</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Music Player Widget - top right */}
          <div className="fixed top-8 right-8 z-40">
            <div className="music-widget rounded-lg shadow-lg" style={{ padding: '10px' }}>
              <div className="flex items-center" style={{ gap: '20px' }}>
                <button
                  onClick={() => {
                    if (!isMusicPlaying && !isMusicLoading) {
                      setIsMusicLoading(true);
                      setIsMusicPlaying(true);
                    } else if (isMusicPlaying) {
                      setIsMusicPlaying(false);
                      setIsMusicLoading(false);
                    }
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ 
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--background)'
                  }}
                  title={isMusicLoading ? "Loading..." : isMusicPlaying ? "Pause Music" : "Play Music"}
                  disabled={isMusicLoading}
                >
                  {isMusicLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isMusicPlaying ? (
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                  ) : (
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                  )}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="text-sm" style={{ color: 'var(--music-text)' }}>
                    <div className="font-medium">Lofi Hip Hop</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>24/7 Stream</div>
                  </div>
                  {/* Soundwave Animation */}
                  {isMusicPlaying && (
                    <div className="flex items-center space-x-1" style={{ height: '20px', alignItems: 'flex-end', paddingLeft: '10px' }}>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '0ms', height: '12px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '150ms', height: '16px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '300ms', height: '8px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '450ms', height: '20px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '600ms', height: '14px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '750ms', height: '18px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '900ms', height: '10px', backgroundColor: 'var(--foreground)' }}></div>
                      <div className="w-1 rounded-full soundwave-bar" style={{ animationDelay: '1050ms', height: '12px', backgroundColor: 'var(--foreground)' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Music Player */}
          {isMusicPlaying && (
            <iframe
              width="0"
              height="0"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&loop=1&playlist=jfKfPfyJRdk&enablejsapi=1"
              title="Lofi Hip Hop Radio"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'none' }}
            ></iframe>
          )}
      
      {!isClosed && (
        /* Draggable Terminal Window */
        <div
        ref={terminalRef}
        className={`fixed bg-gray-900 rounded-lg shadow-2xl border border-gray-700 terminal-window ${
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
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Terminal Header */}
        <div className="terminal-header rounded-t-lg px-4 py-2 flex items-center justify-between select-none" style={{ backgroundColor: 'var(--button-bg)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1"></div>
            <div 
              className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
              style={{ backgroundColor: '#dc2626' }}
              onClick={handleClose}
              title="Close"
            >
              <span className="text-red-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</span>
            </div>
            <div 
              className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
              style={{ backgroundColor: '#ca8a04' }}
              onClick={handleMinimize}
              title="Minimize"
            >
              <span className="text-yellow-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </div>
            <div 
              className="w-4 h-4 rounded-full cursor-pointer transition-colors flex items-center justify-center group relative"
              style={{ backgroundColor: '#16a34a' }}
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <span className="text-green-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {isMaximized ? "□" : "□"}
              </span>
            </div>
          </div>
          <span className="text-gray-300 text-sm font-medium">
            Terminal
          </span>
          <div className="w-16"></div>
        </div>

            {/* Terminal Body */}
            <div 
              className="terminal-body terminal-content rounded-b-lg p-6 overflow-y-auto relative"
              style={{ height: `${size.height - 60}px` }}
            >
          {/* Welcome Message */}
          <div className="mb-6">
            <div className="text-purple-400">
              <div className="text-lg font-bold">Brage Støfringshaug - Developer</div>
              <div className="mt-2 text-gray-400">Welcome to my terminal, have a look around!</div>
              <div className="mt-2">Type &apos;help&apos; to see available commands.</div>
              <div className="mt-4 text-gray-400">
                <div>Last login: {new Date().toLocaleString()}</div>
                <div className="mt-2">---</div>
              </div>
            </div>
          </div>

          {/* Command History and Output */}
          <div className="space-y-3 mb-6">
            {commandHistory.map((cmd, index) => (
              <div key={index}>
                <div className="text-pink-400">
                  <span className="text-purple-400">user@portfolio:~$ </span> {cmd}
                </div>
                    {outputHistory[index] && (
                      <div className="text-gray-300 ml-4 mt-2 whitespace-pre-line leading-relaxed">
                        {outputHistory[index].split(' ').map((word, wordIndex) => {
                          if (word.startsWith('http')) {
                            return (
                              <span key={wordIndex}>
                                <a 
                                  href={word} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-pink-400 underline cursor-pointer"
                                >
                                  {word}
                                </a>
                                {wordIndex < outputHistory[index].split(' ').length - 1 ? ' ' : ''}
                              </span>
                            );
                          }
                          return word + (wordIndex < outputHistory[index].split(' ').length - 1 ? ' ' : '');
                        })}
                      </div>
                    )}
              </div>
            ))}
          </div>

              {/* Rickroll Video */}
              {showVideo && (
                <div className="mb-6">
                  <div className="text-purple-400 mb-4">
                    🎵 Rick Astley - Never Gonna Give You Up 🎵
                  </div>
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                      title="Rick Astley - Never Gonna Give You Up"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    Press ESC or type &apos;closevideo&apos; to close the video
                  </div>
                </div>
              )}

              {/* Current Command Input */}
              <div className="flex items-center">
                <span className="text-purple-400">user@portfolio:~$</span>
                <div className="w-2"></div>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent text-purple-400 flex-1 outline-none"
                  placeholder=""
                  autoFocus
                />
                <span className="text-purple-400 cursor-blink">|</span>
              </div>
          
        </div>
        
        {/* Simple bottom-right resize handle - positioned outside scrollable area */}
        <div 
          className="resize-handle resize-bottom-right"
          onMouseDown={handleResizeMouseDown}
        ></div>
      </div>
      )}

      {/* Real File Explorer */}
      <RealFileExplorer
        isOpen={isFileExplorerOpen && !isFileExplorerMinimized}
        onClose={() => {
          setIsFileExplorerOpen(false);
        }}
        position={fileExplorerPosition}
        onPositionChange={setFileExplorerPosition}
        size={fileExplorerSize}
        onSizeChange={setFileExplorerSize}
        isMinimized={isFileExplorerMinimized}
        onMinimize={handleFileExplorerMinimize}
        isMaximized={isFileExplorerMaximized}
        onMaximize={handleFileExplorerMaximize}
      />

      <SettingsPanel
        isOpen={isSettingsOpen && !isSettingsMinimized}
        onClose={() => {
          setIsSettingsOpen(false);
        }}
        position={settingsPosition}
        onPositionChange={setSettingsPosition}
        size={settingsSize}
        onSizeChange={setSettingsSize}
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
        }}
        soundEnabled={soundEnabled}
        onSoundToggle={(enabled) => {
          setSoundEnabled(enabled);
          if (enabled) soundManager.playClick();
        }}
        isMinimized={isSettingsMinimized}
        onMinimize={handleSettingsMinimize}
        isMaximized={isSettingsMaximized}
        onMaximize={handleSettingsMaximize}
      />
    </div>
  );
}
