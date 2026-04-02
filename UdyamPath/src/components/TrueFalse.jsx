import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function TrueFalse({ data, onNext, isLast }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset on question change
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [data?.id ?? data?.statement]);

  const handleSelect = (choice) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true); // Auto-lock immediately like MCQ
  };

  const handleNext = () => {
    onNext({
      qId: data.id,
      type: 'truefalse',
      question: data.statement,
      userAnswer: selected,
      correctAnswer: data.correct,
      isCorrect: selected === data.correct,
      explanation: data.explanation,
      analogy: data.analogy
    });
  };

  const isCorrect = submitted && selected === data.correct;

  const btnClass = (choice) => {
    let base = 'p-8 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ';
    if (!submitted) {
      return base + 'bg-surface border-white/10 hover:border-saffron hover:bg-saffron/10 cursor-pointer';
    }
    if (choice === data.correct) return base + 'bg-successGreen/20 border-successGreen';
    if (choice === selected) return base + 'bg-accentRed/20 border-accentRed';
    return base + 'bg-surface border-white/5 opacity-40';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Statement card */}
      <div className="glass-card p-6 border-l-4 border-l-saffron bg-saffron/5">
        <p className="text-lg md:text-xl font-inter leading-relaxed text-white italic">"{data.statement}"</p>
      </div>

      {/* TRUE / FALSE buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => handleSelect(true)} className={btnClass(true)}>
          {submitted && selected === true ? (
            data.correct === true ? <CheckCircle className="w-10 h-10 text-successGreen" /> : <XCircle className="w-10 h-10 text-accentRed" />
          ) : (
            <span className="text-4xl font-bold text-white">TRUE</span>
          )}
          <span className={`text-sm font-bold ${submitted && data.correct === true ? 'text-successGreen' : 'text-muted'}`}>
            {submitted && data.correct === true ? '✓ Correct' : 'True'}
          </span>
        </button>

        <button type="button" onClick={() => handleSelect(false)} className={btnClass(false)}>
          {submitted && selected === false ? (
            data.correct === false ? <CheckCircle className="w-10 h-10 text-successGreen" /> : <XCircle className="w-10 h-10 text-accentRed" />
          ) : (
            <span className="text-4xl font-bold text-white">FALSE</span>
          )}
          <span className={`text-sm font-bold ${submitted && data.correct === false ? 'text-successGreen' : 'text-muted'}`}>
            {submitted && data.correct === false ? '✓ Correct' : 'False'}
          </span>
        </button>
      </div>

      {/* Explanation + Continue */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-surface border border-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-2 text-sm">
                {isCorrect
                  ? <span className="text-successGreen">✓ Excellent Intuition!</span>
                  : <span className="text-saffron">The counterintuitive reality:</span>}
              </h3>
              <p className="text-muted leading-relaxed text-sm">{data.explanation}</p>
              {data.analogy && (
                <p className="text-saffron italic text-xs border-l-2 border-saffron pl-3 mt-3">
                  "Think of it like... {data.analogy}"
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={handleNext} className="btn-primary group flex items-center gap-2 shadow-saffron-glow px-6 py-3">
                {isLast ? 'Complete Challenge' : 'Continue'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
