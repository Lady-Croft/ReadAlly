import React from 'react';
import { Plus, BookOpen, CheckCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { getProgressPercentage } from '../lib/utils';
import { motion } from 'motion/react';

interface LibraryProps {
  books: Book[];
  recommendations: Book[];
  onAddBook: () => void;
  onSelectBook: (book: Book) => void;
  onAddRecommended: (book: Book) => void;
  onDigitize: (bookId: string) => void;
  digitizingBookId: string | null;
  activeBookId?: string;
}

export const Library: React.FC<LibraryProps> = ({ 
  books, 
  recommendations, 
  onAddBook, 
  onSelectBook, 
  onAddRecommended, 
  onDigitize,
  digitizingBookId,
  activeBookId 
}) => {
  const sections = [
    { title: 'Currently Reading', status: 'reading', icon: BookOpen },
    { title: 'To Read', status: 'wishlist', icon: Clock },
    { title: 'Completed', status: 'completed', icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="serif text-2xl uppercase tracking-widest font-light opacity-80">Library</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20">
             <p className="serif text-lg italic">The archives are currently empty.</p>
          </div>
        ) : (
          books.map((book) => {
            const progress = getProgressPercentage(book.currentPage, book.totalPages);
            return (
              <motion.div
                key={book.id}
                layoutId={book.id}
                onClick={() => onSelectBook(book)}
                className={`group relative bg-brand-paper p-5 rounded-sm border transition-all cursor-pointer ${
                  activeBookId === book.id 
                    ? 'border-brand-accent shadow-2xl' 
                    : 'border-brand-border hover:border-brand-accent/40 shadow-sm'
                }`}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-24 bg-black border border-brand-border rounded-sm overflow-hidden flex-shrink-0 shadow-sm group-hover:-translate-y-1 transition-transform">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-accent/20 font-serif text-2xl">
                        {book.title[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-accent mb-1 block">
                      {book.genre || (book.status === 'reading' ? 'Active' : book.status === 'completed' ? 'Archived' : 'Queue')}
                    </span>
                    <h3 className="serif text-lg leading-tight truncate mb-1 opacity-90">{book.title}</h3>
                    <p className="text-brand-muted text-[10px] uppercase tracking-widest truncate italic mb-2">{book.author}</p>
                    {book.chapters && book.chapters.length > 0 ? (
                      <span className="text-[8px] font-bold text-brand-accent uppercase tracking-tighter border border-brand-accent/20 px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-fit">
                        <CheckCircle size={8} />
                        Digital Edition Available
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDigitize(book.id);
                        }}
                        disabled={digitizingBookId === book.id}
                        className="text-[8px] font-bold text-brand-muted uppercase tracking-tighter border border-brand-border px-1.5 py-0.5 rounded-sm hover:border-brand-accent/40 hover:text-brand-accent transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {digitizingBookId === book.id ? (
                          <>
                            <Loader2 size={8} className="animate-spin text-brand-accent" />
                            <span>Digitizing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={8} className="text-brand-accent" />
                            <span>Make Digitally Available</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-white/5 relative">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-brand-muted font-medium group-hover:opacity-0 transition-opacity">
                    <span>{progress}% Progress</span>
                    <span>{book.currentPage} / {book.totalPages}</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/10 overflow-hidden group-hover:opacity-0 transition-opacity">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-brand-accent"
                    />
                  </div>
                  
                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent flex items-center gap-2">
                        <BookOpen size={12} />
                        Read Now
                     </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Recommended Section */}
      <div className="mt-16 pt-12 border-t border-white/5">
        <div className="flex items-center gap-3 mb-8">
           <Plus size={20} className="text-brand-accent" />
           <h3 className="serif text-xl uppercase tracking-widest font-light opacity-80">Discovery Archive</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -5 }}
              className="bg-brand-paper p-5 rounded-sm border border-brand-border hover:border-brand-accent/30 transition-all group"
            >
               <div className="flex gap-4">
                  <div className="w-16 h-24 bg-black border border-brand-border rounded-sm overflow-hidden flex-shrink-0">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-80 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-muted mb-1 block">
                       {book.genre}
                     </span>
                     <h4 className="serif text-base leading-tight truncate mb-1 opacity-90">{book.title}</h4>
                     <p className="text-brand-muted text-[10px] uppercase tracking-widest truncate italic mb-4">{book.author}</p>
                     
                     <button
                       onClick={() => onAddRecommended(book)}
                       className="text-[9px] uppercase tracking-widest font-bold text-brand-accent hover:underline decoration-1 underline-offset-4"
                     >
                        + Add to Archive
                     </button>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
