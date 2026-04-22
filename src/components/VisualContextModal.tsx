import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateVisualContext } from '../lib/gemini';
import { cn } from '../lib/utils';

interface VisualContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor: string;
  initialDescription?: string;
}

export const VisualContextModal: React.FC<VisualContextModalProps> = ({ 
  isOpen, 
  onClose, 
  bookTitle, 
  bookAuthor,
  initialDescription = ''
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; imageUrl: string } | null>(null);

  // Sync description when initialDescription changes
  React.useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription);
      setResult(null); // Clear previous result when new text is selected
    }
  }, [initialDescription]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const visualText = await generateVisualContext(bookTitle, bookAuthor, description);
      // Clean prompt for the external image service
      const cleanPrompt = encodeURIComponent(`${bookTitle} ${description} cinematic atmosphere highly detailed`);
      const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
      
      setResult({
        text: visualText || "A cinematic representation of your reading journey.",
        imageUrl
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-paper rounded-sm shadow-2xl overflow-hidden border border-brand-border"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <div>
                  <h2 className="serif text-2xl uppercase tracking-widest font-light opacity-80">Visual Context</h2>
                  <p className="text-brand-muted text-[10px] uppercase tracking-widest mt-1">Illustrating: {bookTitle}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-muted">
                  <X size={20} />
                </button>
              </div>

              {!result ? (
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted mb-3 block">Scene Description</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the moment, the setting, or a character's appearance..."
                      className="w-full bg-black/40 border border-brand-border rounded-sm px-5 py-4 focus:outline-none focus:border-brand-accent transition-colors serif text-lg shadow-sm placeholder:opacity-20 min-h-[120px] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !description.trim()}
                    className="w-full bg-brand-accent text-brand-bg py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Rendering Vision...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Generate Illustration</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-square w-full relative bg-black/40 rounded-sm overflow-hidden border border-brand-border">
                    <img 
                      src={result.imageUrl} 
                      alt="Generated context" 
                      className="w-full h-full object-cover transition-opacity duration-1000"
                      referrerPolicy="no-referrer"
                      onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                      style={{ opacity: 0 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center -z-10 text-brand-muted/20">
                       <Loader2 className="animate-spin" />
                    </div>
                  </div>
                  
                  <div className="bg-brand-accent/5 p-5 rounded-sm border border-brand-accent/10">
                    <div className="flex gap-2 items-center text-brand-accent mb-2">
                       <Sparkles size={14} />
                       <span className="text-[10px] uppercase tracking-widest font-bold">Visual Interpretation</span>
                    </div>
                    <p className="serif italic text-brand-ink leading-relaxed opacity-80">{result.text}</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setResult(null)}
                      className="flex-1 border border-brand-border text-brand-muted py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
                    >
                      New Scene
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-brand-accent text-brand-bg py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg"
                    >
                      Return to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
