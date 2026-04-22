import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, Sparkles, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  potentialPoints: number;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ questions, onComplete, potentialPoints }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    
    if (idx === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    const isPerfect = score === questions.length;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card glass p-8 rounded-sm border border-brand-accent/20 text-center"
      >
        <Trophy size={48} className={cn("mx-auto mb-4", isPerfect ? "text-brand-accent animate-bounce" : "text-brand-muted")} />
        <h3 className="serif text-2xl mb-2">{isPerfect ? 'Perfect Score!' : 'Quiz Complete'}</h3>
        <p className="text-brand-muted text-xs uppercase tracking-widest mb-6">
          You got {score} out of {questions.length} correct
        </p>
        
        {isPerfect ? (
          <div className="bg-brand-accent/10 p-6 rounded-sm border border-brand-accent/20 mb-8">
            <div className="text-brand-accent font-bold text-xl mb-1">Double Points!</div>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              You've earned <span className="text-brand-ink font-bold">{potentialPoints * 2} points</span> for this session.
            </p>
          </div>
        ) : (
          <div className="bg-white/5 p-6 rounded-sm border border-white/10 mb-8">
            <div className="text-brand-ink font-bold text-xl mb-1">{potentialPoints} Points</div>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Score 100% next time to double your points!
            </p>
          </div>
        )}

        <button
          onClick={() => onComplete(score)}
          className="w-full bg-brand-accent text-brand-bg py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          Collect Rewards
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 w-8 rounded-full transition-colors",
                i === currentIndex ? "bg-brand-accent" : i < currentIndex ? "bg-brand-accent/40" : "bg-white/10"
              )} 
            />
          ))}
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card p-8 rounded-sm border border-brand-border shadow-xl min-h-[300px] flex flex-col"
      >
        <h4 className="serif text-xl mb-8 leading-relaxed">{currentQuestion.question}</h4>
        
        <div className="grid grid-cols-1 gap-3 mt-auto">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            const showFeedback = selectedOption !== null;

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "p-4 rounded-sm border text-left text-xs uppercase tracking-widest font-medium transition-all flex justify-between items-center",
                  !showFeedback ? "border-brand-border bg-white/5 hover:border-brand-accent/40" : (
                    isSelected ? (isCorrect ? "border-green-500/50 bg-green-500/10 text-green-500" : "border-red-500/50 bg-red-500/10 text-red-500") 
                    : (isCorrect ? "border-green-500/50 bg-green-500/10 text-green-500" : "border-brand-border opacity-30")
                  )
                )}
              >
                <span>{option}</span>
                {showFeedback && isCorrect && <CheckCircle2 size={16} />}
                {showFeedback && isSelected && !isCorrect && <XCircle size={16} />}
              </button>
            );
          })}
        </div>
      </motion.div>
      
      <div className="flex items-center justify-center gap-2 text-brand-muted opacity-40">
        <Sparkles size={14} />
        <span className="text-[9px] uppercase tracking-widest">AI Generated Quiz • Knowledge Refines the Soul</span>
      </div>
    </div>
  );
};
