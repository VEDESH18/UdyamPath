import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useGame } from '../context/GameContext';
import { generateScenario } from '../services/aiService';
import { Heart, Coins, Users, Target, ArrowRight, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { generateSpeech } from '../services/sarvamService';

// Duolingo-style Resource Badge
function ResourceBadge({ icon, value, color, label }) {
  const colorMap = {
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 ${colorMap[color]} shadow-sm`}>
      <div className="flex items-center gap-1.5 mb-1 font-black text-lg">
        {icon} <span className="font-poppins">{value}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}

export default function UdyamBoard() {
  const { t, language } = useLanguage();
  const { startup, passLevel, assignHomework } = useUser();
  const { state, dispatch, checkLevelThreshold } = useGame();
  const navigate = useNavigate();

  const [scenarioData, setScenarioData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [consequence, setConsequence] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // playing | level_passed | level_failed

  // Phase Intro mapping
  const currentLevelId = state.currentLevel;
  const levels = {
    1: { title: "Ideation & Discovery", desc: "Find a real problem worth solving.", reqImpact: 60, reqTrust: 50 },
    2: { title: "Prototyping (Jugaad)", desc: "Build a low-cost Version 1.0.", reqFinance: 50, reqTeam: 40 },
    3: { title: "Market Entry", desc: "Acquire your first 100 paying customers.", reqFinance: 60, reqImpact: 70 },
  };
  const activeLevel = levels[currentLevelId] || levels[1];

  // Initialize Game only once per level entry
  useEffect(() => {
    if (state.turn === 0 && !scenarioData && !isEvaluating) {
      loadNextScenario();
    }
  }, [state.turn, scenarioData, isEvaluating]);

  const loadNextScenario = async () => {
    setIsEvaluating(true);
    try {
      const data = await generateScenario({
        startup,
        turn: state.turn + 1,
        resources: state.resources,
        language,
        founderDNA: state.founderDNA,
        levelDetails: { title: `Level ${currentLevelId}`, description: activeLevel.desc }
      });
      setScenarioData(data);
      setSelectedOption(null);
      setConsequence(null);
      dispatch({ type: 'NEXT_TURN' });
    } catch (e) {
      console.error(e);
      // Fallback MCQ if API fails (saves token crash)
      setScenarioData({
        scenario: { context: "The local panchayat is skeptical of your idea.", question: "How do you win them over?" },
        options: [
          { id: "A", text: "Bribe them (Unethical)" },
          { id: "B", text: "Invite them to a free demo" },
          { id: "C", text: "Ignore them and sell directly" },
          { id: "D", text: "Hire a local influencer" }
        ],
        consequences: {
          A: { budget: -5000, trust: -30, impact: -10, morale: -20, lesson: "Unethical shortcuts destroy trust permanently in rural markets." },
          B: { budget: -500, trust: 20, impact: 10, morale: 10, lesson: "Seeing is believing. Demos build authentic community trust." },
          C: { budget: 0, trust: -10, impact: -5, morale: -5, lesson: "Ignoring local governance leads to regulatory roadblocks later." },
          D: { budget: -2000, trust: 5, impact: 5, morale: 0, lesson: "Influencers cost money and lack authentic local governance pull." }
        }
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOptionSelect = (id) => {
    if (consequence) return; // Prevent changing after submission
    setSelectedOption(id);
  };

  const submitDecision = () => {
    if (!selectedOption || !scenarioData) return;
    
    // Reveal consequence instantly without OpenAI call!
    const result = scenarioData.consequences[selectedOption];
    setConsequence(result);
    
    // Apply stats to engine
    dispatch({
      type: 'APPLY_CONSEQUENCE',
      payload: { ...result, question: scenarioData.scenario.question, decision: scenarioData.options.find(o=>o.id===selectedOption).text }
    });
  };

  const handleContinue = async () => {
    // Check if level is over (e.g. 3 turns per level)
    if (state.turn >= 3) {
      setIsEvaluating(true);
      const { passed, scoreSummary } = checkLevelThreshold(currentLevelId);
      
      if (passed) {
        passLevel(currentLevelId, scoreSummary);
        setGameStatus('level_passed');
      } else {
        // Here we still call OpenAI once to evaluate the failure and assign homework dynamically
        try {
           const { evaluateLevelFailure } = await import('../services/aiService');
           const failureData = await evaluateLevelFailure({
             startup,
             levelDetails: { title: activeLevel.title, description: activeLevel.desc, thresholds: { impact: activeLevel.reqImpact, finance: activeLevel.reqFinance, trust: activeLevel.reqTrust, team: activeLevel.reqTeam } },
             scores: scoreSummary,
             history: state.history,
             language
           });
           assignHomework(failureData.assignedHomework);
           setConsequence({ ...result, failureAnalysis: failureData.mentorMessage });
        } catch(e) {
           assignHomework([{title: "Understanding Local Markets", reason: "General weakness detected.", estimatedTime: "15 mins"}]);
        }
        setGameStatus('level_failed');
      }
      setIsEvaluating(false);
    } else {
      loadNextScenario();
    }
  };

  const handleListen = async () => {
    if (isPlayingAudio || !scenarioData) return;
    setIsPlayingAudio(true);
    try {
      const base64Audio = await generateSpeech(scenarioData.scenario.context, language);
      if (!base64Audio) throw new Error("Audio generation failed");
      const audio = new Audio("data:audio/wav;base64," + base64Audio);
      audio.onended = () => setIsPlayingAudio(false);
      await audio.play();
    } catch(e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  if (gameStatus === 'level_passed') {
    return (
      <div className="min-h-screen bg-[#1cb0f6] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_0_rgba(0,0,0,0.1)] animate-bounce">
          <Sparkles className="w-12 h-12 text-[#1cb0f6]" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md font-poppins tracking-tight">LEVEL CLEARED!</h1>
        <p className="text-xl text-white/90 font-bold mb-8">You mastered {activeLevel.title}.</p>
        
        <div className="bg-white/20 p-6 rounded-3xl mb-8 w-full max-w-sm backdrop-blur-sm border-2 border-white/30">
          <p className="text-white font-bold mb-2 uppercase tracking-widest text-sm">Final Scores</p>
          <div className="flex justify-between text-white font-black text-xl mb-1"><span>Impact:</span><span>{state.resources.impact} / {activeLevel.reqImpact || 0}</span></div>
          <div className="flex justify-between text-white font-black text-xl"><span>Trust:</span><span>{state.resources.trust} / {activeLevel.reqTrust || 0}</span></div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full max-w-sm py-4 bg-white text-[#1cb0f6] font-black text-xl rounded-2xl shadow-[0_6px_0_#d7effc] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-wide"
        >
          Continue Journey
        </button>
      </div>
    );
  }

  if (gameStatus === 'level_failed') {
    return (
      <div className="min-h-screen bg-[#ff4b4b] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_0_rgba(0,0,0,0.1)]">
          <ShieldAlert className="w-12 h-12 text-[#ff4b4b]" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md font-poppins tracking-tight">LEVEL FAILED!</h1>
        <p className="text-xl text-white/90 font-bold mb-8">You didn't meet the market thresholds.</p>
        
        <div className="bg-white/20 p-6 rounded-3xl mb-8 w-full max-w-sm backdrop-blur-sm border-2 border-white/30">
          <p className="text-white font-bold mb-2 uppercase tracking-widest text-sm">AI Mentor Analysis</p>
          <p className="text-white text-md font-medium">{consequence?.failureAnalysis || "Your strategy lacked focus on local community trust and sustainable unit economics."}</p>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full max-w-sm py-4 bg-white text-[#ff4b4b] font-black text-xl rounded-2xl shadow-[0_6px_0_#ffc5c5] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-wide"
        >
          Review Homework
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col">
      {/* Duolingo Top Progress Bar */}
      <div className="px-4 py-6 bg-[#202f36] border-b-4 border-[#111b21] sticky top-0 z-10 flex items-center justify-between">
         <div className="flex items-center gap-4 w-full max-w-3xl mx-auto">
            <button onClick={() => navigate('/dashboard')} className="text-white/50 hover:text-white font-bold p-2 text-xl">✕</button>
            <div className="flex-1 bg-white/10 h-4 rounded-full overflow-hidden relative">
               <div className="absolute top-0 left-0 h-full bg-[#58cc02] rounded-full transition-all duration-500" style={{width: ((state.turn / 3) * 100) + '%'}}></div>
               <div className="absolute top-1 left-2 right-2 h-[4px] bg-white/30 rounded-full"></div> {/* Duolingo gloss inside progress bar */}
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Resource Hub */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            <ResourceBadge icon="₹" value={state.resources.budget} color="yellow" label="Budget" />
            <ResourceBadge icon={<Target className="w-5 h-5"/>} value={state.resources.impact} color="emerald" label="Impact" />
            <ResourceBadge icon={<Users className="w-5 h-5"/>} value={state.resources.trust} color="blue" label="Trust" />
            <ResourceBadge icon={<Heart className="w-5 h-5"/>} value={state.resources.morale} color="rose" label="Morale" />
          </div>

          {!scenarioData || isEvaluating ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/60 font-bold text-lg animate-pulse tracking-wide">Cooking up a scenario...</p>
            </div>
          ) : (
            <div className="animate-slide-up">
              {/* Scenario Context */}
              <div className="mb-8">
                 <h2 className="text-2xl font-black text-white mb-2 font-poppins">{scenarioData.scenario.question}</h2>
                 <div className="bg-[#202f36] border-2 border-[#2b3e47] p-4 rounded-2xl relative shadow-sm">
                    <p className="text-[#a5ed6e] font-bold text-lg pr-14">{scenarioData.scenario.context}</p>
                    <button 
                      onClick={handleListen}
                      disabled={isPlayingAudio}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1cb0f6] text-white rounded-xl shadow-[0_4px_0_#1899d6] flex items-center justify-center active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all font-bold"
                      title="Listen to scenario in local language"
                    >
                      {isPlayingAudio ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : <Volume2 className="w-6 h-6"/>}
                    </button>
                 </div>
              </div>

              {/* MCQ Options (Duolingo Style Buttons) */}
              <div className="space-y-3 mb-8">
                {scenarioData.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={consequence !== null}
                    className={`w-full p-4 rounded-2xl border-b-4 text-left transition-all relative ${
                      consequence && selectedOption === opt.id
                        ? consequence.impact > 0 
                          ? 'bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]' // Correct/Good
                          : 'bg-[#ffdfe0] border-[#ea2b2b] text-[#ea2b2b]' // Incorrect/Bad
                        : selectedOption === opt.id
                          ? 'bg-[#ddf4ff] border-[#1cb0f6] text-[#1cb0f6] translate-y-[2px] border-b-2' 
                          : consequence
                            ? 'bg-[#202f36] border-[#111b21] text-white/30 opacity-50 cursor-not-allowed'
                            : 'bg-[#202f36] border-[#111b21] text-white hover:bg-[#2b3e47] active:translate-y-[2px] active:border-b-2'
                    }`}
                  >
                     <span className="font-poppins font-bold text-[16px]">{opt.text}</span>
                  </button>
                ))}
              </div>

              {/* Consequence Reveal Box (Slides up from bottom in Duolingo) */}
              {consequence && (
                 <div className={`p-6 rounded-3xl border-b-4 mb-24 animate-slide-up ${
                    consequence.impact > 0 
                      ? 'bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]' 
                      : 'bg-[#ffdfe0] border-[#ea2b2b] text-[#ea2b2b]'
                 }`}>
                    <div className="flex items-center gap-3 mb-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${consequence.impact > 0 ? 'bg-[#58cc02]' : 'bg-[#ea2b2b]'}`}>
                          {consequence.impact > 0 ? '✓' : '✕'}
                       </div>
                       <h3 className="text-2xl font-black font-poppins">{consequence.impact > 0 ? 'Great move!' : 'Not quite right.'}</h3>
                    </div>
                    <p className="font-bold text-lg mb-4 opacity-90">{consequence.lesson}</p>
                    
                    <div className="flex gap-4">
                       {consequence.impact !== 0 && <span className="font-black text-sm px-2 py-1 rounded bg-black/10">Impact {consequence.impact > 0 ? '+'+consequence.impact : consequence.impact}</span>}
                       {consequence.budget !== 0 && <span className="font-black text-sm px-2 py-1 rounded bg-black/10">₹ {consequence.budget}</span>}
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="border-t-2 border-[#111b21] bg-[#202f36] p-4 sticky bottom-0 z-20">
         <div className="max-w-3xl mx-auto">
            {!consequence ? (
               <button 
                  onClick={submitDecision}
                  disabled={!selectedOption || isEvaluating}
                  className="w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all bg-[#58cc02] text-white shadow-[0_4px_0_#58a700] active:translate-y-[4px] active:shadow-none disabled:bg-[#37464f] disabled:text-white/30 disabled:shadow-none"
               >
                  Check
               </button>
            ) : (
               <button 
                  onClick={handleContinue}
                  className={`w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all text-white active:translate-y-[4px] active:shadow-none ${
                     consequence.impact > 0 
                     ? 'bg-[#58cc02] shadow-[0_4px_0_#58a700]' 
                     : 'bg-[#ea2b2b] shadow-[0_4px_0_#c01f1f]'
                  }`}
               >
                  Continue
               </button>
            )}
         </div>
      </div>
    </div>
  );
}
