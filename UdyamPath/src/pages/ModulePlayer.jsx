import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { generateModule, generateGuidance } from '../services/moduleService';
import { generateSpeech } from '../services/sarvamService';
import { CheckCircle, XCircle, Volume2, ArrowRight, Download, RotateCcw, Loader2, Star } from 'lucide-react';

// ———————————————————————
// 3D-style Avatar Component (pure CSS)
function Avatar({ state }) {
  // state: idle | talking | correct | wrong
  const expressions = {
    idle:    { eyes: '🙂', bg: 'from-violet-600 to-indigo-700', shadow: 'shadow-violet-500/40' },
    talking: { eyes: '😮', bg: 'from-blue-500 to-cyan-600',    shadow: 'shadow-cyan-500/40' },
    correct: { eyes: '😄', bg: 'from-green-500 to-emerald-600', shadow: 'shadow-emerald-500/40' },
    wrong:   { eyes: '😬', bg: 'from-orange-500 to-red-600',   shadow: 'shadow-red-500/40' },
  };
  const e = expressions[state] || expressions.idle;

  return (
    <div className="flex flex-col items-center mb-6">
      <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${e.bg} shadow-2xl ${e.shadow} flex items-center justify-center transition-all duration-500 ${state === 'talking' ? 'animate-bounce' : ''}`}>
        <span className="text-5xl select-none">{e.eyes}</span>
        {/* Glow ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${e.bg} opacity-30 scale-125 blur-xl`}></div>
        {/* Sound waves when talking */}
        {state === 'talking' && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex gap-1 items-center">
            {[1,2,3].map(i => (
              <div key={i} className="bg-cyan-400 rounded-full w-1.5" style={{ height: `${8 + i*6}px`, animation: `waveBar 0.8s ease-in-out ${i*0.15}s infinite alternate` }}></div>
            ))}
          </div>
        )}
      </div>
      <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white ${e.bg.includes('green') ? 'bg-emerald-600' : e.bg.includes('red') ? 'bg-red-500' : e.bg.includes('blue') ? 'bg-blue-500' : 'bg-violet-600'}`}>
        AI Mentor
      </div>
    </div>
  );
}

// ———————————————————————
// MCQ Question
function MCQQuestion({ question, selectedIndex, onSelect, showResult, correctIndex }) {
  return (
    <div className="space-y-3">
      {question.options.map((opt, i) => {
        let style = 'bg-[#202f36] border-[#2b3e47] text-white hover:bg-[#2b3e47]';
        if (showResult) {
          if (i === correctIndex) style = 'bg-emerald-950 border-emerald-500 text-emerald-400';
          else if (i === selectedIndex) style = 'bg-red-950 border-red-500 text-red-400';
          else style = 'bg-[#202f36] border-[#2b3e47] text-white/30';
        } else if (selectedIndex === i) {
          style = 'bg-[#1cb0f6]/20 border-[#1cb0f6] text-white';
        }
        return (
          <button
            key={i}
            disabled={showResult}
            onClick={() => onSelect(i)}
            className={`w-full p-4 text-left rounded-2xl border-2 border-b-4 transition-all font-inter font-bold text-sm active:translate-y-0.5 active:border-b-2 ${style}`}
          >
            <span className="font-poppins font-black mr-3 text-current opacity-60">{['A','B','C','D'][i]}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ———————————————————————
// Match the Following Question
function MatchQuestion({ question, userMatching, onMatch, showResult, correctMatching }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const matching = userMatching || {};

  const handleLeft = (i) => !showResult && setSelectedLeft(i);
  const handleRight = (i) => {
    if (showResult || selectedLeft === null) return;
    onMatch({ ...matching, [selectedLeft]: i });
    setSelectedLeft(null);
  };

  return (
    <div className="flex gap-4">
      {/* Left Column */}
      <div className="flex-1 space-y-3">
        {question.leftItems.map((item, i) => {
          const isSelected = selectedLeft === i;
          const isMatched = matching[i] !== undefined;
          const isCorrect = showResult && matching[i] === correctMatching[i];
          return (
            <button
              key={i}
              onClick={() => handleLeft(i)}
              className={`w-full p-3 rounded-xl border-2 border-b-4 text-sm font-bold text-left transition-all ${
                showResult && isMatched ? (isCorrect ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-red-950 border-red-500 text-red-400') :
                isSelected ? 'bg-[#1cb0f6]/20 border-[#1cb0f6] text-white' :
                isMatched ? 'bg-[#58cc02]/10 border-[#58cc02]/50 text-white' :
                'bg-[#202f36] border-[#2b3e47] text-white hover:bg-[#2b3e47]'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      {/* Connector */}
      <div className="flex flex-col justify-around text-white/20 text-xl">
        {question.leftItems.map((_, i) => <span key={i}>→</span>)}
      </div>
      {/* Right Column */}
      <div className="flex-1 space-y-3">
        {question.rightItems.map((item, i) => {
          const isMatched = Object.values(matching).includes(i);
          return (
            <button
              key={i}
              onClick={() => handleRight(i)}
              disabled={isMatched && !showResult}
              className={`w-full p-3 rounded-xl border-2 border-b-4 text-sm font-bold text-left transition-all ${
                isMatched ? 'bg-[#58cc02]/10 border-[#58cc02]/50 text-white/70 cursor-default' :
                selectedLeft !== null ? 'bg-[#202f36] border-[#1cb0f6]/50 text-white hover:bg-[#2b3e47] cursor-pointer' :
                'bg-[#202f36] border-[#2b3e47] text-white hover:bg-[#2b3e47]'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ———————————————————————
// Tick-correct Question
function TickQuestion({ question, selectedIndices = [], onToggle, showResult, correctIndices }) {
  return (
    <div className="space-y-3">
      {question.options.map((opt, i) => {
        const isSelected = selectedIndices.includes(i);
        const isCorrect = correctIndices.includes(i);
        let style = 'bg-[#202f36] border-[#2b3e47] text-white hover:bg-[#2b3e47]';
        if (showResult) {
          if (isCorrect && isSelected) style = 'bg-emerald-950 border-emerald-500 text-emerald-400';
          else if (!isCorrect && isSelected) style = 'bg-red-950 border-red-500 text-red-400';
          else if (isCorrect && !isSelected) style = 'bg-amber-950 border-amber-500 text-amber-400';
          else style = 'bg-[#202f36] border-[#2b3e47] text-white/30';
        } else if (isSelected) {
          style = 'bg-[#1cb0f6]/20 border-[#1cb0f6] text-white';
        }
        return (
          <button
            key={i}
            disabled={showResult}
            onClick={() => onToggle(i)}
            className={`w-full p-4 text-left rounded-2xl border-2 border-b-4 transition-all font-bold text-sm flex items-center gap-3 ${style}`}
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#1cb0f6] border-[#1cb0f6]' : 'border-current opacity-50'}`}>
              {isSelected && <span className="text-white text-xs font-black">✓</span>}
            </div>
            {opt}
          </button>
        );
      })}
      <p className="text-white/40 text-xs text-center font-bold">Select all that apply</p>
    </div>
  );
}

