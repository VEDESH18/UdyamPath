import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import useOpenAI from '../hooks/useOpenAI';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';

export default function OpenEnded({ data, onNext, isLast }) {
  const { state } = useAppContext();
  const { generateJSON } = useOpenAI();
  
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = async () => {
    if (!inputValue.trim() || inputValue.length < 50 || isSubmitted) return;
    
    setIsEvaluating(true);
    
    try {
      const prompt = `Evaluate this founder's strategic decision.
Idea: ${state.idea}
Scenario context: A case study based on the challenge of ${data.question}
Founder's proposed solution: "${inputValue}"

Scoring strict criteria: ${data.scoringCriteria}

Return ONLY JSON:
{
  "score": number (0-10),
  "strongPoints": "String (1-2 sentences on what they got right)",
  "whatCouldBeStronger": "String (1-2 sentences on what they missed or should consider)"
}`;

      const res = await generateJSON(prompt, 0.5); // Lower temp for evaluation
      setEvaluation(res);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Evaluation failed", err);
      // Fallback
      setEvaluation({
         score: 7,
         strongPoints: "Your strategy shows a clear understanding of your target audience.",
         whatCouldBeStronger: "Consider adding specific metrics to measure the success of this plan."
      });
      setIsSubmitted(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const proceedToNext = () => {
    onNext({
      qId: data.id,
      type: 'openended',
      question: data.question,
      userAnswer: inputValue,
      isCorrect: evaluation.score >= 5, // Arbitrary line for 'correct'
      score: evaluation.score,
      explanation: `Strong points: ${evaluation.strongPoints} What to improve: ${evaluation.whatCouldBeStronger}`,
      analogy: "Real startup context applied"
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
         <div className="glass-card p-6 border-l-4 border-l-purple-500 bg-purple-500/5">
           <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">Synthesis Task</h3>
           <p className="text-white text-lg">In one/two lines, how would <span className="text-saffron font-bold text-xl italic drop-shadow-md">YOU</span> tackle this exact challenge for your specific idea: <span className="font-bold border-b border-dashed">"{state.idea}"</span>?</p>
         </div>
      </div>

      <div className="flex-1 flex flex-col mb-8">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSubmitted || isEvaluating}
          placeholder="e.g. For my rural coding platform, I would..."
          className="w-full flex-1 bg-surface border border-white/20 rounded-xl p-6 text-white md:text-lg focus:border-saffron outline-none resize-none transition-all shadow-inner focus:shadow-saffron-glow min-h-[200px]"
        />
        <div className="flex justify-between items-center mt-2 px-2 text-sm">
           <span className="text-muted">Min 50 characters</span>
           <span className={`${inputValue.length >= 50 ? 'text-successGreen' : 'text-accentRed'}`}>
             {inputValue.length} chars
           </span>
        </div>
      </div>

      {!isSubmitted && (
         <div className="flex justify-end">
           <button 
             onClick={handleSubmit} 
             disabled={inputValue.length < 50 || isEvaluating}
             className={`btn-primary group flex items-center gap-2 px-8 py-3 text-lg ${isEvaluating ? 'opacity-50' : 'shadow-saffron-glow hover:scale-105'}`}
           >
             {isEvaluating ? (
                <><Loader className="w-5 h-5 animate-spin" /> Evaluating Strategy...</>
             ) : (
                <><CheckCircle className="w-5 h-5" /> Submit Blueprint</>
             )}
           </button>
         </div>
      )}

      <AnimatePresence>
        {isSubmitted && evaluation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-t-2 border-t-successGreen">
                 <h4 className="text-successGreen font-bold flex items-center gap-2 mb-2">
                   <CheckCircle className="w-5 h-5" /> Strong Points
                 </h4>
                 <p className="text-white leading-relaxed">{evaluation.strongPoints}</p>
              </div>

              <div className="glass-card p-6 border-t-2 border-t-amber-500">
                 <h4 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest">
                   What Could Be Stronger
                 </h4>
                 <p className="text-white leading-relaxed">{evaluation.whatCouldBeStronger}</p>
              </div>
            </div>

            <div className="glass-card p-6 bg-surface/80">
              <h4 className="text-saffron font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                 Top 1% Founder Response Example
              </h4>
              <p className="text-muted leading-relaxed border-l-2 border-surface pl-4 italic">
                "{data.exampleGoodAnswer}"
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={proceedToNext} className="btn-primary group flex items-center gap-2 shadow-saffron-glow">
                Generate Final Report <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
