import { useState, useEffect, useRef } from 'react';
import { generateSpeech } from '../services/sarvamService';
import { Volume2, Loader2, Pause, Play, UserCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AvatarSpeech({ text, onPlaybackComplete }) {
  const { state } = useAppContext();
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const mountedRef = useRef(true);

  // Re-fetch/generate audio when text changes
  useEffect(() => {
    mountedRef.current = true;
    let currentUrl = null;

    const fetchAudio = async () => {
      if (!text) return;
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      try {
        const base64Audio = await generateSpeech(text, state.language || 'en');
        const url = base64Audio ? `data:audio/wav;base64,${base64Audio}` : null;
        if (mountedRef.current) {
          setAudioUrl(url);
          currentUrl = url;
          // Auto play immediately when ready
          if (audioRef.current && url) {
             setTimeout(() => {
                const playPromise = audioRef.current?.play();
                if (playPromise !== undefined) {
                  playPromise.catch(e => console.warn("Auto-play prevented", e));
                }
             }, 500);
          }
        }
      } catch (err) {
        if (mountedRef.current) setError('Audio unavailable');
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    fetchAudio();

    return () => {
      mountedRef.current = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [text, state.language]);

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error(e));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* 3D Avatar Placeholder */}
      <div className="relative w-32 h-32 flex-shrink-0 perspective-1000">
         <div className={`w-full h-full rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#0f9b58] shadow-inner flex items-center justify-center transition-all duration-300 transform-style-3d ${isPlaying ? 'animate-float shadow-[0_0_40px_rgba(88,204,2,0.4)]' : ''}`}>
             {/* Simple face construct for gamified look */}
             <div className="relative z-10 w-24 h-24 bg-[#0f0f0f]/30 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col items-center justify-center gap-2">
                 <div className="flex gap-4">
                     <div className={`w-3 h-4 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`}></div>
                     <div className={`w-3 h-4 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`}></div>
                 </div>
                 {/* Mouth sync simulator */}
                 <div className={`w-8 bg-white rounded-full transition-all duration-75 ${isPlaying ? 'h-4 animate-bounce' : 'h-1'}`}></div>
             </div>
         </div>

         {/* Status Badge */}
         <div className="absolute -bottom-2 -right-2 bg-black border-2 border-white/10 p-2 rounded-xl z-20">
            {isLoading ? <Loader2 className="w-5 h-5 text-white/50 animate-spin" /> : 
             error ? <Volume2 className="w-5 h-5 text-red-500 opacity-50" /> :
             isPlaying ? <Volume2 className="w-5 h-5 text-[#58CC02] animate-pulse" /> : 
             <UserCircle2 className="w-5 h-5 text-white/50" />}
         </div>
      </div>

      {/* Control & Text UI */}
      <div className="flex-1 flex flex-col gap-3 z-10 w-full">
         <div className="flex items-center justify-between gap-4">
            <h3 className="font-poppins font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#1CB0F6]"></span> Case Study Audio
            </h3>
            
            {audioUrl && !isLoading && (
              <button 
                onClick={togglePlayback}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors"
              >
                 {isPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                 {isPlaying ? 'Pause' : 'Replay'}
              </button>
            )}
         </div>

         <div className="bg-black/30 p-4 rounded-xl border border-white/5 relative">
            <p className="text-white/80 leading-relaxed text-sm italic font-medium">"{text}"</p>
         </div>
      </div>

      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onPlaybackComplete) onPlaybackComplete();
          }}
          className="hidden"
        />
      )}
      
      {/* Decorative Glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#1CB0F6]/10 blur-3xl transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
}