// ———————————————————————
// MAIN MODULE PLAYER
export default function ModulePlayer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { startup, updateModuleProgress } = useUser();

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarState, setAvatarState] = useState('idle');
  const [phase, setPhase] = useState('intro'); // intro | question_0 | question_1 | question_2 | reflection | results
  const [answers, setAnswers] = useState({ 0: null, 1: null, 2: null });
  const [reflection, setReflection] = useState('');
  const [guidance, setGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Decode module title from ID
  const allModules = Object.values(CURRICULUM_FLAT);
  const moduleMeta = allModules.find(m => m.id === moduleId) || { title: 'Module', icon: '📚' };

  // CURRICULUM lookup (flat)
  const CURRICULUM_FLAT = (() => {
    const flat = {};
    for (const [lvl, modules] of Object.entries({ 1: [
      { id: 'l1_m1', title: 'Problem Validation', icon: '🔍', levelTitle: 'Ideation & Discovery' },
      { id: 'l1_m2', title: 'Target Audience', icon: '👥', levelTitle: 'Ideation & Discovery' },
      { id: 'l1_m3', title: 'Competitive Landscape', icon: '🏆', levelTitle: 'Ideation & Discovery' },
      { id: 'l1_m4', title: 'Impact Framework', icon: '🎯', levelTitle: 'Ideation & Discovery' },
      { id: 'l1_m5', title: 'GTM Strategy', icon: '🚀', levelTitle: 'Ideation & Discovery' },
      { id: 'l1_m6', title: 'Funding Options', icon: '💰', levelTitle: 'Ideation & Discovery' },
    ], 2: [
      { id: 'l2_m1', title: 'Jugaad MVP', icon: '🔧', levelTitle: 'Prototyping' },
      { id: 'l2_m2', title: 'Low-Cost Sourcing', icon: '📦', levelTitle: 'Prototyping' },
      { id: 'l2_m3', title: 'User Testing', icon: '🧪', levelTitle: 'Prototyping' },
      { id: 'l2_m4', title: 'Build-Measure-Learn', icon: '🔄', levelTitle: 'Prototyping' },
      { id: 'l2_m5', title: 'Tech vs No-Tech', icon: '💻', levelTitle: 'Prototyping' },
      { id: 'l2_m6', title: 'Pivoting', icon: '↩️', levelTitle: 'Prototyping' },
    ] })) {
      for (const m of modules) flat[m.id] = m;
    }
    return flat;
  })();

  useEffect(() => {
    async function load() {
      if (!startup?.idea) { navigate('/onboarding'); return; }
      try {
        const meta = CURRICULUM_FLAT[moduleId] || { title: moduleId, levelTitle: 'General' };
        const moduleProgress = startup.moduleProgress || {};
        const pastCaseStudyTitles = (moduleProgress[moduleId]?.attempts || []).map(a => a.caseStudyTitle);
        const data = await generateModule({
          startup,
          moduleTitle: meta.title,
          levelTitle: meta.levelTitle,
          pastCaseStudyTitles,
          language
        });
        setModuleData(data);
        // Auto-play TTS of the short summary
        playTTS(data.caseStudy.shortSummary + ' ' + data.caseStudy.challenge);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId]);

  const playTTS = async (text) => {
    setAvatarState('talking');
    setIsPlayingAudio(true);
    try {
      const b64 = await generateSpeech(text.substring(0, 400), language);
      if (b64) {
        const audio = new Audio('data:audio/wav;base64,' + b64);
        audio.onended = () => { setAvatarState('idle'); setIsPlayingAudio(false); };
        await audio.play();
        return;
      }
    } catch (e) { /* noop */ }
    setAvatarState('idle');
    setIsPlayingAudio(false);
  };

  const handleSubmitAll = async () => {
    setLoadingGuidance(true);
    try {
      const questionsWithAnswers = moduleData.questions.map((q, i) => ({
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: q.type === 'mcq' ? q.options[q.correctIndex] : 'See explanation',
        isCorrect: checkCorrect(q, answers[i])
      }));
      const g = await generateGuidance({
        startup,
        moduleTitle: CURRICULUM_FLAT[moduleId]?.title || moduleId,
        questionsWithAnswers,
        reflection,
        language
      });
      setGuidance(g);
      setPhase('results');
      setAvatarState(g.overallScore >= 70 ? 'correct' : 'wrong');
      
      updateModuleProgress(moduleId, {
        score: g.overallScore,
        caseStudyTitle: moduleData.caseStudy.title,
        date: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGuidance(false);
    }
  };

  const checkCorrect = (q, answer) => {
    if (!answer && answer !== 0) return false;
    if (q.type === 'mcq') return answer === q.correctIndex;
    if (q.type === 'tick') {
      const userSet = new Set(answer || []);
      const corrSet = new Set(q.correctIndices);
      return userSet.size === corrSet.size && [...userSet].every(x => corrSet.has(x));
    }
    if (q.type === 'match') {
      return q.correctMatching.every((c, i) => answer?.[i] === c);
    }
    return false;
  };

  const exportPDF = () => {
    if (!guidance || !moduleData) return;
    const content = `
UdyamPath — Module Report
Module: ${CURRICULUM_FLAT[moduleId]?.title || moduleId}
Date: ${new Date().toLocaleDateString('en-IN')}
Score: ${guidance.overallScore}/100

CASE STUDY: ${moduleData.caseStudy.organizationName}
${moduleData.caseStudy.shortSummary}

WHAT THEY DID: ${moduleData.caseStudy.outcome}

YOUR MENTOR SAYS:
${guidance.mentorMessage}

YOUR REFLECTION:
"${reflection}"
Feedback: ${guidance.reflectionFeedback}

NEXT STEP THIS WEEK:
→ ${guidance.nextStepTip}
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UdyamPath_${CURRICULUM_FLAT[moduleId]?.title || 'Module'}_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ——————————— RENDER ———————————

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111b21] flex flex-col items-center justify-center gap-6">
        <Avatar state="talking" />
        <p className="text-white font-black text-xl font-poppins animate-pulse">Loading your case study...</p>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-bold text-xl mb-4">Failed to load module. Please try again.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3 font-black text-lg">Go Back</button>
        </div>
      </div>
    );
  }

  const getCurrentQuestion = () => {
    const idx = parseInt(phase.split('_')[1]);
    return !isNaN(idx) ? moduleData.questions[idx] : null;
  };
  const currentQIdx = parseInt(phase.split('_')[1]);
  const currentQ = getCurrentQuestion();
  const isQuestionPhase = !isNaN(currentQIdx);

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col font-inter text-white">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#202f36] border-b-2 border-[#111b21] px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-white/50 hover:text-white p-2 text-xl font-black">✕</button>
        <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden">
          <div className="h-full bg-[#58cc02] rounded-full transition-all duration-500" style={{
            width: phase === 'intro' ? '5%' : phase === 'question_0' ? '30%' : phase === 'question_1' ? '55%' : phase === 'question_2' ? '75%' : phase === 'reflection' ? '90%' : '100%'
          }}></div>
        </div>
        <span className="text-white/50 text-sm font-bold">{CURRICULUM_FLAT[moduleId]?.icon} {CURRICULUM_FLAT[moduleId]?.title || 'Module'}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-2xl mx-auto w-full">

        {/* ——— PHASE: INTRO ——— */}
        {phase === 'intro' && (
          <div className="animate-slide-up flex flex-col items-center">
            <Avatar state={avatarState} />
            
            {/* Case Study Card */}
            <div className="w-full bg-[#202f36] border-2 border-[#2b3e47] rounded-3xl overflow-hidden mb-6 shadow-xl">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-lg">📖</div>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Case Study</p>
                  <h2 className="text-white font-black text-lg font-poppins">{moduleData.caseStudy.organizationName}</h2>
                </div>
                <button onClick={() => playTTS(moduleData.caseStudy.shortSummary + ' ' + moduleData.caseStudy.challenge)}
                  disabled={isPlayingAudio}
                  className="ml-auto w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin text-white"/> : <Volume2 className="w-5 h-5 text-white"/>}
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-violet-400 font-black text-xs uppercase tracking-widest mb-2">The Story</p>
                  <p className="text-white font-medium leading-relaxed">{moduleData.caseStudy.shortSummary}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-1">⚡ The Challenge</p>
                  <p className="text-white font-bold">{moduleData.caseStudy.challenge}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                  <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-1">✅ The Outcome</p>
                  <p className="text-white font-medium">{moduleData.caseStudy.outcome}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPhase('question_0')}
              className="w-full py-4 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white font-black text-xl rounded-2xl uppercase tracking-widest active:translate-y-1 active:shadow-none transition-all"
            >
              Start Quiz →
            </button>
          </div>
        )}

        {/* ——— PHASE: QUESTION ——— */}
        {isQuestionPhase && currentQ && (
          <div className="animate-slide-up">
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">Question {currentQIdx + 1} of 3</p>
            <h2 className="text-white font-black text-xl font-poppins mb-6">{currentQ.question}</h2>

            {currentQ.type === 'mcq' && (
              <MCQQuestion
                question={currentQ}
                selectedIndex={answers[currentQIdx]}
                onSelect={v => setAnswers(p => ({ ...p, [currentQIdx]: v }))}
                showResult={false}
                correctIndex={currentQ.correctIndex}
              />
            )}

            {currentQ.type === 'match' && (
              <MatchQuestion
                question={currentQ}
                userMatching={answers[currentQIdx] || {}}
                onMatch={v => setAnswers(p => ({ ...p, [currentQIdx]: v }))}
                showResult={false}
                correctMatching={currentQ.correctMatching}
              />
            )}

            {currentQ.type === 'tick' && (
              <TickQuestion
                question={currentQ}
                selectedIndices={answers[currentQIdx] || []}
                onToggle={i => {
                  const curr = answers[currentQIdx] || [];
                  const updated = curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i];
                  setAnswers(p => ({ ...p, [currentQIdx]: updated }));
                }}
                showResult={false}
                correctIndices={currentQ.correctIndices}
              />
            )}

            <button
              onClick={() => setPhase(currentQIdx < 2 ? `question_${currentQIdx + 1}` : 'reflection')}
              disabled={answers[currentQIdx] === null || answers[currentQIdx] === undefined}
              className="mt-8 w-full py-4 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white font-black text-xl rounded-2xl uppercase tracking-widest active:translate-y-1 active:shadow-none transition-all disabled:bg-[#37464f] disabled:shadow-none disabled:text-white/30"
            >
              {currentQIdx < 2 ? 'Next →' : 'Finish Quiz →'}
            </button>
          </div>
        )}

        {/* ——— PHASE: REFLECTION ——— */}
        {phase === 'reflection' && (
          <div className="animate-slide-up">
            <Avatar state="idle" />
            <h2 className="text-white font-black text-2xl font-poppins mb-2 text-center">One final thought</h2>
            <p className="text-white/60 font-bold mb-6 text-center text-sm">{moduleData.reflectionPrompt}</p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Write in 1-2 lines what you'd do..."
              rows={3}
              maxLength={200}
              className="w-full bg-[#202f36] border-2 border-[#2b3e47] rounded-2xl p-4 text-white font-inter resize-none focus:outline-none focus:border-[#58cc02] transition-all"
            />
            <p className="text-white/30 text-xs text-right mb-6">{reflection.length}/200</p>
            <button
              onClick={handleSubmitAll}
              disabled={reflection.length < 5 || loadingGuidance}
              className="w-full py-4 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white font-black text-xl rounded-2xl uppercase tracking-widest active:translate-y-1 active:shadow-none transition-all disabled:bg-[#37464f] disabled:shadow-none disabled:text-white/30 flex items-center justify-center gap-2"
            >
              {loadingGuidance ? <><Loader2 className="w-5 h-5 animate-spin" /> Getting Feedback...</> : 'Get My Results →'}
            </button>
          </div>
        )}

        {/* ——— PHASE: RESULTS ——— */}
        {phase === 'results' && guidance && (
          <div className="animate-slide-up space-y-6">
            <div className="flex flex-col items-center mb-2">
              <Avatar state={guidance.overallScore >= 70 ? 'correct' : 'wrong'} />
              <h1 className="text-4xl font-black font-poppins text-white">{guidance.overallScore >= 70 ? '🎉 Great job!' : '📚 Keep learning!'}</h1>
              <div className="mt-4 flex items-center gap-2 bg-[#202f36] border-2 border-[#2b3e47] px-6 py-3 rounded-2xl">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-black text-white">{guidance.overallScore}</span>
                <span className="text-white/40 font-bold">/100</span>
              </div>
            </div>

            {/* Mentor Message */}
            <div className="bg-violet-950 border-2 border-violet-500/50 rounded-3xl p-5">
              <p className="text-violet-400 font-black text-xs uppercase tracking-widest mb-2">Mentor Says</p>
              <p className="text-white font-medium leading-relaxed">{guidance.mentorMessage}</p>
            </div>

            {/* Per-Question Feedback */}
            <div className="space-y-3">
              <p className="text-white/50 font-black text-xs uppercase tracking-widest">Question Breakdown</p>
              {guidance.questionFeedback.map((fb, i) => (
                <div key={i} className={`p-4 rounded-2xl border-2 ${fb.isCorrect ? 'bg-emerald-950 border-emerald-500/50' : 'bg-red-950 border-red-500/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {fb.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400"/> : <XCircle className="w-5 h-5 text-red-400"/>}
                    <span className={`font-black text-sm ${fb.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      Q{i+1}: {fb.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{fb.guidance}</p>
                </div>
              ))}
            </div>

            {/* Reflection Feedback */}
            <div className="bg-blue-950 border-2 border-blue-500/50 rounded-3xl p-5">
              <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2">Your Reflection Feedback</p>
              <p className="text-white/80 italic mb-2">"{reflection}"</p>
              <p className="text-white font-medium">{guidance.reflectionFeedback}</p>
            </div>

            {/* Next Step */}
            <div className="bg-amber-950 border-2 border-amber-500/50 rounded-3xl p-5">
              <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-2">⚡ This Week's Action</p>
              <p className="text-white font-bold">{guidance.nextStepTip}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pb-8">
              <button onClick={exportPDF} className="flex-1 py-3 bg-[#202f36] border-2 border-[#2b3e47] rounded-2xl font-black flex items-center justify-center gap-2 text-white/70 hover:text-white hover:border-white/40 transition-all">
                <Download className="w-5 h-5"/> Download Report
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 bg-[#58cc02] shadow-[0_4px_0_#58a700] text-white rounded-2xl font-black flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all">
                Continue <ArrowRight className="w-5 h-5"/>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
