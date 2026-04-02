import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, RotateCcw, MessageCircle, ArrowRight, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useOpenAI from '../hooks/useOpenAI';
import ScoreRing from '../components/ScoreRing';
import GrowthChart from '../components/GrowthChart';
import { generatePDFReport } from '../utils/pdfGenerator';

export default function Report() {
  const { state, updateState } = useAppContext();
  const navigate = useNavigate();
  const { generateJSON } = useOpenAI();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  // Derive score
  const score = state.currentAnswers?.filter(a => a.isCorrect).length || 0;
  
  const getPerformanceLabel = (s) => {
    if (s >= 6) return "IIM-Level Thinker 🏆";
    if (s >= 5) return "Exceptional Founder 💪";
    if (s >= 4) return "Strong Strategist 📈";
    if (s >= 3) return "Good Progress 📚";
    return "Just Getting Started 🌱";
  };

  useEffect(() => {
    if (!state.currentAnswers || state.currentAnswers.length === 0) {
      navigate('/dashboard');
      return;
    }

    const fetchInsights = async () => {
      try {
        const prompt = `Analyze this founder's performance in an entrepreneurship case study.
Idea: ${state.idea}
Module: ${state.currentModule?.name}
Score: ${score}/6
Detailed Answers: ${JSON.stringify(state.currentAnswers)}

Return ONLY JSON:
{
  "overallInsight": "String (2-3 sentences)",
  "strength": "String (what they clearly understand)",
  "blindSpot": "String (their most critical gap)",
  "oneLineSolution": "String (THE HERO ELEMENT - single most important takeaway)",
  "howRealFounderSolvedIt": "String (2-3 sentences about the real company's decision)",
  "analogyForTheirIdea": "String (connect case study specifically to their idea)",
  "nextStepAction": "String (one specific thing to do THIS WEEK)",
  "nextRecommendedModule": "String (which module next based on blind spot)",
  "encouragement": "String (warm Indian mentor tone)"
}`;
        
        const result = await generateJSON(prompt, 0.6);
        setInsights(result);

        // Update global state tracking
        updateState({
          report: { score, insights: result, generatedAt: new Date().toISOString() },
          moduleProgress: {
            ...state.moduleProgress,
            [state.currentModule.id]: {
              ...(state.moduleProgress[state.currentModule.id] || {}),
              attempts: (state.moduleProgress[state.currentModule.id]?.attempts || 0) + 1,
              lastScore: score,
              scoreHistory: [...(state.moduleProgress[state.currentModule.id]?.scoreHistory || []), score],
              masteryLevel: Math.min(100, (state.moduleProgress[state.currentModule.id]?.masteryLevel || 0) + (score > 4 ? 15 : score >= 3 ? 10 : 5))
            }
          }
        });

      } catch (err) {
        console.error("Insights Generation Failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, []); // eslint-disable-line

  const handleDownloadPDF = () => {
    if (insights && state) {
       generatePDFReport(state, { score, insights });
    }
  };

  if (loading) {
    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin mb-6"></div>
        <p className="text-xl text-white font-poppins animate-pulse">Udyam Guru is writing your personalized action plan...</p>
      </div>
    );
  }

  if (!insights) return <div className="p-24 text-white text-center">Failed to load report. Check console.</div>;

  return (
    <div className="bg-navy min-h-screen pt-24 pb-24 px-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-3xl -mr-[250px] -mt-[250px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-saffron rounded-2xl p-8 md:p-12 text-center shadow-[0_0_40px_rgba(255,107,53,0.4)] relative"
        >
          <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-white font-bold text-sm tracking-widest uppercase mb-4">
            The Golden Rule
          </div>
          <h1 className="text-3xl md:text-5xl font-poppins font-extrabold text-white leading-tight">
            "{insights.oneLineSolution}"
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COL: SCORE & ACTIONS */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8 md:col-span-1">
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
               <ScoreRing score={(score / 6) * 100} label={`${score} / 6`} color="#0f9b58" delay={500} />
               <h3 className="text-xl font-bold text-white mt-4">{getPerformanceLabel(score)}</h3>
               <p className="text-muted mt-2 text-sm">{state.currentModule?.timeSpent ? `You spent ${Math.round(state.currentModule.timeSpent/60)} minutes thinking deeply.` : 'Quick but insightful!'}</p>
            </div>

            <div className="glass-card p-6 border-2 border-saffron bg-saffron/5">
               <h3 className="text-saffron font-bold text-sm uppercase tracking-wider mb-3">DO THIS THIS WEEK</h3>
               <p className="text-white font-bold leading-relaxed">{insights.nextStepAction}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleDownloadPDF} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                <Download className="w-5 h-5" /> Download Full PDF Report
              </button>
              
              <button onClick={() => navigate('/module')} className="btn-ghost w-full flex items-center justify-center gap-2 py-4 border-white/20 text-white hover:text-saffron">
                <RotateCcw className="w-5 h-5" /> Try Same Module Again
              </button>

              <button onClick={() => navigate('/dashboard')} className="glass-card w-full flex items-center justify-between p-4 group hover:border-saffron/50 transition-colors">
                 <div className="text-left">
                   <span className="text-xs text-muted block uppercase tracking-wider">Next Recommended</span>
                   <span className="text-white font-bold">{insights.nextRecommendedModule}</span>
                 </div>
                 <ArrowRight className="w-5 h-5 text-muted group-hover:text-saffron group-hover:translate-x-1" />
              </button>
            </div>
            
            {/* Show Growth Chart if they've attempted this module before */}
            {state.moduleProgress[state.currentModule.id]?.scoreHistory?.length >= 2 && (
              <GrowthChart history={state.moduleProgress[state.currentModule.id]?.scoreHistory || []} />
            )}
          </motion.div>

          {/* RIGHT COL: INSIGHTS & ANSWERS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8 md:col-span-2">
             
             {/* Bento Insights */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="glass-card p-6 border-t-2 border-t-successGreen">
                 <h4 className="text-successGreen text-sm font-bold uppercase tracking-wider mb-2">Strength</h4>
                 <p className="text-white text-sm leading-relaxed">{insights.strength}</p>
               </div>
               <div className="glass-card p-6 border-t-2 border-t-accentRed">
                 <h4 className="text-accentRed text-sm font-bold uppercase tracking-wider mb-2">Blind Spot</h4>
                 <p className="text-white text-sm leading-relaxed">{insights.blindSpot}</p>
               </div>
               <div className="glass-card p-6 bg-surface/80">
                 <h4 className="text-saffron text-sm font-bold uppercase tracking-wider mb-2">Real Founder Reality</h4>
                 <p className="text-muted text-sm leading-relaxed italic border-l border-saffron pl-3">"{insights.howRealFounderSolvedIt}"</p>
               </div>
               <div className="glass-card p-6 bg-surface/80 border border-saffron/20">
                 <h4 className="text-saffron text-sm font-bold uppercase tracking-wider mb-2">Your Analogy</h4>
                 <p className="text-white text-sm leading-relaxed">{insights.analogyForTheirIdea}</p>
               </div>
             </div>

             {/* Personal Message */}
             <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 rounded-full bg-navy border border-saffron flex items-center justify-center font-bold text-saffron text-2xl flex-shrink-0">
                  UG
                </div>
                <p className="text-white text-lg font-medium italic">"{insights.encouragement}"</p>
             </div>

             {/* Answer Review Accordion */}
             <div className="glass-card p-6 overflow-hidden">
               <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-saffron"/> Answer Review Log
               </h3>
               
               <div className="space-y-6">
                 {state.currentAnswers?.map((ans, i) => (
                   <div key={i} className="pb-6 border-b border-white/5 last:border-0">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {ans.isCorrect ? <CheckCircle className="w-6 h-6 text-successGreen" /> : <XCircle className="w-6 h-6 text-accentRed" />}
                        </div>
                        <div className="flex-1">
                           <p className="text-white font-bold mb-2">Q: {ans.question}</p>
                           <p className="text-sm text-muted mb-2">Your Answer: <span className={`font-medium ${ans.isCorrect ? 'text-successGreen' : 'text-accentRed'}`}>{(typeof ans.userAnswer === 'object' ? JSON.stringify(ans.userAnswer) : ans.userAnswer?.toString()) || "None"}</span></p>
                           <div className="bg-surface p-3 rounded text-sm text-white/80 leading-relaxed border-l border-white/10">
                             {ans.explanation}
                           </div>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}