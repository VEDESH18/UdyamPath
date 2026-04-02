import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function FillBlank({ data, onNext, isLast }) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitted) return;

    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    const checkAnswer = (val) => {
      const cleanInput = val.toLowerCase().trim();
      const cleanAnswer = data.answer.toLowerCase().trim();
      const acceptable = data.acceptable_answers ? data.acceptable_answers.map(a => a.toLowerCase().trim()) : [];
      
      return cleanInput === cleanAnswer || acceptable.includes(cleanInput);
    };

    const correct = checkAnswer(inputValue);
    setIsCorrect(correct);
    
    // If correct or out of attempts, lock it in
    if (correct || currentAttempt >= MAX_ATTEMPTS) {
      setIsSubmitted(true);
    }
  };

  const proceedToNext = () => {
    onNext({
      qId: data.id,
      type: 'fillblank',
      question: data.sentence,
      userAnswer: inputValue,
      correctAnswer: data.answer,
      isCorrect: isCorrect,
      explanation: data.explanation,
      analogy: data.analogy
    }, data.branchesTo);
  };

  const renderSentence = () => {
    const parts = data.sentence.split('___');
    if (parts.length < 2) return <p className="text-xl leading-relaxed">{data.sentence}</p>;

    return (
      <form onSubmit={handleSubmit} className="text-xl md:text-2xl leading-relaxed font-inter">
        {parts[0]}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSubmitted}
          className={`mx-2 bg-transparent border-b-2 outline-none text-center font-bold min-w-[150px] transition-colors ${
            isSubmitted 
              ? (isCorrect ? 'border-successGreen text-successGreen' : 'border-accentRed text-accentRed')
              : 'border-saffron text-saffron placeholder-saffron/30 focus:border-white focus:text-white'
          }`}
          autoFocus
          placeholder="your answer"
        />
        {parts.slice(1).join('___')}
        
        {!isSubmitted && (
          <button type="submit" disabled={!inputValue.trim()} className="ml-4 btn-primary text-sm py-2 px-4 inline-flex">
            Check
          </button>
        )}
      </form>
    );
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="glass-card p-8 min-h-[200px] flex items-center justify-center text-center">
        {renderSentence()}
      </div>
      
      {!isSubmitted && attempts > 0 && !isCorrect && (
        <p className="text-accentRed mt-4 text-center font-bold animate-pulse">
           Incorrect. {MAX_ATTEMPTS - attempts} attempt remaining. Try again!
        </p>
      )}

      <AnimatePresence>
        {isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {!isCorrect && (
              <div className="glass-card p-4 border-l-4 border-l-accentRed bg-accentRed/10 flex items-center justify-between">
                <div>
                  <h4 className="text-accentRed font-bold mb-1">Correct Answer:</h4>
                  <p className="text-2xl text-white font-mono font-bold">{data.answer}</p>
                </div>
                <XCircle className="w-10 h-10 text-accentRed opacity-50" />
              </div>
            )}
            
            {isCorrect && (
              <div className="glass-card p-4 border-l-4 border-l-successGreen bg-successGreen/10 flex items-center justify-between">
                 <h4 className="text-successGreen font-bold text-lg flex items-center gap-2">
                   <CheckCircle className="w-6 h-6" /> Spot on!
                 </h4>
              </div>
            )}

            <div className="bg-surface border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white mb-2">The Framework:</h3>
              <p className="text-muted leading-relaxed mb-4">{data.explanation}</p>
              {data.analogy && (
                 <p className="text-sm text-saffron italic border-l-2 border-saffron pl-3">
                   "Think of it like... {data.analogy}"
                 </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={proceedToNext} className="btn-primary group flex items-center gap-2 shadow-saffron-glow">
                {isLast ? "Complete Challenge" : "Continue"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
