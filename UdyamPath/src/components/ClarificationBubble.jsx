import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Volume2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useOpenAI from '../hooks/useOpenAI';
import useSarvam from '../hooks/useSarvam';

export default function ClarificationBubble({ scenarioContext, isVisible, onClose }) {
  const { state } = useAppContext();
  const { generateJSON } = useOpenAI();
  const { synthesizeSpeech } = useSarvam();
  
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const audioRef = useRef(null);

  // Auto-play when audio is ready
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio playback prevented:', e));
    }
  }, [audioUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse(null);
    setAudioUrl(null);
    
    try {
      const prompt = `You are Udyam Guru, an Indian startup mentor. 
User's idea: ${state.idea}
Current Case Study Context: ${JSON.stringify(scenarioContext).substring(0, 500)}

User's doubt: "${query}"

Return ONLY JSON:
{
  "explanation": "2-3 sentences using a simple Indian daily life analogy to explain the concept. Warm, supportive tone."
}`;

      const res = await generateJSON(prompt, 0.7);
      setResponse(res.explanation);

      // Generate TTS parallelly or after
      const audio = await synthesizeSpeech(res.explanation);
      if (audio) setAudioUrl(audio);
      
    } catch (err) {
      console.error("Clarification error", err);
      setResponse("I'm sorry, I'm having trouble analyzing this right now. Please try again.");
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 glass-card bg-navy/95 border-saffron shadow-saffron-glow flex flex-col rounded-2xl overflow-hidden"
        >
          <div className="bg-saffron text-white p-3 flex justify-between items-center font-bold">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Ask Udyam Guru</span>
            </div>
            <button onClick={onClose} className="hover:text-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
             {response ? (
               <div className="bg-surface/50 border border-white/10 p-4 rounded-xl relative">
                  <p className="text-white text-sm leading-relaxed">{response}</p>
                  
                  {audioUrl && (
                    <div className="mt-3 flex items-center gap-2 text-saffron">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-bold">Playing Audio...</span>
                      <audio ref={audioRef} src={audioUrl} onEnded={() => { /* reset playing state internally if needed */ }} className="hidden" />
                    </div>
                  )}

                  <button onClick={() => setResponse(null)} className="mt-4 text-xs text-muted hover:text-white underline">Ask another question</button>
               </div>
             ) : (
               <div className="text-center py-4">
                 <p className="text-sm text-muted mb-4">I'm here to clarify any difficult concepts in this case study. What's confusing you?</p>
                 <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setQuery("What does this mean for my target audience?")} className="bg-surface border border-white/10 text-xs rounded-full px-3 py-1 hover:border-saffron text-muted hover:text-white">What does this mean?</button>
                    <button onClick={() => setQuery("Can you give a simpler analogy?")} className="bg-surface border border-white/10 text-xs rounded-full px-3 py-1 hover:border-saffron text-muted hover:text-white">Simpler analogy</button>
                 </div>
               </div>
             )}
          </div>

          {!response && (
            <div className="p-3 border-t border-white/10 bg-surface">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. What is a term sheet?"
                  className="flex-1 bg-navy border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:border-saffron outline-none"
                  disabled={loading}
                />
                <button type="submit" disabled={!query.trim() || loading} className="w-9 h-9 bg-saffron text-white rounded-full flex items-center justify-center disabled:opacity-50">
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
