import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import useGNews from '../hooks/useGNews';
import useOpenAI from '../hooks/useOpenAI';
import useSarvam from '../hooks/useSarvam';
import { MOCK_ARTICLES, generateScenarioPrompt } from '../utils/moduleConfig';
import Avatar from '../components/Avatar';
import QuestionEngine from '../components/QuestionEngine';
import { MessageCircle, X, Clock, AlertCircle, LogOut, Newspaper, Cpu, Mic } from 'lucide-react';

export default function ModuleExperience() {
  const { state, updateState, updateModuleProgress } = useAppContext();
  const navigate = useNavigate();
  const { fetchNews } = useGNews();
  const { generateJSON } = useOpenAI();
  const { synthesizeSpeech } = useSarvam();

  const [loadingStep, setLoadingStep] = useState(0);
  // 0: Init, 1: GNews, 2: Gemini, 3: Sarvam, 4: Done
  const [error, setError] = useState('');

  const [scenario, setScenario] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [phase, setPhase] = useState('intro'); // 'intro', 'questions', 'done'
  const [timeSpent, setTimeSpent] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!state.currentModule) {
      navigate('/dashboard');
      return;
    }

    const loadExperience = async () => {
      try {
        setLoadingStep(1); // 📰 Finding your case study...
        const mod = state.currentModule;

        // 1. GNews Call
        const queryTerms = `${mod.name} ${mod.topic}`;
        let articles = await fetchNews(queryTerms, 5);
        if (!articles || articles.length === 0) {
          articles = [MOCK_ARTICLES[mod.id] || MOCK_ARTICLES['default']];
        }

        // Deduplication using scenariosUsed
        const usedUrls = state.moduleProgress[mod.id]?.scenariosUsed || [];
        let selectedArticle = articles.find(a => !usedUrls.includes(a.url));
        if (!selectedArticle) selectedArticle = articles[0]; // Fallback if all used

        setLoadingStep(2); // 🤖 Building your challenge room...

        // 2. Gemini Scenario Generation
        const answerHistoryStr = JSON.stringify(state.moduleProgress[mod.id]?.answerHistory || []);
        const prompt = generateScenarioPrompt(
          state.idea, mod.name, mod.topic, mod.difficulty, selectedArticle, answerHistoryStr
        );

        const generatedScenario = await generateJSON(prompt, 0.9);
        setScenario(generatedScenario);

        // Update unused scenarios
        updateModuleProgress(mod.id, {
          scenariosUsed: [...usedUrls, selectedArticle.url]
        });

        setLoadingStep(3); // 🔊 Preparing your mentor...

        // 3. Sarvam TTS
        const audio = await synthesizeSpeech(generatedScenario.avatarScript);
        setAudioUrl(audio);

        setLoadingStep(4); // Done

        // Start timer
        timerRef.current = setInterval(() => {
          setTimeSpent(prev => prev + 1);
        }, 1000);

      } catch (err) {
        console.error("Experience Load Error:", err);
        setError("Failed to load scenario. Please try again.");
      }
    };

    if (loadingStep === 0) {
      loadExperience();
    }

    return () => clearInterval(timerRef.current);
  }, [state.currentModule]); // eslint-disable-line

  const handleBeginChallenge = () => {
    setPhase('questions');
  };

  const handleScenarioComplete = (finalAnswers) => {
    clearInterval(timerRef.current);
    updateState({
      currentAnswers: finalAnswers,
      currentModule: { ...state.currentModule, timeSpent }
    });
    navigate('/report');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-accentRed mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Return to Dashboard</button>
      </div>
    );
  }

  if (loadingStep < 4) {
    const s = state.language === 'en' ? {} : {}; // simplified for brevity, replace with localized later if needed outside scope of this polish
    const loadingData = [
      { text: "", icon: null },
      { text: "Finding your real-world case study...", icon: Newspaper, color: "text-saffron" },
      { text: "Designing your specific challenge room...", icon: Cpu, color: "text-blue-400" },
      { text: "Preparing your mentor...", icon: Mic, color: "text-purple-400" }
    ];
    
    const currentData = loadingData[loadingStep];
    const Icon = currentData?.icon || Newspaper;

    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 max-w-md w-full relative z-10 border-t-2 border-t-saffron shadow-2xl"
        >
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="w-20 h-20 rounded-full bg-surface border border-white/20 flex items-center justify-center relative z-10 shadow-lg">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={loadingStep}
                   initial={{ scale: 0, rotate: -180 }}
                   animate={{ scale: 1, rotate: 0 }}
                   exit={{ scale: 0, rotate: 180 }}
                   transition={{ type: "spring", bounce: 0.4 }}
                 >
                   {Icon && <Icon className={`w-10 h-10 ${currentData.color}`} />}
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>

          <div className="w-full h-1.5 bg-surface rounded-full mb-6 overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-saffron to-amber-400"
              initial={{ width: '0%' }}
              animate={{ width: `${(loadingStep / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.h3
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-lg font-poppins font-bold ${currentData.color}`}
            >
              {currentData?.text}
            </motion.h3>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen flex flex-col pt-6 pb-16 px-4">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-6 glass-card p-4 border-l-4 border-l-saffron">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">{state.currentModule.name}</h2>
            <span className="text-xs text-saffron uppercase font-bold tracking-wider">{state.currentModule.difficulty} DIFFICULTY</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono ${timeSpent > 600 ? 'text-saffron animate-pulse-slow' : 'text-muted'}`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeSpent)}</span>
          </div>

          <button onClick={() => window.dispatchEvent(new Event('open-udyampath-coach'))} className="flex items-center gap-2 btn-ghost py-1.5 px-3 text-sm rounded-full shadow-saffron-glow">
            <MessageCircle className="w-4 h-4" /> Ask Udyam Guru
          </button>

          <button onClick={() => setShowExitConfirm(true)} className="text-muted hover:text-accentRed transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6">

        {/* LEFT PANEL: MENTOR */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <Avatar state="talking" audioUrl={audioUrl} companyName={scenario.companyName} companyInitial={scenario.companyName.charAt(0)} />
        </div>

        {/* RIGHT PANEL: CASE STUDY */}
        <div className="w-full lg:w-[65%] glass-card p-6 md:p-10 relative overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto pr-4 custom-scrollbar"
              >
                <span className="text-saffron font-bold text-sm tracking-widest uppercase mb-2 block">Case Study Setup</span>
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-8">{scenario.caseStudyTitle}</h1>

                <div className="space-y-6">
                  <div className="glass-card p-5 bg-surface/50 border-white/5">
                    <h3 className="text-sm text-muted font-bold uppercase mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> The Company Context
                    </h3>
                    <p className="text-white leading-relaxed">{scenario.companyContext}</p>
                  </div>

                  <div className="glass-card p-5 border-l-4 border-l-saffron bg-saffron/5">
                    <h3 className="text-sm text-saffron font-bold uppercase mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-saffron"></span> What Happened
                    </h3>
                    <p className="text-white leading-relaxed font-medium">{scenario.whatHappened}</p>
                  </div>

                  <div className="glass-card p-5 border-l-4 border-l-purple-500 bg-purple-500/5">
                    <h3 className="text-sm text-purple-400 font-bold uppercase mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span> Your Situation
                    </h3>
                    <p className="text-white leading-relaxed">{scenario.yourSituation}</p>
                  </div>

                  <div className="my-10 text-center scale-105">
                    <h2 className="text-2xl font-poppins font-extrabold text-white leading-tight">
                      "{scenario.keyChallenge}"
                    </h2>
                  </div>

                  <div className="glass-card p-5 border-accentRed/30 border text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accentRed"></div>
                    <AlertCircle className="w-8 h-8 text-accentRed mx-auto mb-2" />
                    <p className="text-accentRed font-bold">{scenario.stakesClarification}</p>
                  </div>
                </div>

                <div className="mt-10 flex justify-end pb-4">
                  <button onClick={handleBeginChallenge} className="btn-primary flex items-center gap-2 shadow-saffron-glow group px-8 py-4 text-lg">
                    Begin Challenge <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>→</motion.span>
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'questions' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col h-full"
              >
                <QuestionEngine scenario={scenario} onComplete={handleScenarioComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <LogOut className="w-12 h-12 text-accentRed mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Exit Session?</h3>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                You've spent <span className="text-saffron font-bold">{formatTime(timeSpent)}</span> on this module.
                Your progress will be saved, but this challenge won't be scored.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors font-bold"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => { clearInterval(timerRef.current); navigate('/dashboard'); }}
                  className="flex-1 py-3 rounded-xl bg-accentRed hover:bg-accentRed/80 text-white transition-colors font-bold"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

