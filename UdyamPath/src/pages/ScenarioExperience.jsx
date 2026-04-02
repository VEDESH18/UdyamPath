import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchNews } from '../services/newsService';
import { generateScenario, evaluateDecision } from '../services/aiService';
import AvatarSpeech from '../components/AvatarSpeech';
import { IndianRupee, Users, Target, X, Loader2, AlertTriangle, ChevronRight, CheckSquare, Square, CornerDownRight } from 'lucide-react';

export default function ScenarioExperience() {
  const navigate = useNavigate();
  const { state, updateState, updateUser } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simulation Data
  const [scenarioData, setScenarioData] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  
  // Live Metrics
  const [budget, setBudget] = useState(state.user?.budget || 100000);
  const [trust, setTrust] = useState(50);
  const [impact, setImpact] = useState(50);
  const [metricDeltas, setMetricDeltas] = useState({ budget: null, trust: null, impact: null });

  // State per Stage
  // MCQ: selected string
  // MultiSelect: array of selected strings
  // Text: string
  const [stageAnswers, setStageAnswers] = useState({});
  const [feedbackNode, setFeedbackNode] = useState(null); // Shows consequences/guidance
  const [awaitingRetry, setAwaitingRetry] = useState(false); // Force them to rethink if they fail MCQ
  const [gradeLoading, setGradeLoading] = useState(false); // For text evaluation

  useEffect(() => {
    if (!state.currentModule || !state.idea) {
      navigate('/modules'); return;
    }
    initScenario();
  }, []);

  const initScenario = async () => {
    setLoading(true); setError(null);
    try {
      // Find out what companies they already played to prevent repeats
      const history = Object.values(state.moduleHistory || {}).map(m => m.analogy).filter(Boolean);

      const newsArticles = await fetchNews(`${state.idea} ${state.currentModule.name} India startup`);
      const newsContext = newsArticles && newsArticles.length > 0 
        ? `${newsArticles[0].title}. ${newsArticles[0].description}`
        : 'The Indian startup market is becoming highly competitive with tightening budgets.';

      const data = await generateScenario({
        startup: { idea: state.idea, city: state.user?.city },
        module: state.currentModule,
        language: state.language,
        newsContext,
        previousAnalogies: history
      });

      setScenarioData(data);
      updateState({ currentAnalogy: data.realWorldAnalogy });
      setCurrentStageIndex(0);
      setStageAnswers({});
      setFeedbackNode(null);

    } catch (err) {
      setError('Failed to load deep case study. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyConsequences = (cBudget, cTrust, cImpact) => {
    setBudget(prev => prev + (cBudget || 0));
    setTrust(prev => Math.max(0, Math.min(100, prev + (cTrust || 0))));
    setImpact(prev => Math.max(0, Math.min(100, prev + (cImpact || 0))));
    
    setMetricDeltas({ budget: cBudget, trust: cTrust, impact: cImpact });
    setTimeout(() => setMetricDeltas({ budget: null, trust: null, impact: null }), 2000);
  };

  const handleMCQSelect = (opt) => {
    if (feedbackNode) return; // Wait for them to acknowledge feedback
    
    setStageAnswers(prev => ({ ...prev, [currentStageIndex]: opt.id }));
    applyConsequences(opt.budget, opt.trust, 0);

    setFeedbackNode({
      isOptimal: opt.isOptimal,
      insight: opt.insight,
      text: opt.text
    });

    if (!opt.isOptimal) {
      setAwaitingRetry(true); // Force retry to learn
    } else {
      setAwaitingRetry(false);
    }
  };

  const toggleMultiSelectOption = (optId) => {
    if (feedbackNode) return;
    const currentList = stageAnswers[currentStageIndex] || [];
    if (currentList.includes(optId)) {
      setStageAnswers(prev => ({ ...prev, [currentStageIndex]: currentList.filter(id => id !== optId) }));
    } else {
      if (currentList.length < 2) {
        setStageAnswers(prev => ({ ...prev, [currentStageIndex]: [...currentList, optId] }));
      }
    }
  };

  const submitMultiSelect = () => {
    const stage = scenarioData.stages[currentStageIndex];
    const userSelections = stageAnswers[currentStageIndex] || [];
    if (userSelections.length !== 2) return;

    const correctIds = stage.options.filter(o => o.isOptimal).map(o => o.id);
    const isPerfect = userSelections.every(id => correctIds.includes(id));

    applyConsequences(isPerfect ? 5000 : -5000, isPerfect ? 20 : -10, 0);

    setFeedbackNode({
      isOptimal: isPerfect,
      insight: isPerfect ? stage.feedback.success : stage.feedback.failure
    });
    setAwaitingRetry(!isPerfect);
  };

  const handleTextInput = (e) => {
    setStageAnswers(prev => ({ ...prev, [currentStageIndex]: e.target.value }));
  };

  const submitText = async () => {
    const text = stageAnswers[currentStageIndex];
    if (!text || text.length < 5) return;

    setGradeLoading(true);
    const stage = scenarioData.stages[currentStageIndex];
    
    try {
      const evalData = await evaluateDecision({
        scenarioContext: stage.context,
        userResponse: text,
        language: state.language
      });

      applyConsequences(evalData.score > 80 ? 5000 : -2000, evalData.score > 80 ? 20 : 0, 0);

      setFeedbackNode({
        isOptimal: evalData.score > 80,
        insight: evalData.feedback,
        score: evalData.score
      });
      setAwaitingRetry(false); // Text is usually final, no retry needed
    } catch(e) {
      console.error(e);
    } finally {
      setGradeLoading(false);
    }
  };

  const nextStage = () => {
    if (currentStageIndex < scenarioData.stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      setFeedbackNode(null);
      setAwaitingRetry(false);
    } else {
      finishModule();
    }
  };

  const retryStage = () => {
    setFeedbackNode(null);
    setAwaitingRetry(false);
    // Clear current answer so they can pick again
    setStageAnswers(prev => ({ ...prev, [currentStageIndex]: undefined }));
  };

  const finishModule = () => {
    // Generate Report
    const modId = state.currentModule.id;
    const historyUpdate = { ...state.moduleHistory };
    
    // Calculate naive score based on final text grade or general flow
    const finalScore = feedbackNode?.score || 85; 

    // Save analogy used so it isn't repeated
    historyUpdate[modId] = { 
       attempts: (historyUpdate[modId]?.attempts || 0) + 1, 
       lastScore: finalScore,
       analogy: scenarioData.realWorldAnalogy
    };
    
    const attemptsLog = scenarioData.stages.map((stg, i) => ({
      stageContext: stg.context,
      question: stg.question,
      userAnswerRaw: stageAnswers[i]
    }));

    updateState({
      moduleHistory: historyUpdate,
      currentAnswers: [...(state.currentAnswers || []), {
           moduleContent: state.currentModule,
           scenario: { context: `Comparative Case Study: ${scenarioData.realWorldAnalogy}` },
           attempts: attemptsLog,
           finalScore: finalScore
      }]
    });
    updateUser({ budget });
    navigate('/report');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
      <Loader2 className="w-16 h-16 text-[#1CB0F6] animate-spin mb-6" />
      <p className="text-white font-poppins font-black text-2xl text-center">Generating Case Study...</p>
      <p className="text-white/40 font-inter mt-2">Connecting your idea to real-world precedents</p>
    </div>
  );

  if (error || !scenarioData) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
       <AlertTriangle className="w-16 h-16 text-[#FF4B4B] mb-6" />
       <p className="text-white mb-6 text-xl font-bold">{error}</p>
       <button onClick={initScenario} className="btn-primary">Retry Generation</button>
    </div>
  );

  const currentStage = scenarioData.stages[currentStageIndex];

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-inter max-h-screen overflow-hidden">
      
      {/* Top Bar with Live Metrics */}
      <div className="bg-[#1a1a1a] border-b border-white/10 p-4 flex justify-between items-center z-20">
         <button onClick={() => navigate('/modules')} className="text-white/40 hover:text-white flex items-center gap-2 font-bold px-4 py-2 transition-colors">
            <X className="w-5 h-5" /> Exit Module
         </button>
         
         <div className="flex gap-2 sm:gap-4">
            <div className={`relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border transition-all ${budget <= 0 ? 'text-[#FF4B4B] border-[#FF4B4B]/50' : 'text-white border-white/10'}`}>
               <IndianRupee className="w-4 h-4"/>
               <span className="font-bold font-poppins font-mono">{(budget).toLocaleString('en-IN')}</span>
               {metricDeltas.budget !== null && (
                 <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-black animate-slide-up ${metricDeltas.budget > 0 ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                   {metricDeltas.budget > 0 ? '+' : ''}{metricDeltas.budget}
                 </span>
               )}
            </div>
            
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
               <Users className={`w-4 h-4 transition-colors ${trust < 30 ? 'text-[#FF4B4B]' : 'text-[#1CB0F6]'}`}/>
               <span className="font-bold font-poppins font-mono">{Math.floor(trust)} Trust</span>
               {metricDeltas.trust !== null && (
                 <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-black animate-slide-up ${metricDeltas.trust > 0 ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                   {metricDeltas.trust > 0 ? '+' : ''}{metricDeltas.trust}
                 </span>
               )}
            </div>
         </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col items-center">
         
         {/* Top Banner identifying the Comparative Study */}
         <div className="w-full bg-[#1CB0F6]/10 border-b border-[#1CB0F6]/20 py-2 text-center shadow-md">
            <p className="text-[#1CB0F6] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
               <span>Stage {currentStageIndex + 1} of {scenarioData.stages.length}</span>
               <span>|</span>
               <span>Real World Case: <span className="text-white">"{scenarioData.realWorldAnalogy}"</span></span>
            </p>
         </div>

         {/* Content Container */}
         <div className="w-full max-w-4xl px-4 py-8 flex flex-col gap-6 animate-fade-in pb-32">
            
            {/* The Avatar Reading the Context */}
            <AvatarSpeech text={currentStage.context} />

            {/* The Question Phase */}
            <div className="bg-[#1a1a1a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative">
                <h2 className="text-white font-poppins font-black text-2xl md:text-3xl leading-tight mb-8">
                  {currentStage.question}
                </h2>

                {/* MCQ Renderer */}
                {currentStage.type === 'mcq' && (
                  <div className="flex flex-col gap-4">
                     {currentStage.options.map(opt => {
                        const isSelected = stageAnswers[currentStageIndex] === opt.id;
                        return (
                           <button
                             key={opt.id}
                             onClick={() => handleMCQSelect(opt)}
                             disabled={!!feedbackNode} // Lock if processing feedback
                             className={`text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${
                               isSelected 
                               ? (feedbackNode?.isOptimal ? 'bg-[#58CC02]/20 border-[#58CC02] text-white shadow-[0_0_15px_rgba(88,204,2,0.3)]' : 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow-[0_0_15px_rgba(255,75,75,0.3)]')
                               : 'bg-[#0f0f0f] border-white/5 text-white/70 hover:bg-white/5 hover:border-white/20'
                             }`}
                           >
                              <span className="font-medium text-lg pr-4">{opt.text}</span>
                           </button>
                        );
                     })}
                  </div>
                )}

                {/* Multi-Select Renderer */}
                {currentStage.type === 'multiselect' && (
                  <div className="flex flex-col gap-4">
                     <p className="text-[#FFC800] text-sm font-bold mb-2">Select exactly 2 options:</p>
                     {currentStage.options.map(opt => {
                        const selectedList = stageAnswers[currentStageIndex] || [];
                        const isSelected = selectedList.includes(opt.id);
                        return (
                           <button
                             key={opt.id}
                             onClick={() => toggleMultiSelectOption(opt.id)}
                             disabled={!!feedbackNode}
                             className={`text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                               isSelected ? 'bg-white/10 border-[#1CB0F6] text-white shadow-sm' : 'bg-[#0f0f0f] border-white/5 text-white/70 hover:bg-white/5 hover:border-white/20'
                             }`}
                           >
                              <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border ${isSelected ? 'bg-[#1CB0F6] border-[#1CB0F6]' : 'border-white/20'} flex items-center justify-center transition-colors`}>
                                 {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                              </div>
                              <span className="font-medium text-lg leading-snug">{opt.text}</span>
                           </button>
                        );
                     })}
                     
                     <div className="mt-4 flex justify-end">
                       <button 
                         onClick={submitMultiSelect}
                         disabled={!!feedbackNode || (stageAnswers[currentStageIndex] || []).length !== 2}
                         className="btn-primary"
                       >
                         Confirm Selection
                       </button>
                     </div>
                  </div>
                )}

                {/* Text Input Renderer */}
                {currentStage.type === 'input' && (
                  <div className="flex flex-col gap-4">
                     <textarea
                       value={stageAnswers[currentStageIndex] || ''}
                       onChange={handleTextInput}
                       disabled={!!feedbackNode || gradeLoading}
                       placeholder="Type your strategy here..."
                       className="w-full h-32 input-primary p-4 text-white text-lg font-medium resize-none shadow-inner"
                     />
                     <div className="flex justify-end mt-2">
                       <button onClick={submitText} disabled={!!feedbackNode || gradeLoading || (stageAnswers[currentStageIndex] || '').length < 5} className="btn-primary flex items-center gap-2">
                          {gradeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CornerDownRight className="w-5 h-5" />}
                          Submit Strategy
                       </button>
                     </div>
                  </div>
                )}
            </div>

            {/* Contextual Feedback & Guidance Panel */}
            {feedbackNode && (
               <div className={`p-6 rounded-3xl border animate-slide-up shadow-2xl relative ${
                  feedbackNode.isOptimal ? 'bg-[#58CC02]/10 border-[#58CC02]/30' : 'bg-[#1a1a1a] border-[#FF4B4B]/30'
               }`}>
                  <div className="flex items-start gap-4">
                     <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${feedbackNode.isOptimal ? 'bg-[#58CC02]/20 text-[#58CC02]' : 'bg-[#FF4B4B]/10 text-[#FF4B4B]'}`}>
                       {feedbackNode.isOptimal ? <CheckCircle className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                     </div>
                     <div className="flex-1">
                       <h3 className={`font-poppins font-bold text-xl mb-2 ${feedbackNode.isOptimal ? 'text-white' : 'text-[#FF4B4B]'}`}>
                          {feedbackNode.isOptimal ? 'Optimal Strategy!' : 'Critical Misstep!'}
                       </h3>
                       <p className="text-white/80 leading-relaxed text-lg">
                          {feedbackNode.insight}
                       </p>
                       {feedbackNode.score && (
                          <div className="mt-4 text-[#FFC800] font-bold">Mentor Score: {feedbackNode.score}/100</div>
                       )}
                     </div>
                  </div>

                  {/* Flow Control Buttons */}
                  <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                     {awaitingRetry ? (
                        <button onClick={retryStage} className="btn-ghost text-white flex items-center gap-2">
                          <RefreshCcw className="w-5 h-5" /> Retry Decision
                        </button>
                     ) : (
                        <button onClick={nextStage} className="btn-primary flex items-center gap-2 text-lg shadow-[0_5px_20px_rgba(88,204,2,0.4)]">
                          {currentStageIndex < scenarioData.stages.length - 1 ? 'Next Phase' : 'Complete Review'} <ChevronRight className="w-5 h-5" />
                        </button>
                     )}
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );
}