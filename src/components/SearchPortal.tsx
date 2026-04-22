import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Sparkles, Plus, BookOpen, Clock, Tag } from 'lucide-react';
import { Book } from '../types';
import { searchBooks } from '../lib/gemini';

interface SearchPortalProps {
  onAddBook: (book: Book) => void;
  existingBooks: Book[];
}

export const SearchPortal: React.FC<SearchPortalProps> = ({ onAddBook, existingBooks }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const books = await searchBooks(query);
      setResults(books);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (bookData: any) => {
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre,
      totalPages: bookData.totalPages,
      currentPage: 0,
      status: 'queue',
      addedAt: Date.now(),
      coverUrl: bookData.coverUrl,
      // For searching external books, we don't have chapters yet, 
      // but App.tsx will handle generating a prologue if read
    };
    onAddBook(newBook);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12 border-b border-brand-border pb-8">
        <h1 className="serif text-4xl mb-2">Universal Archive</h1>
        <p className="text-brand-muted text-xs uppercase tracking-widest font-bold">Discovery • Global Catalog Search</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-3 py-2">
          <Sparkles size={12} className="text-brand-accent" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">
            AI-generated book entries
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or genre..."
          className="w-full bg-brand-paper border border-brand-border rounded-sm py-6 pl-16 pr-32 outline-none focus:border-brand-accent transition-all serif text-xl"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-accent text-brand-bg px-6 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest disabled:opacity-50"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="space-y-12">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Sparkles size={48} className="text-brand-accent animate-pulse" />
            <p className="serif italic text-lg">Querying the global archives...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <p className="serif text-xl italic">No matching artifacts found in the known universe.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {results.map((book, idx) => {
                const isAlreadyAdded = existingBooks.some(b => b.title === book.title);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-brand-paper border border-brand-border p-6 rounded-sm hover:border-brand-accent/30 transition-all"
                  >
                    <div className="flex gap-6">
                      <div className="w-24 h-36 bg-black rounded-sm overflow-hidden flex-shrink-0 border border-brand-border shadow-2xl">
                        <img 
                          src={book.coverUrl} 
                          alt={book.title} 
                          className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                           <Tag size={10} className="text-brand-accent" />
                           <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-accent">{book.genre}</span>
                        </div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm border border-brand-border px-2 py-1">
                          <Sparkles size={10} className="text-brand-accent" />
                          <span className="text-[9px] uppercase tracking-widest text-brand-muted">AI generated</span>
                        </div>
                        <h3 className="serif text-xl mb-1 truncate">{book.title}</h3>
                        <p className="text-brand-muted text-[10px] uppercase tracking-widest mb-4 italic">{book.author}</p>
                        
                        <div className="flex items-center gap-4 text-brand-muted text-[10px] uppercase tracking-widest font-medium mb-4">
                           <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{book.totalPages} Pages</span>
                           </div>
                        </div>

                        <p className="text-[10px] text-brand-muted serif leading-relaxed line-clamp-2 mb-4 opacity-70">
                          {book.description}
                        </p>

                        <button
                          disabled={isAlreadyAdded}
                          onClick={() => handleAdd(book)}
                          className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
                            isAlreadyAdded 
                            ? 'text-green-500/50 cursor-default' 
                            : 'text-brand-accent hover:gap-3'
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <>
                              <BookOpen size={14} />
                              <span>In Library</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Request Edition</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
