import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Registration successful! Please check your email for a confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/3 rounded-full blur-[120px] -ml-48 -mb-48" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-accent/10 border border-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent mx-auto mb-6">
            <Sparkles size={32} className={loading ? 'animate-pulse' : ''} />
          </div>
          <h1 className="serif text-4xl mb-2 tracking-tight">Scholars Archive</h1>
          <p className="text-brand-muted text-[10px] uppercase tracking-[0.3em] font-bold italic">Virtual Intelligence • Literary Restoration</p>
        </div>

        <div className="glass p-8 rounded-sm border border-brand-border shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 text-[10px] uppercase tracking-widest font-bold transition-all ${
                  mode === 'login' ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-ink/60'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 text-[10px] uppercase tracking-widest font-bold transition-all ${
                  mode === 'signup' ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-ink/60'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Scholar Identification (Email)"
                    className="w-full bg-black/40 border border-brand-border rounded-sm py-4 pl-12 pr-4 focus:outline-none focus:border-brand-accent transition-colors serif text-lg placeholder:opacity-20 shadow-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Access Cipher (Password)"
                    className="w-full bg-black/40 border border-brand-border rounded-sm py-4 pl-12 pr-4 focus:outline-none focus:border-brand-accent transition-colors serif text-lg placeholder:opacity-20 shadow-sm"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 text-red-400 bg-red-400/5 p-4 rounded-sm border border-red-400/20 text-xs italic"
                  >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 text-brand-accent bg-brand-accent/5 p-4 rounded-sm border border-brand-accent/20 text-xs italic"
                  >
                    <Sparkles size={16} className="flex-shrink-0" />
                    <span>{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent text-brand-bg py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                    <span>{mode === 'login' ? 'Initiate Access' : 'Register Scholar'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-[8px] uppercase tracking-[0.4em] text-brand-muted font-bold opacity-30">
          Archival Access Control • Encrypted Transport
        </p>
      </motion.div>
    </div>
  );
};
