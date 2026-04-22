/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Library as LibraryIcon, Timer as TimerIcon, Settings, Github, BookOpen, User as UserIcon, Shield, Search } from 'lucide-react';
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
import { Book, ReadingSession, UserStats, QuizQuestion } from './types';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { generateQuiz, generateBookChapters, generateNextChapter } from './lib/gemini';

const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    totalPages: 180,
    currentPage: 0,
    status: 'reading',
    genre: 'Philosophy',
    addedAt: Date.now(),
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [
      { 
        title: 'Book II', 
        content: `Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil. But I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, and of the nature of him who does wrong, that it is akin to me, not only of the same blood or seed, but that it participates in the same intelligence and the same portion of the divinity, I can neither be injured by any of them, for no one can fix on me what is ugly, nor can I be angry with my kinsman, nor hate him. For we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another then is contrary to nature; and it is acting against one another to be vexed and to turn away.\n\nWhatever this is that I am, it is a little flesh and breath, and the ruling part. Throw away thy books; no longer distract thyself: it is not allowed; but as if thou wast now dying, despise the flesh; it is corruption and blood and a network of nerves and veins, of arteries. See also what breath is, a windy puff, and not always the same, but every moment sent out and again sucked in. The third then is the ruling part: consider thus: Thou art an old man; no longer let this be a slave, no longer be pulled by the strings like a puppet to unsocial movements, no longer either be dissatisfied with thy present lot, or shrink from the future.` 
      },
      {
        title: 'Book III',
        content: `We ought to observe also that even the things which follow after the things which are produced according to nature contain something pleasing and attractive. For instance, when bread is baked some parts are split at the surface, and these parts which thus open, and have a certain fashion contrary to the purpose of the baker's art, are beautiful in a manner, and in a peculiar way excite a desire for eating. And again, figs, when they are quite ripe, gape open; and in the ripe olives the very circumstance of their being near to rottenness adds a peculiar beauty to the fruit. And the ears of corn bending down, and the lion's eyebrows, and the foam which flows from the mouth of wild boars, and many other things—though they are far from being beautiful, if a man should examine them severally—still, because they follow the things which are formed by nature, help to adorn them, and they please the mind; so that if a man should have a feeling and deeper insight with respect to the things which are produced in the universe, there is hardly one of those which follow by way of consequence which will not seem to him to be in a manner disposed so as to give pleasure.`
      }
    ]
  },
  {
    id: '2',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    totalPages: 212,
    currentPage: 45,
    status: 'reading',
    genre: 'Science',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastReadAt: Date.now() - 1000 * 60 * 60 * 2,
    coverUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [
      { 
        title: 'Chapter 1: Our Picture of the Universe', 
        content: `A well-known scientist (some say it was Bertrand Russell) once gave a public lecture on astronomy. He described how the earth orbits around the sun and how the sun, in turn, orbits around the center of a vast collection of stars called our galaxy. At the end of the lecture, a little old lady at the back of the room stood up and said: "What you have told us is rubbish. The world is really a flat plate supported on the back of a giant tortoise." The scientist gave a superior smile before replying, "What is the tortoise standing on?" "You're very clever, young man, very clever," said the old lady. "But it's turtles all the way down!"\n\nMost people would find the picture of our universe as an infinite tower of tortoises rather ridiculous, but why do we think we know better? What do we know about the universe, and how do we know it? Where did the universe come from, and where is it going? Did the universe have a beginning, and if so, what happened before then? What is the nature of time? Will it ever come to an end? Recent breakthroughs in physics, made possible in part by fantastic new technologies, suggest answers to some of these longstanding questions. Someday these answers may seem as obvious to us as the earth orbiting the sun - or perhaps as ridiculous as a tower of tortoises. Only time (whatever that may be) will tell.` 
      },
      { 
        title: 'Chapter 2: Space and Time', 
        content: 'Our present ideas about the motion of bodies date back to Galileo and Newton. Before them people believed Aristotle, who said that the natural state of a body was to be at rest and that it moved only if driven by a force or impulse. It followed that a heavy body should fall faster than a light one, because it would have a greater pull toward the earth. The Aristotelian tradition also held that one could work out all the laws that govern the universe by pure thought: it was not necessary to check by observation. So no one until Galileo ever bothered to see whether bodies of different weight did actually fall at different speeds.' 
      }
    ]
  },
  {
    id: '3',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    totalPages: 240,
    currentPage: 0,
    status: 'queue',
    genre: 'Philosophy',
    addedAt: Date.now(),
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300',
    chapters: [
      {
        title: 'Chapter I: Prejudices of Philosophers',
        content: `The Will to Truth, which is to tempt us to many a hazardous enterprise, the famous Truthfulness of which all philosophers have hitherto spoken with veneration, what questions has this Will to Truth not laid before us! What strange, perplexing, questionable questions! It is already a long story; yet it seems as if it were hardly begun. Is it any wonder if we at last grow distrustful, lose patience, and turn impatiently away? That this Sphinx teaches us at last to ask questions ourselves, who is it really that puts questions to us here? What really is this "Will to Truth" in us? In fact we made a long halt at the question as to the origin of this Will—until at last we came to an absolute standstill before a yet more fundamental question. We inquired about the value of this Will. Granted that we want the truth: why not rather untruth? And uncertainty? Even ignorance? The problem of the value of truth presented itself before us—or was it we who presented ourselves before the problem? Which of us is the Oedipus here? Which the Sphinx? It would seem to be a rendezvous of questions and notes of interrogation.`
      }
    ]
  }
];

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
  currentStreak: 4,
  totalHoursRead: 12.5,
  totalBooksCompleted: 1,
  points: 750,
  profile: {
    name: 'Olufunmi K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olufunmi&backgroundColor=14161c',
    bio: 'Avid reader and explorer of hidden histories. Always looking for the next scholarly adventure.',
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    rank: 'Scholar',
    isAdmin: true
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'timer' | 'profile' | 'admin'>('dashboard');
  const [activeBookId, setActiveBookId] = useState<string | undefined>(books.find(b => b.status === 'reading')?.id);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [selectedVisualText, setSelectedVisualText] = useState('');
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Tracking for reading session within reader
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [readerPagesRead, setReaderPagesRead] = useState(0);
  
  // Quiz State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [pendingSession, setPendingSession] = useState<{ duration: number; pages: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('readally_books', JSON.stringify(books));
    localStorage.setItem('readally_sessions', JSON.stringify(sessions));
    localStorage.setItem('readally_stats', JSON.stringify(stats));
  }, [books, sessions, stats]);

  const activeBook = books.find(b => b.id === activeBookId) || null;

  const handleAddBook = (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      ...newBookData,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
  };

  const handleAddRecommended = (book: Book) => {
    if (books.some(b => b.title === book.title)) return;
    const newBook: Book = { ...book, id: Math.random().toString(36).substr(2, 9), addedAt: Date.now(), isRecommended: false, status: 'reading' };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
    handleOpenReader(newBook.id);
  };

  const [digitizingBookId, setDigitizingBookId] = useState<string | null>(null);

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

  const finalizeSession = (durationSeconds: number, pagesRead: number, quizScore: number) => {
    if (!activeBookId) return;

    let sessionPoints = Math.floor(durationSeconds / 60) * 10;
    if (quizScore === quizQuestions.length && quizQuestions.length > 0) {
      sessionPoints *= 2; // Double points for 100% score
    }

    const newSession: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: activeBookId,
      startTime: Date.now() - durationSeconds * 1000,
      durationSeconds,
      pagesRead,
    };

    setSessions(prev => [...prev, newSession]);
    setBooks(prev => prev.map(book => 
      book.id === activeBookId 
        ? { 
            ...book, 
            currentPage: Math.min(book.currentPage + pagesRead, book.totalPages),
            status: (book.currentPage + (pagesRead || 0)) >= book.totalPages ? 'completed' : 'reading',
            lastReadAt: Date.now()
          } 
        : book
    ));

    setStats(prev => ({
      ...prev,
      totalHoursRead: prev.totalHoursRead + (durationSeconds / 3600),
      points: prev.points + sessionPoints,
      totalBooksCompleted: prev.totalBooksCompleted + (activeBook && (activeBook.currentPage + pagesRead >= activeBook.totalPages) ? 1 : 0),
    }));

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
                  Mastering your library — Points: <span className="text-brand-accent">{Math.floor(stats.points)}</span>
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
