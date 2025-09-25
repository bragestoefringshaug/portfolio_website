"use client";

import { useState, useEffect, useRef } from "react";

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
      // Maximize to full screen
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    }
  };

  const handleClose = () => {
    // Clear terminal content when closing
    setCommandHistory([]);
    setOutputHistory([]);
    setHistoryIndex(-1);
    setCurrentCommand("");
    setIsClosed(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  // Selection area functionality
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    // Only start selection if clicking on background (not on terminal or shortcut)
    if (!(e.target as HTMLElement).closest('.terminal-window') && 
        !(e.target as HTMLElement).closest('.desktop-shortcut')) {
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
    setIsSelecting(false);
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


  return (
    <div 
      className={`min-h-screen text-purple-400 font-mono relative wallpaper-bg ${isSelecting ? 'selecting' : ''}`}
      onMouseDown={handleSelectionMouseDown}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-overlay"></div>
      
      {/* Selection Area */}
      {isSelecting && (
        <div
          className="absolute border-2 border-purple-400 pointer-events-none z-30"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
          }}
        />
      )}
      
          {/* Desktop Shortcut - always visible */}
          <div className="fixed top-8 left-8 z-40 desktop-shortcut">
            <div 
              className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center space-y-3 group shadow-lg"
              onClick={() => {
                setIsClosed(false);
                setIsMinimized(false);
              }}
              title="Open Terminal"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <div className="text-purple-400 text-3xl font-mono">{'>'}</div>
              </div>
              <span className="text-sm text-gray-300 text-center font-medium">Terminal</span>
            </div>
          </div>

          {/* Music Player Widget - top right */}
          <div className="fixed top-8 right-8 z-40">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700" style={{ padding: '10px' }}>
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
                  className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors"
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
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Lofi Hip Hop</div>
                    <div className="text-gray-400 text-xs">24/7 Stream</div>
                  </div>
                  {/* Soundwave Animation */}
                  {isMusicPlaying && (
                    <div className="flex items-center space-x-1" style={{ height: '20px', alignItems: 'flex-end', paddingLeft: '10px' }}>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '0ms', height: '12px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '150ms', height: '16px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '300ms', height: '8px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '450ms', height: '20px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '600ms', height: '14px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '750ms', height: '18px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '900ms', height: '10px' }}></div>
                      <div className="w-1 bg-purple-400 rounded-full soundwave-bar" style={{ animationDelay: '1050ms', height: '12px' }}></div>
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
      
      {/* Minimized state - show small bar */}
      {isMinimized && !isClosed ? (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div 
            className="bg-gray-800 rounded-lg px-6 py-3 cursor-pointer hover:bg-gray-700 transition-colors flex items-center space-x-3 shadow-lg"
            onClick={handleRestore}
          >
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-base font-medium">terminal</span>
          </div>
        </div>
      ) : !isClosed && (
        /* Draggable Terminal Window */
        <div
        ref={terminalRef}
        className={`fixed bg-gray-900 rounded-lg shadow-2xl border border-gray-700 terminal-window ${
          isDragging ? 'cursor-grabbing dragging' : 'cursor-move'
        }`}
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
        <div className="terminal-header bg-gray-800 rounded-t-lg px-4 py-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-1"></div>
            <div 
              className="w-4 h-4 bg-red-500 rounded-full cursor-pointer hover:bg-red-400 transition-colors flex items-center justify-center group relative"
              onClick={handleClose}
              title="Close"
            >
              <span className="text-red-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</span>
            </div>
            <div 
              className="w-4 h-4 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center group relative"
              onClick={handleMinimize}
              title="Minimize"
            >
              <span className="text-yellow-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </div>
            <div 
              className="w-4 h-4 bg-green-500 rounded-full cursor-pointer hover:bg-green-400 transition-colors flex items-center justify-center group relative"
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <span className="text-green-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {isMaximized ? "⧉" : "□"}
              </span>
            </div>
          </div>
          <span className="text-gray-300 text-sm font-medium">
            terminal
          </span>
          <div className="w-16"></div>
        </div>

            {/* Terminal Body */}
            <div 
              className="terminal-body bg-gray-900 rounded-b-lg p-6 overflow-y-auto relative"
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
    </div>
  );
}
