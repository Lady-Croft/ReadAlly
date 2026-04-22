import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Trophy, Calendar, BookOpen, Clock, Star, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Book, UserStats, ReadingSession } from '../types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: UserStats;
  sessions: ReadingSession[];
  activeBook: Book | null;
  onResumeReading: () => void;
}

const LEADERBOARD_DATA = {
  daily: [
    { name: 'Sarah J.', points: 1250, rank: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=14161c' },
    { name: 'Julian V.', points: 1100, rank: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian&backgroundColor=14161c' },
    { name: 'Elena R.', points: 950, rank: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=14161c' },
    { name: 'You', points: 750, rank: 4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olufunmi&backgroundColor=14161c', isMe: true },
    { name: 'Marcus K.', points: 620, rank: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=14161c' },
  ],
  weekly: [
    { name: 'Julian V.', points: 8400, rank: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian&backgroundColor=14161c' },
    { name: 'Elena R.', points: 7900, rank: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=14161c' },
    { name: 'You', points: 5250, rank: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olufunmi&backgroundColor=14161c', isMe: true },
    { name: 'Sarah J.', points: 4100, rank: 4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=14161c' },
    { name: 'David W.', points: 3800, rank: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=14161c' },
  ]
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, sessions, activeBook, onResumeReading }) => {
  const [lbType, setLbType] = useState<'daily' | 'weekly'>('daily');

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
    const minutes = Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
    return {
      name: format(date, 'EEE'),
      minutes,
      date,
    };
  });

  const cards = [
    { label: 'Total Points', value: Math.floor(stats.points), icon: Star, color: 'text-brand-accent' },
    { label: 'Current Streak', value: `${stats.currentStreak} d`, icon: Flame, color: 'text-brand-accent' },
    { label: 'Hours Read', value: `${Math.round(stats.totalHoursRead * 10) / 10}h`, icon: Clock, color: 'opacity-60' },
    { label: 'Completed', value: stats.totalBooksCompleted, icon: Trophy, color: 'opacity-60' },
  ];

  const currentLeaderboard = lbType === 'daily' ? LEADERBOARD_DATA.daily : LEADERBOARD_DATA.weekly;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-card glass p-5 rounded-sm border border-brand-border shadow-2xl">
            <card.icon className={`${card.color} mb-3`} size={24} strokeWidth={card.label === 'Total Points' ? 2 : 1.5} />
            <div className="text-2xl font-light serif leading-none mb-1 text-brand-ink">{card.value}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-muted">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-7 bg-card p-8 rounded-sm border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="serif text-xl tracking-widest uppercase font-light opacity-80">Reading Flow</h3>
              <p className="text-brand-muted text-[10px] uppercase tracking-widest mt-1">Activity over 7 days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500, letterSpacing: '0.1em' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#14161C', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="minutes" radius={[2, 2, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 6 ? '#EC4899' : 'rgba(255,255,255,0.05)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-5 bg-card p-8 rounded-sm border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="serif text-xl tracking-widest uppercase font-light opacity-80">Leaderboard</h3>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setLbType('daily')}
                  className={cn("text-[9px] uppercase tracking-widest font-bold", lbType === 'daily' ? "text-brand-accent pb-1 border-b border-brand-accent" : "text-brand-muted")}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setLbType('weekly')}
                  className={cn("text-[9px] uppercase tracking-widest font-bold", lbType === 'weekly' ? "text-brand-accent pb-1 border-b border-brand-accent" : "text-brand-muted")}
                >
                  Weekly
                </button>
              </div>
            </div>
            <Users size={20} className="text-brand-muted opacity-40" />
          </div>

          <div className="space-y-4">
            {currentLeaderboard.map((user, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-sm border border-transparent transition-all",
                  user.isMe ? "bg-brand-accent/5 border-brand-accent/20" : "hover:bg-white/5"
                )}
              >
                <div className="w-6 text-[10px] font-bold text-brand-muted">{user.rank}.</div>
                <div className="w-8 h-8 rounded-full bg-brand-paper border border-brand-border overflow-hidden">
                   <img src={user.avatar} alt={user.name} />
                </div>
                <div className="flex-1">
                  <div className={cn("text-xs font-medium", user.isMe ? "text-brand-ink" : "text-brand-ink/80")}>
                    {user.name} {user.isMe && "(You)"}
                  </div>
                  <div className="text-[9px] text-brand-muted uppercase tracking-widest">Master Reader</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-brand-accent">{user.points}</div>
                  <div className="text-[8px] text-brand-muted uppercase tracking-tighter">Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 p-6 rounded-sm border border-brand-border mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex gap-4">
              <div className="w-12 h-12 border border-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                 <Star size={24} strokeWidth={1.5} />
              </div>
              <div>
                 <h4 className="serif italic text-lg mb-1 opacity-90">Ready for a rank up?</h4>
                 <p className="text-brand-muted text-xs uppercase tracking-widest leading-relaxed">
                   You've earned <span className="text-brand-accent font-bold">120 points</span> this session. Read more to climb the leaderboard.
                 </p>
              </div>
           </div>
           
           {activeBook?.chapters && (
             <button 
               onClick={onResumeReading}
               className="bg-brand-accent text-brand-bg px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center justify-center gap-2"
             >
                <BookOpen size={14} />
                Open Current Book
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

