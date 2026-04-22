export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl?: string;
  status: 'reading' | 'completed' | 'wishlist' | 'queue';
  addedAt: number;
  lastReadAt?: number;
  genre?: 'History' | 'Science' | 'Literature' | 'Philosophy' | 'Biography';
  isRecommended?: boolean;
  chapters?: { title: string; content: string }[];
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: number;
  durationSeconds: number;
  pagesRead: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  joinedAt: number;
  rank: string;
  isAdmin?: boolean;
}

export interface UserStats {
  dailyGoalMinutes: number;
  currentStreak: number;
  totalHoursRead: number;
  totalBooksCompleted: number;
  points: number;
  profile?: UserProfile;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  bookId: string;
  questions: QuizQuestion[];
}
