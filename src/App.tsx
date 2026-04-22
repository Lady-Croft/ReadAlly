/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Library as LibraryIcon, Timer as TimerIcon, Settings, Github, BookOpen, User as UserIcon, Shield, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { ReadingTimer } from './components/ReadingTimer';
import { QuizComponent } from './components/QuizComponent';
import { VisualContextModal } from './components/VisualContextModal';
import { Reader } from './components/Reader';
import { Profile } from './components/Profile';
import { AdminPortal } from './components/AdminPortal';
import { SearchPortal } from './components/SearchPortal';
import { Book, ReadingSession, UserStats, QuizQuestion, LeaderboardEntry } from './types';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { generateQuiz, generateBookChapters, generateNextChapter } from './lib/gemini';
import { Session } from '@supabase/supabase-js';

const INITIAL_BOOKS: Book[] = [];

const RECOMMENDED_BOOKS: Book[] = [
  {
    id: 'r1',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    totalPages: 443,
    currentPage: 0,
    status: 'queue',
    genre: 'History',
    addedAt: Date.now(),
    isRecommended: true,
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [{ title: 'The Cognitive Revolution', content: 'About 70,000 years ago, organisms belonging to the species Homo sapiens started to form even more elaborate structures called cultures. The subsequent development of these human cultures is called history.' }]
  },
  {
    id: 'r2',
    title: 'The Gene',
    author: 'Siddhartha Mukherjee',
    totalPages: 592,
    currentPage: 0,
    status: 'queue',
    genre: 'Science',
    addedAt: Date.now(),
    isRecommended: true,
    coverUrl: 'https://images.unsplash.com/photo-1532187875605-1ef6c016b149?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [{ title: 'Prologue', content: 'In 2012, I visited a family in South India whose members had been affected by a mysterious and devastating mental illness that seemed to jump across generations like a phantom.' }]
  },
  {
    id: 'r3',
    title: '1984',
    author: 'George Orwell',
    totalPages: 328,
    currentPage: 0,
    status: 'queue',
    genre: 'Literature',
    addedAt: Date.now(),
    isRecommended: true,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [{ title: 'Part 1, Chapter 1', content: 'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.' }]
  },
  {
    id: 'r4',
    title: 'The Silk Roads',
    author: 'Peter Frankopan',
    totalPages: 656,
    currentPage: 0,
    status: 'queue',
    genre: 'History',
    addedAt: Date.now(),
    isRecommended: true,
    coverUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [{ title: 'Introduction', content: 'From the beginning of time, the centre of Asia has been where empires were made. The region between the Mediterranean and the Pacific, where the sun rises, has always been the pivot of the world.' }]
  },
  {
    id: 'r5',
    title: 'Cosmos',
    author: 'Carl Sagan',
    totalPages: 365,
    currentPage: 0,
    status: 'queue',
    genre: 'Science',
    addedAt: Date.now(),
    isRecommended: true,
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [{ title: 'The Shores of the Cosmic Ocean', content: 'The Cosmos is all that is or ever was or ever shall be. Our feeblest contemplations of the Cosmos stir us—there is a tingling in the spine, a catch in the voice, a faint sensation, as if a distant memory, of falling from a height.' }]
  }
];

