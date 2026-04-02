import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MCQ from './MCQ';
import MatchFollowing from './MatchFollowing';
import FillBlank from './FillBlank';
import TrueFalse from './TrueFalse';
import OpenEnded from './OpenEnded';
import { ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';

const STAGE_ICONS = [Zap, Target, TrendingUp];
const STAGE_COLORS = ['text-blue-400', 'text-saffron', 'text-successGreen'];
const STAGE_BG = ['bg-blue-500/10 border-blue-500/30', 'bg-saffron/10 border-saffron/30', 'bg-successGreen/10 border-successGreen/30'];

export default function QuestionEngine({ scenario, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showStageCard, setShowStageCard] = useState(true); // Show stage intro first
  const [currentStageId, setCurrentStageId] = useState(1);

  const questions = scenario?.questions || [];
  const stages = scenario?.stages || [];

  // Group questions by stage
  const questionsByStage = questions.reduce((acc, q) => {
    const s = q.stage || 1;
    if (!acc[s]) acc[s] = [];
    acc[s].push(q);
    return acc;
  }, {});

  const currentQuestion = questions[currentIdx];
  const currentStage = stages.find(s => s.id === (currentQuestion?.stage || 1)) || stages[0];

  // Detect if we've just crossed into a new stage
  const isNewStage = currentIdx > 0 && questions[currentIdx]?.stage !== questions[currentIdx - 1]?.stage;

  const handleNext = (answerData) => {
    const newAnswers = [...answers, answerData];
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      const nextQ = questions[currentIdx + 1];
      const currQ = questions[currentIdx];
      // If next question is a new stage, show stage intro card
      if (nextQ && nextQ.stage !== currQ.stage) {
        setCurrentStageId(nextQ.stage);
        setShowStageCard(true);
      }
      setCurrentIdx(i => i + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">No questions generated. Please go back and try again.</p>
      </div>
    );
  }

  // Show stage transition card
  if (showStageCard && currentStage) {
    const stageIndex = (currentStage.id || 1) - 1;
    const Icon = STAGE_ICONS[stageIndex] || Zap;
    const stageQs = questionsByStage[currentStage.id] || [];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`stage-card-${currentStage.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="flex flex-col flex-1 items-center justify-center py-8"
        >
          <div className={`w-full border rounded-2xl p-8 ${STAGE_BG[stageIndex]} text-center max-w-lg mx-auto`}>
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4 ${STAGE_BG[stageIndex]}`}>
              <Icon className={`w-8 h-8 ${STAGE_COLORS[stageIndex]}`} />
            </div>
            <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${STAGE_COLORS[stageIndex]}`}>
              Stage {currentStage.id} of {stages.length}
            </div>
            <h2 className="text-2xl font-poppins font-bold text-white mb-4">{currentStage.title}</h2>
            <p className="text-muted leading-relaxed mb-6">{currentStage.narration}</p>
            <div className="text-xs text-muted mb-6">
              {stageQs.length} challenges in this stage
            </div>
            <button
              onClick={() => setShowStageCard(false)}
              className={`btn-primary flex items-center gap-2 mx-auto shadow-saffron-glow`}
            >
              Enter Stage {currentStage.id} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Apply branching variant for Q3-style branching
  let displayQuestion = { ...currentQuestion };
  if (currentQuestion?.variant_A && currentQuestion?.variant_B) {
    // Use variant_A by default, variant_B if previous answer was wrong
    const prevAnswer = answers[answers.length - 1];
    if (prevAnswer && !prevAnswer.isCorrect) {
      displayQuestion = { ...displayQuestion, ...currentQuestion.variant_B };
    } else {
      displayQuestion = { ...displayQuestion, ...currentQuestion.variant_A };
    }
  }

  const props = {
    key: `q-${currentIdx}`,
    data: displayQuestion,
    onNext: handleNext,
    isLast: currentIdx === questions.length - 1
  };

  const renderQuestion = () => {
    switch (displayQuestion.type) {
      case 'mcq':       return <MCQ {...props} />;
      case 'match':     return <MatchFollowing {...props} />;
      case 'fillblank': return <FillBlank {...props} />;
      case 'truefalse': return <TrueFalse {...props} />;
      case 'openended': return <OpenEnded {...props} />;
      default:          return <div className="text-white p-4 glass-card">Question type "{displayQuestion.type}" coming soon.</div>;
    }
  };

  // Progress across all questions
  const totalAnswered = currentIdx;
  const pct = Math.round((totalAnswered / questions.length) * 100);
  const stageQsInCurrent = questionsByStage[currentQuestion?.stage || 1] || [];
  const stageStartIdx = questions.findIndex(q => q.stage === (currentQuestion?.stage || 1));
  const stageLocalIdx = currentIdx - stageStartIdx;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="bg-saffron/20 border border-saffron font-bold text-saffron px-3 py-1 rounded-lg text-sm">
              Q{currentIdx + 1} / {questions.length}
            </span>
            {stages.length > 0 && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${STAGE_BG[(currentQuestion?.stage || 1) - 1]} ${STAGE_COLORS[(currentQuestion?.stage || 1) - 1]}`}>
                {currentStage?.title || `Stage ${currentQuestion?.stage}`}
              </span>
            )}
          </div>
          {/* Stage local dots */}
          <div className="flex gap-1.5">
            {stageQsInCurrent.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < stageLocalIdx ? 'bg-saffron scale-100' :
                  i === stageLocalIdx ? 'bg-saffron shadow-saffron-glow scale-125' :
                  'bg-surface border border-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-saffron to-successGreen"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question Area — scrollable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`wrapper-${currentIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6"
        >
          {/* STAKEHOLDER BADGE - THE GAME CHANGER */}
          {displayQuestion.stakeholder && (
            <div className="inline-flex items-center border border-white/20 bg-surface/80 px-4 py-1.5 rounded-full mb-4 shadow-[0_0_15px_rgba(255,107,53,0.1)]">
              <span className="text-sm font-bold text-saffron tracking-wide">
                {displayQuestion.stakeholder}
              </span>
            </div>
          )}

          {displayQuestion.context && (
            <div className="bg-navy/50 p-4 rounded-xl border border-white/5 mb-6">
              <p className="text-gray-300 italic font-inter text-md leading-relaxed">
                "{displayQuestion.context}"
              </p>
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-poppins font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {displayQuestion.question || displayQuestion.statement || displayQuestion.sentence}
          </h2>

          {renderQuestion()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
