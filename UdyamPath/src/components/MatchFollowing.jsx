import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function MatchFollowing({ data, onNext, isLast }) {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({}); // { leftId: rightId }
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState({}); // { leftId: isCorrect }
  const [retries, setRetries] = useState(1);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    // Initialize & shuffle right items
    if (data.pairs) {
      setLeftItems(data.pairs.map((p, i) => ({ id: `l_${i}`, text: p.left })));
      
      const rights = data.pairs.map((p, i) => ({ id: `r_${i}`, text: p.right, correctLeftId: `l_${i}` }));
      // Fisher-Yates shuffle
      for (let i = rights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rights[i], rights[j]] = [rights[j], rights[i]];
      }
      setRightItems(rights);
    }
  }, [data?.id, data?.question]); // Depend on ID/Question so it doesn't re-shuffle every second from parent timer re-renders

  const handleLeftClick = (id) => {
    if (isSubmitted) return;
    // If selecting an already matched left item, unmatch it first
    if (matches[id]) {
      const newMatches = { ...matches };
      delete newMatches[id];
      setMatches(newMatches);
    }
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (id) => {
    if (isSubmitted || !selectedLeft) return;
    
    // Check if right is already matched, unmatch it
    const existingLeft = Object.keys(matches).find(k => matches[k] === id);
    const newMatches = { ...matches };
    if (existingLeft) delete newMatches[existingLeft];
    
    newMatches[selectedLeft] = id;
    setMatches(newMatches);
    setSelectedLeft(null); // Clear selection
  };

  const isMatchedRight = (id) => Object.values(matches).includes(id);

  const handleSubmit = () => {
    let correctCount = 0;
    const res = {};
    
    leftItems.forEach(left => {
      const rightId = matches[left.id];
      const rightObj = rightItems.find(r => r.id === rightId);
      const isCorrect = rightObj && rightObj.correctLeftId === left.id;
      if (isCorrect) correctCount++;
      res[left.id] = isCorrect;
    });

    setResults(res);
    setIsSubmitted(true);
    setFinalScore(correctCount);
  };

  const handleRetry = () => {
    // Keep correct matches, clear wrong ones
    const newMatches = {};
    Object.entries(matches).forEach(([lId, rId]) => {
      if (results[lId]) newMatches[lId] = rId;
    });
    setMatches(newMatches);
    setResults({});
    setIsSubmitted(false);
    setRetries(0);
  };

  const proceedToNext = () => {
    const isPerfect = finalScore === leftItems.length;
    onNext({
      qId: data.id,
      type: 'match',
      question: data.question,
      userAnswer: matches,
      isCorrect: isPerfect,
      explanation: data.explanation,
      analogy: data.analogy
    }, isPerfect ? data.branchesTo?.ifAllCorrect : data.branchesTo?.otherwise);
  };

  const allMatched = Object.keys(matches).length === leftItems.length;

  return (
    <div className="flex flex-col flex-1 pb-24">
      <div className="grid grid-cols-2 gap-8 relative">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Concepts</h3>
          {leftItems.map(item => {
            const isSelected = selectedLeft === item.id;
            const isMatched = !!matches[item.id];
            
            let borderClass = "border-white/20";
            if (isSelected) borderClass = "border-saffron bg-saffron/10 shadow-[0_0_15px_rgba(255,107,53,0.3)]";
            else if (isMatched && !isSubmitted) borderClass = "border-saffron/50 bg-surface text-muted";
            else if (isSubmitted) {
              borderClass = results[item.id] ? "border-successGreen bg-successGreen/10" : "border-accentRed bg-accentRed/10";
            }

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} relative`}
              >
                {item.text}
                {isSubmitted && results[item.id] && <CheckCircle className="w-5 h-5 text-successGreen absolute -right-3 top-1/2 -mt-2.5 bg-navy rounded-full" />}
                {isSubmitted && !results[item.id] && <XCircle className="w-5 h-5 text-accentRed absolute -right-3 top-1/2 -mt-2.5 bg-navy rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Definitions</h3>
          {rightItems.map(item => {
            const isMatched = isMatchedRight(item.id);
            const isTarget = isMatched && !isSubmitted;
            
            let borderClass = "border-white/10 hover:border-white/30";
            if (isTarget) borderClass = "border-saffron/50 bg-saffron/5";
            else if (isSubmitted && isMatched) {
               // Find left item that matched this to check if correct
               const leftId = Object.keys(matches).find(k => matches[k] === item.id);
               borderClass = results[leftId] ? "border-successGreen bg-successGreen/5 opacity-50" : "border-accentRed bg-accentRed/5 opacity-50";
            }

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={isSubmitted || (!selectedLeft && !isMatched)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[64px] ${borderClass} ${selectedLeft && !isMatched ? 'hover:border-saffron cursor-pointer ring-1 ring-saffron/30 shadow-saffron-glow animate-pulse-slow' : ''}`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center fixed bottom-6 right-10 left-[42%] max-w-4xl mx-auto z-10 glass-card p-4">
        {!isSubmitted ? (
          <>
            <p className="text-muted text-sm">{Object.keys(matches).length} of {leftItems.length} matched</p>
            <button 
              onClick={handleSubmit} 
              disabled={!allMatched}
              className={`btn-primary ${!allMatched ? 'opacity-50 cursor-not-allowed' : 'shadow-saffron-glow animate-pulse'}`}
            >
              Verify Connections
            </button>
          </>
        ) : (
          <div className="w-full flex justify-between items-center">
             <div className="flex items-center gap-4">
               <span className={`font-bold text-xl ${finalScore === leftItems.length ? 'text-successGreen' : 'text-saffron'}`}>
                 {finalScore}/{leftItems.length} Correct
               </span>
               {finalScore < leftItems.length && retries > 0 && (
                 <button onClick={handleRetry} className="flex items-center gap-2 text-sm text-saffron bg-saffron/10 px-3 py-2 rounded-lg hover:bg-saffron/20 transition-colors">
                   <RefreshCw className="w-4 h-4" /> Try Again
                 </button>
               )}
             </div>
             <button onClick={proceedToNext} className="btn-primary group flex items-center gap-2">
               {isLast ? "Complete Challenge" : "Continue"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSubmitted && (finalScore === leftItems.length || retries === 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-surface border border-white/10 rounded-xl p-6 mb-24"
          >
            <h3 className="font-bold text-white mb-2">The Real World Truth:</h3>
            <p className="text-muted leading-relaxed mb-4">{data.explanation}</p>
            {data.analogy && (
               <p className="text-sm text-saffron italic border-l-2 border-saffron pl-3">
                 "Think of it like... {data.analogy}"
               </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
