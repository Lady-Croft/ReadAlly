import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Book as BookIcon, Target, Award, Calendar, Bookmark, CheckCircle, Clock, LogOut } from 'lucide-react';
import { Book, UserStats } from '../types';
import { supabase } from '../lib/supabase';
import { getRankFromPoints } from '../lib/scoring';

interface ProfileProps {
  stats: UserStats;
  books: Book[];
  onSelectBook: (book: Book) => void;
  userEmail?: string;
}

export const Profile: React.FC<ProfileProps> = ({ stats, books, onSelectBook, userEmail }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  const currentRank = getRankFromPoints(stats.points || 0);
  const completedBooks = books.filter(b => b.status === 'completed');
  const savedBooks = books.filter(b => b.status === 'wishlist' || b.status === 'queue');
  const currentlyReading = books.filter(b => b.status === 'reading');
  
  const user = stats.profile || {
    name: 'Alexander Reed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander&backgroundColor=14161c',
    bio: 'Curating a library of history and science. Always chasing the next great narrative.',
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    rank: 'Scholar'
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header / Profile Info */}
      <div className="relative mb-12">
        <div className="h-32 w-full bg-brand-paper border border-brand-border rounded-sm overflow-hidden opacity-30">
           <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-transparent" />
        </div>
        
        <div className="px-8 -mt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-sm bg-brand-bg border-4 border-brand-bg shadow-2xl overflow-hidden">
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-accent text-brand-bg p-2 rounded-sm shadow-lg">
               <Award size={16} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h1 className="serif text-3xl font-light tracking-tight">{userEmail || user.name}</h1>
            <div className="flex gap-2">
              <span className="inline-block px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] uppercase tracking-widest font-bold rounded-sm">
                {currentRank}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-brand-muted text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 transition-all cursor-pointer"
              >
                <LogOut size={12} />
                Log Out
              </button>
            </div>
          </div>
            <p className="text-brand-muted text-sm serif italic max-w-md">{user.bio}</p>
          </div>
          
          <div className="flex gap-4 mb-2">
            <div className="text-center px-6 py-3 bg-brand-paper border border-brand-border rounded-sm">
               <div className="text-[10px] uppercase tracking-widest font-bold text-brand-muted mb-1">Points</div>
               <div className="text-2xl font-light text-brand-accent tabular-nums">{Math.floor(stats.points || 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="md:col-span-2 space-y-12">
          {/* Section: Currently Reading */}
          <section>
            <div className="flex items-center gap-3 mb-6">
               <BookIcon size={18} className="text-brand-accent" />
               <h3 className="serif text-xl uppercase tracking-widest font-light opacity-80">Currently Reading</h3>
            </div>
            
            <div className="grid gap-4">
              {currentlyReading.length === 0 ? (
                <div className="p-8 text-center border border-brand-border border-dashed rounded-sm opacity-20">
                   <p className="serif text-sm">No active volumes at the moment.</p>
                </div>
              ) : (
                currentlyReading.map(book => (
                  <motion.div 
                    key={book.id}
                    whileHover={{ x: 5 }}
                    onClick={() => onSelectBook(book)}
                    className="flex items-center gap-4 bg-brand-paper p-4 border border-brand-accent/30 rounded-sm group cursor-pointer shadow-lg shadow-pink-500/5 transition-all"
                  >
                    <div className="w-12 h-16 bg-black border border-brand-border rounded-sm overflow-hidden flex-shrink-0">
                       <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="serif text-lg leading-tight truncate">{book.title}</h4>
                       <p className="text-[10px] uppercase tracking-widest text-brand-muted truncate italic">{book.author}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] uppercase tracking-widest font-bold text-brand-accent flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                         Active Now
                       </div>
                       <button className="text-[10px] font-bold text-white/40 group-hover:text-brand-accent transition-colors underline-offset-4 hover:underline">Read Entry</button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Section: Reading Legacy */}
          <section>
            <div className="flex items-center gap-3 mb-6">
               <CheckCircle size={18} className="text-brand-accent" />
               <h3 className="serif text-xl uppercase tracking-widest font-light opacity-80">Reading Legacy</h3>
            </div>
            
            <div className="grid gap-4">
              {completedBooks.length === 0 ? (
                <div className="p-12 text-center border border-brand-border border-dashed rounded-sm opacity-20">
                   <p className="serif">No archived works yet.</p>
                </div>
              ) : (
                completedBooks.map(book => (
                  <motion.div 
                    key={book.id}
                    whileHover={{ x: 5 }}
                    onClick={() => onSelectBook(book)}
                    className="flex items-center gap-4 bg-brand-paper p-4 border border-brand-border rounded-sm group cursor-pointer hover:border-brand-accent/20 transition-all"
                  >
                    <div className="w-12 h-16 bg-black border border-brand-border rounded-sm overflow-hidden flex-shrink-0">
                       <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="serif text-lg leading-tight truncate">{book.title}</h4>
                       <p className="text-[10px] uppercase tracking-widest text-brand-muted truncate italic">{book.author}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] uppercase tracking-widest font-bold text-brand-accent">Completed</div>
                       <div className="text-[10px] text-brand-muted">{book.totalPages} Pages</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Section: Saved for Later */}
          <section>
            <div className="flex items-center gap-3 mb-6">
               <Bookmark size={18} className="text-brand-accent" />
               <h3 className="serif text-xl uppercase tracking-widest font-light opacity-80">Saved for Later</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedBooks.length === 0 ? (
                <div className="col-span-full p-8 text-center border border-brand-border border-dashed rounded-sm opacity-20">
                   <p className="serif text-sm italic">The collection is waiting for your selection.</p>
                </div>
              ) : (
                savedBooks.map(book => (
                  <motion.div 
                    key={book.id}
                    whileHover={{ y: -5 }}
                    onClick={() => onSelectBook(book)}
                    className="bg-brand-paper border border-brand-border rounded-sm overflow-hidden group cursor-pointer hover:border-brand-accent/20 transition-all"
                  >
                    <div className="aspect-[2/3] bg-black relative">
                       <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-70 transition-all" referrerPolicy="no-referrer" />
                       <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/80 text-[8px] uppercase tracking-widest font-bold text-white/50 border border-white/10 rounded-sm">
                             {book.genre || 'Queue'}
                          </span>
                       </div>
                    </div>
                    <div className="p-3">
                       <h4 className="serif text-sm truncate opacity-80">{book.title}</h4>
                       <p className="text-[9px] uppercase tracking-widest text-brand-muted truncate mt-1 italic">{book.author}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
           {/* Section Stats Summary */}
           <div className="bg-brand-paper border border-brand-border p-6 rounded-sm space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent text-center border-b border-white/5 pb-4">Activity Insights</h4>
              
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-sm bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <Trophy size={18} />
                 </div>
                 <div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-muted">Points Progress</div>
                    <div className="text-lg font-light tabular-nums">{Math.floor(stats.points || 0).toLocaleString()} XP</div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-sm bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <BookIcon size={18} />
                 </div>
                 <div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-muted">Books Finished</div>
                    <div className="text-lg font-light tabular-nums">{(stats.totalBooksCompleted || 0)} Volumes</div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-sm bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <Clock size={18} />
                 </div>
                 <div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-muted">Total Reading</div>
                    <div className="text-lg font-light tabular-nums">{(stats.totalHoursRead || 0).toFixed(1)} Hours</div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-sm bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <Target size={18} />
                 </div>
                 <div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-muted">Daily Streak</div>
                    <div className="text-lg font-light tabular-nums">{(stats.currentStreak || 0)} Days</div>
                 </div>
              </div>
           </div>

           <div className="bg-brand-accent/5 border border-brand-accent/10 p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-4 text-brand-accent">
                 <Calendar size={14} />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Archives Entry</span>
              </div>
              <p className="text-xs text-brand-ink/60 italic leading-relaxed">
                Ally since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. 
                Keep building your ivory tower of knowledge.
              </p>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full mt-8 flex items-center justify-center gap-3 py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm transition-all group"
           >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold">Terminate Session</span>
           </button>
        </div>
      </div>
    </div>
  );
};
