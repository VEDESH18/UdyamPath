import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { CURRICULUM, fetchNewsInsights } from '../services/moduleService';
import { CheckCircle, Lock, Star, GraduationCap, Flame, BookOpen, Newspaper, ChevronRight, Bot } from 'lucide-react';

const LEVELS_META = {
  1: { title: 'Ideation', color: 'from-violet-600 to-indigo-600', badge: '#a78bfa' },
  2: { title: 'Prototyping', color: 'from-blue-600 to-cyan-600', badge: '#22d3ee' },
  3: { title: 'Market Entry', color: 'from-emerald-600 to-teal-600', badge: '#34d399' },
  4: { title: 'Unit Economics', color: 'from-amber-500 to-orange-500', badge: '#fbbf24' },
  5: { title: 'Scaling Team', color: 'from-rose-600 to-pink-600', badge: '#fb7185' },
  6: { title: 'Sustainable Enterprise', color: 'from-cyan-600 to-blue-600', badge: '#67e8f9' },
};

function ModuleCard({ module, isUnlocked, progress, onClick }) {
  const attempts = progress?.attempts?.length || 0;
  const bestScore = progress?.bestScore || 0;

  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`group relative w-full text-left p-5 rounded-3xl border-2 border-b-4 transition-all ${
        !isUnlocked
          ? 'bg-[#181f27] border-[#2b3e47] cursor-not-allowed opacity-40'
          : bestScore >= 70
            ? 'bg-[#1a2e1a] border-[#58cc02] hover:bg-[#1f361f] active:translate-y-1 active:border-b-2'
            : 'bg-[#202f36] border-[#2b3e47] hover:bg-[#253540] hover:border-[#1cb0f6]/50 active:translate-y-1 active:border-b-2'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg ${!isUnlocked ? 'grayscale' : ''}`}
          style={{ background: isUnlocked ? 'rgba(88,204,2,0.1)' : 'rgba(0,0,0,0.2)', border: isUnlocked ? '2px solid rgba(88,204,2,0.3)' : '2px solid rgba(255,255,255,0.05)' }}>
          {module.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-poppins font-black text-white text-base leading-tight truncate">{module.title}</p>
          <div className="flex items-center gap-3 mt-1">
            {attempts > 0 ? (
              <span className="text-xs font-bold text-white/40">{attempts} attempt{attempts > 1 ? 's' : ''}</span>
            ) : null}
            {bestScore > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: bestScore >= 70 ? 'rgba(88,204,2,0.2)' : 'transparent', color: '#58cc02' }}>
                Best: {bestScore}/100
              </span>
            )}
            {!attempts && isUnlocked && (
              <span className="text-xs font-bold text-[#1cb0f6]">Tap to start</span>
            )}
          </div>
        </div>
        {!isUnlocked
          ? <Lock className="w-5 h-5 text-white/20 shrink-0" />
          : bestScore >= 70
            ? <CheckCircle className="w-6 h-6 text-[#58cc02] shrink-0" />
            : <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 shrink-0 transition-colors" />
        }
      </div>
    </button>
  );
}

