import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { PlayCircle, PauseCircle, FastForward, Volume2, VolumeX } from 'lucide-react';

// Multiple reliable Lottie mentor animations as fallbacks
const LOTTIE_URLS = [
  'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json', // person at desk
  'https://assets7.lottiefiles.com/packages/lf20_v1yudlrx.json', // presenter
  'https://assets5.lottiefiles.com/packages/lf20_qdas9ued.json', // business person
];

export default function Avatar({ audioUrl, companyName, companyInitial }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lottieIdx, setLottieIdx] = useState(0);
  const [lottieError, setLottieError] = useState(false);

  // Auto-play audio when URL provided
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 0.75 : 1;
    setSpeed(next);
  };

  const handleLottieError = () => {
    if (lottieIdx < LOTTIE_URLS.length - 1) {
      setLottieIdx(i => i + 1);
    } else {
      setLottieError(true);
    }
  };

  return (
    <div className="flex flex-col glass-card p-5 border border-saffron/20 relative md:sticky top-6 min-h-[400px]">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      {/* Status Badge */}
      <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-muted flex items-center gap-2 z-10">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-saffron animate-pulse' : 'bg-successGreen'}`} />
        {isPlaying ? 'Speaking...' : 'Udyam Guru'}
      </div>

      {/* Mentor Avatar */}
      <div className="flex-1 relative flex items-center justify-center min-h-[280px]">
        {!lottieError ? (
          <div
            className="relative"
            style={{
              filter: isPlaying ? 'drop-shadow(0 0 20px rgba(255,107,53,0.4))' : 'none',
              transform: isPlaying ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.5s ease'
            }}
          >
            <Player
              autoplay
              loop
              src={LOTTIE_URLS[lottieIdx]}
              style={{ height: '260px', width: '260px' }}
              onEvent={evt => { if (evt === 'error') handleLottieError(); }}
            />
          </div>
        ) : (
          /* Fallback: Animated mentor silhouette */
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-saffron-glow border-4 border-saffron"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #c0392b)',
                animation: isPlaying ? 'pulse 1s ease-in-out infinite' : 'none'
              }}
            >
              UG
            </div>
            <div className="text-center">
              <p className="text-white font-bold">Udyam Guru</p>
              <p className="text-xs text-muted">Your Startup Mentor</p>
            </div>
          </div>
        )}

        {/* Glow underneath */}
        <div className="absolute bottom-4 w-40 h-8 bg-saffron/20 blur-2xl rounded-full pointer-events-none" />

        {/* Sound wave animation when playing */}
        {isPlaying && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-saffron rounded-full"
                style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animation: `bounce ${0.3 + i * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.07}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Case Study Tag + Audio Controls */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
        {companyName && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface border border-saffron flex items-center justify-center font-bold text-saffron text-sm shadow-saffron-glow flex-shrink-0">
              {companyInitial || companyName.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Case Study</p>
              <p className="text-sm font-bold text-white leading-tight">{companyName}</p>
            </div>
          </div>
        )}

        {/* Audio controls */}
        <div className="flex items-center gap-2 bg-surface/50 rounded-xl p-2.5 border border-white/5">
          <button
            onClick={togglePlay}
            className="text-saffron hover:text-white transition-colors p-1.5 hover:bg-saffron/20 rounded-full"
            title={audioUrl ? (isPlaying ? 'Pause' : 'Play Narration') : 'No audio available'}
          >
            {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
          </button>

          <div className="flex-1">
            {audioUrl ? (
              <div className="h-1.5 bg-navy rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-saffron to-successGreen transition-all ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`} />
              </div>
            ) : (
              <p className="text-[10px] text-muted">Narration loading...</p>
            )}
          </div>

          <button
            onClick={cycleSpeed}
            className="text-xs font-bold text-muted hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" /> {speed}x
          </button>

          {!audioUrl && (
            <div title="No Sarvam API key — voice disabled">
              <VolumeX className="w-4 h-4 text-muted/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
