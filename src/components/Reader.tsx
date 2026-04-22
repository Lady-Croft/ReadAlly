import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Book as BookIcon, X, Maximize2, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { cn } from '../lib/utils';

interface ReaderProps {
  book: Book;
  onClose: () => void;
  onProgressUpdate: (pagesRead: number) => void;
  onEndReached?: () => Promise<void>;
  onVisualContextRequest: (text: string) => void;
}

export const Reader: React.FC<ReaderProps> = ({ book, onClose, onProgressUpdate, onEndReached, onVisualContextRequest }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  const chapters = book.chapters && book.chapters.length > 0 ? book.chapters : null;
  const currentChapter = chapters ? chapters[currentChapterIndex] : null;

  const handleMouseUp = () => {
    if (!currentChapter) return;
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

  const handleNext = async () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(c => c + 1);
      onProgressUpdate(5);
    } else if (onEndReached) {
      setIsExpanding(true);
      await onEndReached();
      setIsExpanding(false);
      setCurrentChapterIndex(c => c + 1);
      onProgressUpdate(5);
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(c => c - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "fixed inset-0 z-50 bg-brand-bg flex flex-col transition-all",
        isFullscreen ? "p-0" : "p-4 md:p-8"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-10 bg-black border border-brand-border rounded-sm overflow-hidden flex-shrink-0">
            {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale opacity-50" />}
          </div>
          <div>
            <h2 className="serif text-lg opacity-90 leading-none">{book.title}</h2>
            <p className="text-[9px] uppercase tracking-widest text-brand-muted mt-1">{currentChapter.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-muted"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-muted"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 mb-20 scrollbar-hide"
        onMouseUp={handleMouseUp}
      >
        <AnimatePresence mode="wait">
          {!chapters ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-20"
            >
              <div className="relative mb-8">
                <BookIcon size={48} className="text-brand-accent/20" />
                <motion.div 
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center text-brand-accent"
                >
                  <Sparkles size={24} />
                </motion.div>
              </div>
              <h3 className="serif text-2xl mb-4 text-brand-accent">Restoring Digital Archive</h3>
              <p className="text-brand-muted text-sm max-w-xs leading-relaxed">
                We are currently reconstructuring the high-fidelity text blocks for this edition from the global archive.
              </p>
              <div className="mt-8 flex gap-2">
                 <div className="w-1 h-1 bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1 h-1 bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1 h-1 bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentChapterIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-12"
            >
              <h1 className="serif text-3xl mb-12 text-brand-accent tracking-tight border-b border-brand-border pb-4">
                {currentChapter?.title}
              </h1>
              <div className="serif text-xl leading-relaxed text-brand-ink/80 space-y-8 first-letter:text-5xl first-letter:font-bold first-letter:text-brand-accent first-letter:mr-3 first-letter:float-left select-text">
                {currentChapter?.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Selection Menu */}
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
              onVisualContextRequest(selection.text);
              setSelection(null);
            }}
          >
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Illustrate Selection</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-bg/80 backdrop-blur-md border-t border-brand-border py-6 px-8 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            disabled={currentChapterIndex === 0}
            onClick={handlePrev}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-muted disabled:opacity-20 hover:text-brand-accent transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-muted opacity-40">
              {chapters ? `${currentChapterIndex + 1} / ${chapters.length}` : 'Initializing...'}
            </span>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: chapters ? `${((currentChapterIndex + 1) / chapters.length) * 100}%` : '0%' }}
                 className="h-full bg-brand-accent"
               />
            </div>
          </div>

          <button
            disabled={!chapters || isExpanding}
            onClick={handleNext}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-muted disabled:opacity-20 hover:text-brand-accent transition-colors group"
          >
            {isExpanding ? (
              <>
                <Loader2 size={16} className="animate-spin text-brand-accent" />
                <span className="text-brand-accent">Archiving...</span>
              </>
            ) : (
              <>
                <span className="group-hover:mr-2 transition-all">
                  {!chapters ? 'Digitizing...' : currentChapterIndex === chapters.length - 1 ? 'Expand Story' : 'Next'}
                </span>
                {chapters && currentChapterIndex === chapters.length - 1 ? <Sparkles size={16} className="text-brand-accent" /> : <ChevronRight size={16} />}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