function NewsCard({ item }) {
  return (
    <div className="flex gap-3 p-4 bg-[#202f36] border border-[#2b3e47] rounded-2xl hover:border-[#1cb0f6]/40 transition-all cursor-pointer group">
      <div className="text-2xl shrink-0">{item.emoji}</div>
      <div>
        <p className="text-white font-bold text-sm leading-snug group-hover:text-[#1cb0f6] transition-colors line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-white/40 text-xs font-bold">{item.source}</span>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <span className="text-white/30 text-xs">{item.time}</span>
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  const { language } = useLanguage();
  const { startup, user } = useUser();
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [activeLevel, setActiveLevel] = useState(1);

  const currentLevel = startup?.highestLevelUnlocked || 1;
  const moduleProgress = startup?.moduleProgress || {};
  const homework = startup?.assignedHomework || [];

  useEffect(() => {
    fetchNewsInsights(startup?.sector).then(setNews);
    setActiveLevel(currentLevel);
  }, [startup?.sector, currentLevel]);

  const levelModules = CURRICULUM[activeLevel] || CURRICULUM[1];

  if (!startup?.idea) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-3xl font-black text-white mb-4 font-poppins">No Startup Found</h2>
          <p className="text-white/50 mb-6">Let's set up your idea first!</p>
          <button onClick={() => navigate('/onboarding')} className="px-8 py-4 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white font-black text-xl rounded-2xl">Start Here →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111b21] text-white font-inter">

      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-[#202f36] border-b-2 border-[#111b21] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#58cc02] shadow-[0_4px_0_#58a700] flex items-center justify-center">
              <span className="font-poppins font-black text-white text-xl">U</span>
            </div>
            <div>
              <h1 className="font-poppins font-black text-lg leading-tight">UdyamPath</h1>
              <p className="text-xs text-white/40 font-bold truncate max-w-[160px]">{startup.idea}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 font-bold text-[#ff9600] text-sm">
              <Flame className="w-4 h-4" /> {currentLevel}
            </div>
            <button
              onClick={() => navigate('/board')}
              className="px-4 py-2 rounded-xl bg-[#58cc02] shadow-[0_3px_0_#58a700] font-black text-sm text-white active:translate-y-0.5 active:shadow-none transition-all"
            >
              Play Simulation
            </button>
            <button
              onClick={() => navigate('/coach')}
              className="px-4 py-2 rounded-xl bg-[#ce82ff] shadow-[0_3px_0_#a568cc] font-black text-sm text-white active:translate-y-0.5 active:shadow-none transition-all"
            >
              AI Mentor
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* ——— LEFT: Module Learning Path ——— */}
        <div className="flex-1">

          {/* Homework Alert */}
          {homework.length > 0 && (
            <div className="mb-6 p-5 bg-red-950 border-2 border-red-500/60 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-6 h-6 text-red-400" />
                <h3 className="font-black text-red-400 text-lg">Simulation Locked — Complete Homework First</h3>
              </div>
              <div className="space-y-2">
                {homework.map((hw, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl">
                    <span className="text-red-400 font-black">❖</span>
                    <div>
                      <p className="font-bold text-white text-sm">{hw.title}</p>
                      <p className="text-white/50 text-xs">{hw.reason} · {hw.estimatedTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {Object.entries(LEVELS_META).map(([lvl, meta]) => {
              const lvlNum = parseInt(lvl);
              const isLocked = lvlNum > currentLevel;
              return (
                <button
                  key={lvl}
                  disabled={isLocked}
                  onClick={() => setActiveLevel(lvlNum)}
                  className={`shrink-0 px-4 py-2 rounded-xl font-black text-sm border-2 border-b-4 transition-all ${
                    isLocked
                      ? 'bg-[#181f27] border-[#2b3e47] text-white/20 cursor-not-allowed'
                      : activeLevel === lvlNum
                        ? `bg-gradient-to-r ${meta.color} border-transparent text-white shadow-lg`
                        : 'bg-[#202f36] border-[#2b3e47] text-white/60 hover:text-white'
                  }`}
                >
                  {isLocked && '🔒'} L{lvl} · {meta.title}
                </button>
              );
            })}
          </div>

          {/* Module Cards Grid */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-5 h-5 text-[#58cc02]" />
              <h2 className="font-poppins font-black text-xl">Level {activeLevel} — {LEVELS_META[activeLevel]?.title} Modules</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {levelModules.map((mod, i) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  isUnlocked={activeLevel <= currentLevel}
                  progress={moduleProgress[mod.id]}
                  onClick={() => navigate(`/module/${mod.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Journey CTA */}
          <div className="mt-8 p-5 bg-gradient-to-r from-[#58cc02]/20 to-[#1cb0f6]/20 border-2 border-[#58cc02]/30 rounded-3xl flex items-center gap-4">
            <div className="text-4xl">🎮</div>
            <div>
              <p className="font-black text-white text-lg font-poppins">Ready to test your learning?</p>
              <p className="text-white/60 text-sm">Take the simulation and earn XP to unlock Level {currentLevel + 1}!</p>
            </div>
            <button onClick={() => navigate('/board')} className="ml-auto shrink-0 px-5 py-3 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white font-black rounded-xl text-sm active:translate-y-1 active:shadow-none">
              Play Now
            </button>
          </div>
        </div>

        {/* ——— RIGHT: Insights & Resources ——— */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="sticky top-24 space-y-6">

            {/* Live News Insights */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5 text-[#ff9600]" />
                <h2 className="font-poppins font-black text-lg">Sector Insights</h2>
                <span className="ml-auto text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="space-y-3">
                {news.length > 0
                  ? news.map((n, i) => <NewsCard key={i} item={n} />)
                  : [1,2,3].map(i => <div key={i} className="h-20 bg-[#202f36] border border-[#2b3e47] rounded-2xl animate-pulse" />)
                }
              </div>
            </div>

            {/* AI Mentor Quick Access */}
            <div className="p-5 bg-gradient-to-br from-[#ce82ff]/20 to-[#a78bfa]/10 border-2 border-[#ce82ff]/40 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-8 h-8 text-[#ce82ff]" />
                <div>
                  <p className="font-black text-white text-base">Need help?</p>
                  <p className="text-white/50 text-xs">Ask your AI Mentor anything</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/coach')}
                className="w-full py-3 bg-[#ce82ff] shadow-[0_4px_0_#a568cc] text-white font-black rounded-xl active:translate-y-1 active:shadow-none transition-all"
              >
                Chat with Mentor
              </button>
            </div>

            {/* Progress Summary */}
            <div className="bg-[#202f36] border-2 border-[#2b3e47] rounded-3xl p-5">
              <h3 className="font-black text-white mb-4 font-poppins">Your Progress</h3>
              {Object.entries(LEVELS_META).map(([lvl, meta]) => {
                const lvlNum = parseInt(lvl);
                const lvlModules = CURRICULUM[lvlNum] || [];
                const completedCount = lvlModules.filter(m =>
                  (moduleProgress[m.id]?.bestScore || 0) >= 70
                ).length;
                const isLocked = lvlNum > currentLevel;
                return (
                  <div key={lvl} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-black ${isLocked ? 'text-white/20' : 'text-white/60'}`}>L{lvl} · {meta.title}</span>
                      <span className="text-xs font-bold text-white/40">{completedCount}/{lvlModules.length}</span>
                    </div>
                    <div className="h-2 bg-[#111b21] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(completedCount / lvlModules.length) * 100}%`, background: isLocked ? '#2b3e47' : meta.badge }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
