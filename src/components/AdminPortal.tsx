import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, Loader2, Sparkles, BookPlus, AlertCircle, Trash2 } from 'lucide-react';
import { Book } from '../types';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface AdminPortalProps {
  onAddBook: (book: Book) => void;
  existingBooks: Book[];
  onDeleteBook: (id: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onAddBook, existingBooks, onDeleteBook }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    genre: 'Literature' as Book['genre'],
    coverUrl: '',
    totalPages: 100
  });
  const [step, setStep] = useState<'upload' | 'refine' | 'success'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from the first 5 pages for preview/mock content
      const numPages = Math.min(pdf.numPages, 5);
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setExtractedText(fullText);
      setBookData(prev => ({ ...prev, title: file.name.replace('.pdf', ''), totalPages: pdf.numPages }));
      setStep('refine');
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to extract text from PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!bookData.title || !bookData.author || !extractedText) return;

    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      ...bookData,
      currentPage: 0,
      status: 'queue',
      addedAt: Date.now(),
      chapters: [
        { title: 'Extracted Content', content: extractedText }
      ]
    };

    onAddBook(newBook);
    setStep('success');
  };

  const resetForm = () => {
    setStep('upload');
    setExtractedText('');
    setBookData({
      title: '',
      author: '',
      genre: 'Literature',
      coverUrl: '',
      totalPages: 100
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12 border-b border-brand-border pb-8">
        <h1 className="serif text-4xl mb-2">Curator Portal</h1>
        <p className="text-brand-muted text-xs uppercase tracking-widest font-bold">Admin Layer • Content Archive Management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group aspect-video bg-brand-paper border-2 border-dashed border-brand-border hover:border-brand-accent/50 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="text-brand-accent animate-spin" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">Deciphering PDF structure...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <h3 className="serif text-xl mb-1">Upload Archive Edition</h3>
                      <p className="text-brand-muted text-[10px] uppercase tracking-widest">Supports PDF format • Auto-Extracting Text</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>

                <div className="bg-brand-accent/5 p-6 rounded-sm border border-brand-accent/10 flex gap-4">
                  <AlertCircle size={20} className="text-brand-accent flex-shrink-0" />
                  <p className="text-xs text-brand- ink/60 italic leading-relaxed">
                    Digital artifacts are converted to high-fidelity static text for the optimum reading experience. 
                    Formatting is preserved as scholarly plain text.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'refine' && (
              <motion.div
                key="refine"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 bg-brand-paper p-8 border border-brand-border rounded-sm"
              >
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                   <Sparkles size={20} className="text-brand-accent" />
                   <h3 className="serif text-xl">Digital Metadata Refining</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-muted">Edition Title</label>
                    <input
                      type="text"
                      value={bookData.title}
                      onChange={(e) => setBookData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-brand-bg border border-brand-border p-3 rounded-sm text-sm focus:border-brand-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-muted">Author/Creator</label>
                    <input
                      type="text"
                      placeholder="e.g. Marcus Aurelius"
                      value={bookData.author}
                      onChange={(e) => setBookData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full bg-brand-bg border border-brand-border p-3 rounded-sm text-sm focus:border-brand-accent outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-muted">Genre Architecture</label>
                  <select
                    value={bookData.genre}
                    onChange={(e) => setBookData(prev => ({ ...prev, genre: e.target.value as any }))}
                    className="w-full bg-brand-bg border border-brand-border p-3 rounded-sm text-sm focus:border-brand-accent outline-none appearance-none"
                  >
                    <option value="History">History</option>
                    <option value="Science">Science</option>
                    <option value="Literature">Literature</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Biography">Biography</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-muted">Extracted Text Preview</label>
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border p-4 rounded-sm text-xs serif leading-relaxed min-h-[300px] focus:border-brand-accent outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex-1 border border-brand-border py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
                  >
                    Discard Artifact
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-brand-accent text-brand-bg py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform"
                  >
                    Finalize Archive Entry
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-paper p-12 border border-brand-accent/20 rounded-sm text-center space-y-6"
              >
                <div className="w-20 h-20 bg-brand-accent/10 border border-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent mx-auto">
                   <Sparkles size={40} className="animate-pulse" />
                </div>
                <h3 className="serif text-2xl">Digital Restoration Complete</h3>
                <p className="text-brand-muted text-sm serif italic">The edition has been successfully archived as a high-fidelity digital text and is now available for all scholars.</p>
                <button
                  onClick={resetForm}
                  className="bg-brand-accent text-brand-bg px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                >
                  Archive Another Volume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
           <div className="bg-brand-paper border border-brand-border p-6 rounded-sm">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent">Master Archives</h4>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to restore the library to its default state? All custom uploads will be lost.')) {
                      localStorage.removeItem('readally_books');
                      window.location.reload();
                    }
                  }}
                  className="text-[8px] uppercase tracking-widest text-brand-muted hover:text-red-400 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
              <div className="space-y-4">
                {existingBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between group">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{book.title}</div>
                      <div className="text-[9px] text-brand-muted uppercase tracking-widest">{book.author}</div>
                    </div>
                    <button 
                      onClick={() => onDeleteBook(book.id)}
                      className="text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-6 bg-brand-bg border border-brand-border rounded-sm">
              <div className="flex items-center gap-3 mb-4 text-brand-muted">
                 <FileText size={18} />
                 <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold">Curator Rules</h5>
              </div>
              <ul className="text-[10px] text-brand-muted space-y-3 leading-relaxed">
                <li>• Ensure title and author are verified before archiving.</li>
                <li>• Review extracted text for scanning anomalies.</li>
                <li>• Use high-quality cover art URLs to maintain aesthetic.</li>
                <li>• All entries are currently shared with all platform scholars.</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};
