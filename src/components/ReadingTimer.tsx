import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer as TimerIcon, Image as ImageIcon, Book as BookIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDuration } from '../lib/utils';
import { Book } from '../types';

interface TimerProps {
  activeBook: Book | null;
  onSessionComplete: (durationSeconds: number, pagesRead: number) => void;
  onOpenVisualizer?: (text?: string) => void;
  onProgressUpdate: (pages: number) => void;
}

export const ReadingTimer: React.FC<TimerProps> = ({ activeBook, onSessionComplete, onOpenVisualizer, onProgressUpdate }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showPagesInput, setShowPagesInput] = useState(false);
  const [pagesRead, setPagesRead] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 10) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelection(null);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleStop = () => {
    setIsActive(false);
    setShowPagesInput(true);
  };

  const handleComplete = () => {
    onSessionComplete(seconds, pagesRead);
    setSeconds(0);
    setPagesRead(0);
    setShowPagesInput(false);
  };

  const handleNextChapter = () => {
    if (activeBook?.chapters && currentChapterIndex < activeBook.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setPagesRead(prev => prev + 5);
      onProgressUpdate(5);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  if (!activeBook) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-brand-paper rounded-3xl border border-brand-accent/10 shadow-sm">
        <TimerIcon className="w-12 h-12 text-brand-muted mb-4 opacity-50" />
        <h3 className="serif text-xl font-medium mb-2">Ready to read?</h3>
        <p className="text-brand-muted text-sm max-w-xs">Select a book from your library to start a timed reading session.</p>
      </div>
    );
  }

  const currentChapter = activeBook.chapters?.[currentChapterIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Perspective Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Timer & Controls */}
        <div className="lg:col-span-4 sticky top-8 space-y-6">
          <div className="glass p-6 rounded-sm border border-brand-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-14 bg-black rounded-sm overflow-hidden flex-shrink-0 border border-brand-border">
                {activeBook.coverUrl ? (
                  <img src={activeBook.coverUrl} alt={activeBook.title} className="w-full h-full object-cover opacity-50 grayscale" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-accent/30 font-serif text-lg">
                    {activeBook.title[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="serif text-sm tracking-tight opacity-90 truncate max-w-[150px]">{activeBook.title}</h3>
                <p className="text-brand-muted text-[8px] uppercase tracking-widest font-medium mt-1 truncate">{activeBook.author}</p>
              </div>
            </div>

            <div className="text-center py-8 border-t border-white/5">
              <div className="serif text-5xl font-light tabular-nums text-brand-ink mb-2">
                {formatDuration(seconds)}
              </div>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold text-brand-accent">Session Timer</p>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
              {!showPagesInput ? (
                <>
                  {!isActive ? (
                    <button
                      onClick={() => setIsActive(true)}
                      className="w-12 h-12 rounded-full bg-brand-accent text-brand-bg flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <Play className="fill-current" size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsActive(false)}
                      className="w-12 h-12 rounded-full border border-brand-accent bg-brand-accent text-brand-bg flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                    >
                      <Pause className="fill-current" size={16} />
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center hover:bg-white/5 transition-all hover:scale-105"
                  >
                    <Square size={16} />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {isActive && onOpenVisualizer && (
            <button
              onClick={onOpenVisualizer}
              className="w-full glass p-4 rounded-sm border border-pink-500/20 text-pink-500 flex items-center justify-center gap-3 transition-all hover:bg-pink-500/10"
            >
              <ImageIcon size={18} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Generate Visual Context</span>
            </button>
          )}

          {showPagesInput && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-sm border border-brand-accent/20 space-y-6"
            >
              <div className="text-center">
                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-accent mb-4 block">
                  Archive Progress (Pages)
                </label>
                <input
                  type="number"
                  value={pagesRead || ''}
                  onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-b border-brand-accent/40 py-2 text-center serif text-4xl focus:outline-none focus:border-brand-accent transition-colors text-brand-ink"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <button
                onClick={handleComplete}
                className="w-full bg-brand-accent text-brand-bg py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-brand-accent/90 transition-colors"
              >
                Commit to Archive
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Column: Book Content */}
        <div className="lg:col-span-8">
          <div 
            className="glass p-8 md:p-12 rounded-sm border border-brand-border min-h-[600px] shadow-2xl relative overflow-hidden"
            onMouseUp={handleMouseUp}
          >
            {!isActive && !showPagesInput && (
              <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-8">
                 <Play className="text-brand-accent opacity-20 mb-6" size={64} />
                 <h4 className="serif text-2xl mb-2">The focus layer is paused</h4>
                 <p className="text-brand-muted text-sm max-w-xs mb-8">Click play to resume your scholarly journey and unlock the hidden text.</p>
                 <button 
                  onClick={() => setIsActive(true)}
                  className="bg-brand-accent text-brand-bg px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em]"
                 >
                   Start Focus Session
                 </button>
              </div>
            )}
            
            <AnimatePresence>
              {selection && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ 
                    position: 'fixed', 
                    left: selection.x, 
                    top: selection.y, 
                    transform: 'translateX(-50%) translateY(-100%)' 
                  }}
                  className="z-[60] bg-brand-accent text-brand-bg px-4 py-2 rounded-sm shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    if (onOpenVisualizer) onOpenVisualizer(selection.text);
                    setSelection(null);
                  }}
                >
                  <Sparkles className="animate-pulse" size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Illustrate Selection</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {currentChapter ? (
                <motion.div
                  key={currentChapterIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="border-b border-white/5 pb-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-bold block mb-2">Chapter {currentChapterIndex + 1}</span>
                    <h1 className="serif text-3xl tracking-tight opacity-90">{currentChapter.title}</h1>
                  </div>
                  
                  <div className="serif text-lg leading-relaxed text-brand-ink/70 space-y-8 first-letter:text-5xl first-letter:font-bold first-letter:text-brand-accent first-letter:mr-3 first-letter:float-left select-text">
                    {currentChapter.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-12 mt-12 border-t border-white/5">
                    <button
                      disabled={currentChapterIndex === 0}
                      onClick={handlePrevChapter}
                      className="text-[10px] uppercase tracking-widest font-bold text-brand-muted disabled:opacity-20 hover:text-brand-accent transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                      {currentChapterIndex + 1} / {activeBook.chapters?.length}
                    </span>
                    <button
                      disabled={currentChapterIndex === (activeBook.chapters?.length || 0) - 1}
                      onClick={handleNextChapter}
                      className="text-[10px] uppercase tracking-widest font-bold text-brand-muted disabled:opacity-20 hover:text-brand-accent transition-colors"
                    >
                      Next Chapter
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                   <div className="relative mb-6">
                     <BookIcon size={48} className="text-brand-muted" />
                     <motion.div 
                       animate={{ opacity: [0.2, 1, 0.2] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute inset-0 flex items-center justify-center text-brand-accent"
                     >
                       <Sparkles size={24} />
                     </motion.div>
                   </div>
                   <h4 className="serif text-xl mb-2">Awaiting Archive Restoration</h4>
                   <p className="text-brand-muted text-sm max-w-xs">
                     The digital contents for this volume are currently being retrieved from the universal archive.
                   </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