const INITIAL_STATS: UserStats = {
  dailyGoalMinutes: 30,
  currentStreak: 0,
  totalHoursRead: 0,
  totalBooksCompleted: 0,
  points: 0,
  profile: {
    name: 'New Scholar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Archivist&backgroundColor=14161c',
    bio: 'Commencing the scholarly journey into the digital archives.',
    joinedAt: Date.now(),
    rank: 'Initiate',
    isAdmin: false
  }
};

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('readally_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });
  const [sessions, setSessions] = useState<ReadingSession[]>(() => {
    const saved = localStorage.getItem('readally_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('readally_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'timer' | 'profile' | 'admin'>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeBookId, setActiveBookId] = useState<string | undefined>(books.find(b => b.status === 'reading')?.id);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [selectedVisualText, setSelectedVisualText] = useState('');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [digitizingBookId, setDigitizingBookId] = useState<string | null>(null);

  // Tracking for reading session within reader
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [readerPagesRead, setReaderPagesRead] = useState(0);
  
  // Quiz State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [pendingSession, setPendingSession] = useState<{ duration: number; pages: number } | null>(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem('readally_books', JSON.stringify(books));
      localStorage.setItem('readally_sessions', JSON.stringify(sessions));
      localStorage.setItem('readally_stats', JSON.stringify(stats));
      
      // Update profile in background - added error handling to prevent silent sync failures
      supabase.from('profiles').update({
        daily_goal_minutes: stats.dailyGoalMinutes,
        current_streak: stats.currentStreak,
        total_hours_read: stats.totalHoursRead,
        total_books_completed: stats.totalBooksCompleted,
        points: stats.points,
        name: stats.profile?.name,
        bio: stats.profile?.bio,
        avatar: stats.profile?.avatar
      }).eq('id', session.user.id).then();
    }
  }, [books, sessions, stats, session]);

  const syncUserData = async (currentSession: Session | null) => {
    if (!currentSession) {
      setBooks(INITIAL_BOOKS);
      setSessions([]);
      setStats(INITIAL_STATS);
      return;
    }

    try {
      // Fetch Profile/Stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (profileData) {
        setStats({
          dailyGoalMinutes: profileData.daily_goal_minutes,
          currentStreak: profileData.current_streak,
          totalHoursRead: profileData.total_hours_read,
          totalBooksCompleted: profileData.total_books_completed,
          points: profileData.points,
          profile: {
            name: profileData.name,
            avatar: profileData.avatar,
            bio: profileData.bio,
            joinedAt: new Date(profileData.created_at).getTime(),
            rank: profileData.rank,
            isAdmin: profileData.is_admin
          }
        });
      } else if (profileError?.code === 'PGRST116') {
        // Profile not found - Create initial profile
        try {
          const newProfile = {
            id: currentSession.user.id,
            name: currentSession.user.email?.split('@')[0] || 'Scholar',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSession.user.id}&backgroundColor=14161c`,
            bio: 'A new scholar in the archives.',
            daily_goal_minutes: 30,
            current_streak: 0,
            total_hours_read: 0,
            total_books_completed: 0,
            points: 0,
            rank: 'Initiate'
          };
          await supabase.from('profiles').insert(newProfile);
          setStats({
            ...INITIAL_STATS,
            profile: {
              ...INITIAL_STATS.profile!,
              name: newProfile.name,
              avatar: newProfile.avatar,
              joinedAt: Date.now()
            }
          });
        } catch (insertErr) {
          console.error("Failed to create profile:", insertErr);
        }
      }

      // Fetch Books
      try {
        const { data: booksData } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', currentSession.user.id);
        
        if (booksData && booksData.length > 0) {
          setBooks(booksData.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            totalPages: b.total_pages,
            currentPage: b.current_page,
            coverUrl: b.cover_url,
            status: b.status,
            addedAt: new Date(b.created_at).getTime(),
            genre: b.genre,
            chapters: b.chapters
          })));
        }
      } catch (e) { console.error("Books fetch failed:", e); }

      // Fetch Sessions
      try {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', currentSession.user.id);
        
        if (sessionsData) {
          setSessions(sessionsData.map(s => ({
            id: s.id,
            bookId: s.book_id,
            startTime: new Date(s.start_time).getTime(),
            durationSeconds: s.duration_seconds,
            pages_read: s.pages_read
          })));
        }
      } catch (e) { console.error("Sessions fetch failed:", e); }

      // Fetch Leaderboard (Real Users)
      try {
        const { data: leaderboardData } = await supabase
          .from('profiles')
          .select('id, name, points, avatar, rank')
          .order('points', { ascending: false })
          .limit(10);
        
        if (leaderboardData) {
          setLeaderboard(leaderboardData.map(p => ({
            name: p.name || 'Anonymous Scholar',
            points: p.points || 0,
            avatar: p.avatar,
            rankText: p.rank || 'Initiate',
            isMe: currentSession.user.id === p.id
          })));
        }
      } catch (e) { console.error("Leaderboard fetch failed:", e); }
    } catch (err) {
      console.error("User data sync failed:", err);
    }
  };

  useEffect(() => {
    // Check for a hidden "reset" flag to help return to signup and wipe local data
    if (window.location.search.includes('reset=true')) {
      localStorage.removeItem('readally_books');
      localStorage.removeItem('readally_sessions');
      localStorage.removeItem('readally_stats');
      supabase.auth.signOut().then(() => {
        window.location.href = window.location.pathname;
      });
    }

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession) await syncUserData(currentSession);
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setSession(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) await syncUserData(newSession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" size={32} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const activeBook = books.find(b => b.id === activeBookId) || null;

  const handleAddBook = async (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const bookId = Math.random().toString(36).substr(2, 9);
    const newBook: Book = {
      ...newBookData,
      id: bookId,
      addedAt: Date.now(),
    };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);

    if (session) {
      await supabase.from('books').insert({
        id: bookId,
        user_id: session.user.id,
        title: newBookData.title,
        author: newBookData.author,
        total_pages: newBookData.totalPages,
        current_page: 0,
        status: newBookData.status,
        cover_url: newBookData.coverUrl,
        genre: newBookData.genre,
        chapters: newBookData.chapters
      });
    }
  };

  const handleAddRecommended = (book: Book) => {
    if (books.some(b => b.title === book.title)) return;
    const newBook: Book = { ...book, id: Math.random().toString(36).substr(2, 9), addedAt: Date.now(), isRecommended: false, status: 'reading' };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
    handleOpenReader(newBook.id);
  };

  const handleDigitize = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || (book.chapters && book.chapters.length > 0)) return;

    setDigitizingBookId(bookId);
    try {
      const initialChapters = await generateBookChapters(book.title, book.author);
      setBooks(prev => prev.map(b => 
        b.id === bookId 
        ? { ...b, chapters: initialChapters } 
        : b
      ));
    } catch (err) {
      console.error("Digitization failed:", err);
    } finally {
      setDigitizingBookId(null);
    }
  };

  const handleOpenReader = async (bookId: string) => {
    setActiveBookId(bookId);
    const book = books.find(b => b.id === bookId);
    
    setSessionStartTime(Date.now());
    setReaderPagesRead(0);
    setIsReaderOpen(true);

    // If book has no chapters (from search discovery), generate initial chapters
    if (book && (!book.chapters || book.chapters.length === 0)) {
       const initialChapters = await generateBookChapters(book.title, book.author);
       setBooks(prev => prev.map(b => 
         b.id === bookId 
         ? { ...b, chapters: initialChapters } 
         : b
       ));
    }
  };

  const handleCloseReader = () => {
    if (sessionStartTime && activeBookId) {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      if (durationSeconds > 10) { // Only log sessions longer than 10 seconds
        handleSessionComplete(durationSeconds, readerPagesRead);
      }
    }
    setIsReaderOpen(false);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async (durationSeconds: number, pagesRead: number) => {
    if (!activeBookId || !activeBook) return;

    if (durationSeconds === 0 && pagesRead === 0) {
      handleOpenReader(activeBookId);
      return;
    }

    setPendingSession({ duration: durationSeconds, pages: pagesRead });
    setLoadingQuiz(true);
    
    const questions = await generateQuiz(activeBook.title, activeBook.author);
    if (questions && questions.length > 0) {
      setQuizQuestions(questions);
      setIsQuizMode(true);
    } else {
      // Fallback if quiz generation fails
      finalizeSession(durationSeconds, pagesRead, 0);
    }
    setLoadingQuiz(false);
  };

  const finalizeSession = async (durationSeconds: number, pagesRead: number, quizScore: number) => {
    if (!activeBookId || !session) return;

    let sessionPoints = Math.floor(durationSeconds / 60) * 10;
    if (quizScore === quizQuestions.length && quizQuestions.length > 0) {
      sessionPoints *= 2; // Double points for 100% score
    }

    const sessionId = Math.random().toString(36).substr(2, 9);
    const newSession: ReadingSession = {
      id: sessionId,
      bookId: activeBookId,
      startTime: Date.now() - durationSeconds * 1000,
      durationSeconds,
      pagesRead,
    };

    setSessions(prev => [...prev, newSession]);
    
    // Update local state first
    const updatedBooks = books.map(book => 
      book.id === activeBookId 
        ? { 
            ...book, 
            currentPage: Math.min(book.currentPage + pagesRead, book.totalPages),
            status: (book.currentPage + (pagesRead || 0)) >= book.totalPages ? 'completed' as const : 'reading' as const,
            lastReadAt: Date.now()
          } 
        : book
    );
    setBooks(updatedBooks);

    setStats(prev => ({
      ...prev,
      totalHoursRead: prev.totalHoursRead + (durationSeconds / 3600),
      points: prev.points + sessionPoints,
      totalBooksCompleted: prev.totalBooksCompleted + (activeBook && (activeBook.currentPage + pagesRead >= activeBook.totalPages) ? 1 : 0),
    }));

    // Persist session to Supabase
    await supabase.from('sessions').insert({
      id: sessionId,
      user_id: session.user.id,
      book_id: activeBookId,
      duration_seconds: durationSeconds,
      pages_read: pagesRead,
      start_time: new Date(newSession.startTime).toISOString()
    });

    // Update book progress in Supabase
    const updatedBook = updatedBooks.find(b => b.id === activeBookId);
    if (updatedBook) {
      await supabase.from('books').update({
        current_page: updatedBook.currentPage,
        status: updatedBook.status,
        last_read_at: new Date(updatedBook.lastReadAt!).toISOString()
      }).eq('id', activeBookId);
    }

    setIsQuizMode(false);
    setPendingSession(null);
    setQuizQuestions([]);
    setActiveTab('dashboard');
  };

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'search', label: 'Discover', icon: Search },
    { id: 'library', label: 'Shelves', icon: LibraryIcon },
    { id: 'timer', label: 'Read', icon: TimerIcon },
    { id: 'profile', label: 'Ally', icon: UserIcon },
    ...(stats.profile?.isAdmin ? [{ id: 'admin', label: 'Curate', icon: Shield }] : [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20">
      {/* ... Navigation ... */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-paper md:h-screen md:w-20 border-t md:border-t-0 md:border-r border-brand-border md:flex flex-col items-center py-8 z-40 hidden md:flex">
        <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center mb-12 shadow-lg shadow-pink-500/20">
           <BookOpen size={24} />
        </div>
        <div className="flex flex-col gap-8 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!isQuizMode) setActiveTab(tab.id as any);
              }}
              disabled={isQuizMode}
              className={cn(
                "p-3 rounded-2xl transition-all hover:bg-white/5",
                activeTab === tab.id ? "text-brand-accent scale-110" : "text-brand-muted",
                isQuizMode && "opacity-20 cursor-not-allowed"
              )}
            >
              <tab.icon size={24} />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-6 text-brand-muted opacity-40">
           <button className="hover:text-brand-accent transition-colors"><Settings size={22} /></button>
           <button className="hover:text-brand-accent transition-colors"><Github size={22} /></button>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-paper border-t border-brand-border flex items-center justify-around px-4 z-40 md:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (!isQuizMode) setActiveTab(tab.id as any);
            }}
            disabled={isQuizMode}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeTab === tab.id ? "text-brand-accent" : "text-brand-muted",
              isQuizMode && "opacity-20 cursor-not-allowed"
            )}
          >
            <tab.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-12">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="md:hidden w-10 h-10 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20">
                <BookOpen size={20} />
             </div>
             <div>
                <h1 className="serif text-4xl md:text-5xl tracking-[0.05em] font-bold text-brand-ink">
                  Read<span className="text-brand-accent">Ally</span>
                </h1>
                <p className="text-brand-muted font-medium text-[10px] uppercase tracking-[0.25em] mt-1">
                  Mastering your library — Points: <span className="text-brand-accent">{Math.floor(stats.points || 0)}</span>
                </p>
             </div>
          </div>
          {!isQuizMode && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                 <div className="text-[10px] uppercase tracking-widest font-bold text-brand-muted leading-none mb-1">Rank</div>
                 <div className="text-lg font-light serif text-brand-accent tabular-nums uppercase">Silver IV</div>
              </div>
              <div className="h-10 w-[1px] bg-brand-border" />
              <div className="w-10 h-10 rounded-full bg-brand-paper border border-brand-border flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Olufunmi&backgroundColor=14161c`} alt="avatar" />
              </div>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {loadingQuiz ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
               <div className="w-16 h-16 border-t-2 border-brand-accent rounded-full animate-spin mb-6" />
               <h3 className="serif text-xl mb-2">Preparing your challenge...</h3>
               <p className="text-brand-muted text-xs uppercase tracking-widest">Generating AI Quiz based on your reading</p>
            </motion.div>
          ) : isQuizMode ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
               <h2 className="serif text-3xl mb-8">Session Reflection</h2>
               <QuizComponent
                  questions={quizQuestions}
                  onComplete={(score) => {
                    if (pendingSession) finalizeSession(pendingSession.duration, pendingSession.pages, score);
                  }}
                  potentialPoints={Math.floor((pendingSession?.duration || 0) / 60) * 10}
               />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  sessions={sessions} 
                  activeBook={activeBook}
                  leaderboard={leaderboard}
                  onResumeReading={() => activeBook && handleOpenReader(activeBook.id)}
                />
              )}
              {activeTab === 'search' && (
                <SearchPortal 
                  onAddBook={(book) => {
                    setBooks(prev => [...prev, book]);
                    setActiveTab('library');
                  }} 
                  existingBooks={books} 
                />
              )}
              {activeTab === 'library' && (
                <Library
                  books={books}
                  recommendations={RECOMMENDED_BOOKS}
                  digitizingBookId={digitizingBookId}
                  onDigitize={handleDigitize}
                  onSelectBook={(book) => {
                    if (book.chapters) {
                      handleOpenReader(book.id);
                    } else {
                      setActiveBookId(book.id);
                      setActiveTab('timer');
                    }
                  }}
                  onAddRecommended={handleAddRecommended}
                  activeBookId={activeBookId}
                />
              )}
              {activeTab === 'timer' && (
                <div className="max-w-4xl mx-auto">
                   <h2 className="serif text-3xl mb-8">Focus Session</h2>
                   <ReadingTimer
                      activeBook={activeBook}
                      onSessionComplete={handleSessionComplete}
                      onOpenVisualizer={(text) => {
                        if (text) setSelectedVisualText(text);
                        setIsVisualizerOpen(true);
                      }}
                      onProgressUpdate={(pages) => setReaderPagesRead(prev => prev + pages)}
                   />
                </div>
              )}
              {activeTab === 'profile' && (
                <Profile 
                  stats={stats} 
                  books={books} 
                  userEmail={session?.user?.email}
                  onSelectBook={(book) => {
                    if (book.chapters) {
                      handleOpenReader(book.id);
                    } else {
                      setActiveBookId(book.id);
                      setActiveTab('timer');
                    }
                  }}
                />
              )}
              {activeTab === 'admin' && (
                <AdminPortal 
                  onAddBook={(book) => setBooks(prev => [...prev, book])}
                  existingBooks={books}
                  onDeleteBook={(id) => setBooks(prev => prev.filter(b => b.id !== id))}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {activeBook && (
        <VisualContextModal
          isOpen={isVisualizerOpen}
          onClose={() => {
            setIsVisualizerOpen(false);
            setSelectedVisualText('');
          }}
          bookTitle={activeBook.title}
          bookAuthor={activeBook.author}
          initialDescription={selectedVisualText}
        />
      )}

      {isReaderOpen && activeBook && (
        <Reader
          book={activeBook}
          onClose={handleCloseReader}
          onProgressUpdate={(pages) => setReaderPagesRead(prev => prev + pages)}
          onVisualContextRequest={(text) => {
            setSelectedVisualText(text);
            setIsVisualizerOpen(true);
          }}
          onEndReached={async () => {
            const nextChapter = await generateNextChapter(activeBook.title, activeBook.author, activeBook.chapters?.[activeBook.chapters.length - 1]?.title || 'Unknown');
            if (nextChapter) {
              setBooks(prev => prev.map(b => 
                b.id === activeBook.id 
                ? { ...b, chapters: [...(b.chapters || []), nextChapter] } 
                : b
              ));
            }
          }}
        />
      )}
    </div>
  );
}
