import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, RefreshCcw, ArrowRight } from 'lucide-react';

export default function MCQ({ data, onNext, isLast }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [reconsidering, setReconsidering] = useState(false);
  const [reconsiderSec, setReconsiderSec] = useState(0);
  const timerRef = useRef(null);

  // Reset every time data changes (new question)
  useEffect(() => {
    setSelected(null);
    setLocked(false);
    setReconsidering(false);
    setReconsiderSec(0);
    clearInterval(timerRef.current);
  }, [data?.id ?? data?.question]);

  // Countdown for reconsider chip
  useEffect(() => {
    if (reconsiderSec > 0) {
      timerRef.current = setTimeout(() => setReconsiderSec(s => s - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [reconsiderSec]);

  const handleSelect = (key) => {
    if (locked) return; // never fire twice
    setSelected(key);
    setLocked(true);
    // Only show reconsider chip if wrong and first attempt
    if (key !== data.correct) {
      setReconsidering(true);
      setReconsiderSec(4);
    }
  };

  const handleReconsider = () => {
    clearTimeout(timerRef.current);
    setLocked(false);
    setSelected(null);
    setReconsidering(false);
    setReconsiderSec(0);
  };

  const submit = () => {
    onNext({
      qId: data.id,
      type: 'mcq',
      question: data.question,
      userAnswer: selected,
      correctAnswer: data.correct,
      isCorrect: selected === data.correct,
      explanation: data.explanation,
      analogy: data.analogy
    });
  };

  const optStyle = (key) => {
    if (!locked) {
      return 'border-white/10 bg-surface hover:border-saffron hover:bg-saffron/10 cursor-pointer';
    }
    if (key === data.correct) return 'border-successGreen bg-successGreen/20';
    if (key === selected) return 'border-accentRed bg-accentRed/20';
    return 'border-white/5 opacity-40 bg-navy';
  };

  const options = data?.options || {};

  return (
    <div className="flex flex-col gap-4">
      {/* Dialogue Options */}
      <div className="space-y-3">
        {Object.entries(options).map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(key)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 relative group ${optStyle(key)}`}
          >
            <span className={`w-8 h-8 rounded-md border flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${
              locked && key === data.correct ? 'bg-successGreen border-successGreen text-white' :
              locked && key === selected ? 'bg-accentRed border-accentRed text-white' :
              'bg-navy border-white/20 text-muted group-hover:text-saffron group-hover:border-saffron/50'
            }`}>
              {key}
            </span>
            <div className="flex-1 flex flex-col">
              <span className="text-white font-medium leading-tight">"{text}"</span>
            </div>
            {locked && key === data.correct && <CheckCircle className="w-5 h-5 text-successGreen flex-shrink-0" />}
            {locked && key === selected && key !== data.correct && <XCircle className="w-5 h-5 text-accentRed flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Post-answer panel — always shown when locked */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-2"
          >
            {/* Optional reconsider chip (wrong answer, first 4 seconds) */}
            {reconsidering && reconsiderSec > 0 && (
              <div className="flex items-center justify-between glass-card p-3 border-l-4 border-blue-500 bg-blue-500/10">
                <div className="flex items-center gap-2 text-blue-300 text-sm font-medium">
                  <RefreshCcw className="w-4 h-4 flex-shrink-0" />
                  <span>Are you absolutely sure?</span>
                </div>
                <button
                  onClick={handleReconsider}
                  className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors"
                >
                  ← Change ({reconsiderSec}s)
                </button>
              </div>
            )}

            {/* Reaction if wrong */}
            {selected !== data.correct && data.impactIfWrong && (
              <div className="flex items-start gap-3 glass-card p-4 border-l-4 border-accentRed bg-accentRed/10">
                <AlertTriangle className="w-5 h-5 text-accentRed flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-accentRed font-bold text-xs uppercase tracking-wider mb-1">Stakeholder Reaction</span>
                  <p className="text-red-200 text-sm font-medium leading-relaxed">{data.impactIfWrong}</p>
                </div>
              </div>
            )}

            {/* AI Mentor Explanation */}
            <div className="bg-surface/80 border border-white/10 rounded-xl p-5 shadow-lg">
              <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                {selected === data.correct
                  ? <span className="text-successGreen flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Conversation Successful</span>
                  : <span className="text-muted flex items-center gap-1">Udyam Guru's Advice:</span>}
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{data.explanation}</p>
              {data.analogy && (
                <p className="text-saffron italic text-sm border-l-2 border-saffron pl-3 mt-4 bg-saffron/5 p-2 rounded-r-lg">
                  "Think of it like... {data.analogy}"
                </p>
              )}
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={submit}
                className="btn-primary flex items-center gap-2 shadow-saffron-glow group px-6 py-3"
              >
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
