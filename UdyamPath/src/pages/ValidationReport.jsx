import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import useOpenAI from '../hooks/useOpenAI';
import ScoreRing from '../components/ScoreRing';
import { AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

export default function ValidationReport() {
  const { state, updateState } = useAppContext();
  const navigate = useNavigate();
  const { generateJSON } = useOpenAI();
  const [loading, setLoading] = useState(!state.validationReport);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.idea) {
      navigate('/onboarding');
      return;
    }

    if (!state.validationReport && !error) {
      const fetchValidation = async () => {
        try {
          const prompt = `Analyze this social startup idea for the Indian market.
Idea: ${state.idea}. Founder city: ${state.user?.city || 'India'}. Stage: ${state.user?.stage || 'Idea'}.
Return ONLY this JSON:
{
  "problemValidation": "YES" | "PARTIALLY" | "NEEDS RESEARCH",
  "validationReason": string (2 sentences, India-specific),
  "targetAudience": string (specific Indian demographic),
  "marketSize": string (Indian numbers, e.g. '4.2 crore students'),
  "existingSolutions": string (Indian competitors/alternatives),
  "gap": string (what's missing that user's idea fills),
  "uniquenessScore": number (0-100),
  "feasibilityScore": number (0-100),
  "impactStatement": string ('Your idea could impact X lakh people in India'),
  "suggestedModules": string[] (top 3 module names most relevant to this idea),
  "firstChallenge": string (most urgent thing this founder needs to learn)
}`;
          const result = await generateJSON(prompt, 0.7);
          updateState({ validationReport: result });
        } catch (err) {
          setError('Failed to generate validation report. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchValidation();
    }
  }, [state.idea, state.validationReport, error]); // eslint-disable-line

  if (!state.idea) return null;

  if (loading) {
    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin mb-6"></div>
        <p className="text-xl text-white font-poppins animate-pulse">Consulting the Udyam Guru...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-card p-8 border-accentRed/50 text-center">
          <AlertTriangle className="w-12 h-12 text-accentRed mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-muted mb-6">{error}</p>
          <button onClick={() => setError('')} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const report = state.validationReport;

  const getValidationBadge = (status) => {
    switch(status) {
      case 'YES': 
        return <span className="bg-successGreen/20 text-successGreen px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> REAL PROBLEM</span>;
      case 'PARTIALLY': 
        return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> PARTIALLY VALIDATED</span>;
      case 'NEEDS RESEARCH': 
        return <span className="bg-accentRed/20 text-accentRed px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><HelpCircle className="w-4 h-4"/> NEEDS RESEARCH</span>;
      default: return null;
    }
  };

  const stagger = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1, y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="bg-navy min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-saffron/20 to-surface border border-saffron/30 rounded-2xl p-8 mb-10 shadow-saffron-glow relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <h1 className="text-3xl md:text-5xl font-poppins font-extrabold text-white mb-4 relative z-10">
            {report.impactStatement}
          </h1>
          <p className="text-lg text-saffron font-medium relative z-10">
            Based on the Indian market dynamics for {state.user?.city || 'your region'}.
          </p>
        </motion.div>

        {/* BENTO GRID */}
        <motion.div 
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Problem Card */}
          <motion.div variants={item} className="glass-card p-6 md:col-span-2 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-poppins font-bold text-white">Problem Validation</h3>
              {getValidationBadge(report.problemValidation)}
            </div>
            <p className="text-muted leading-relaxed font-inter text-base">
              {report.validationReason}
            </p>
          </motion.div>

          {/* Scores Panel */}
          <motion.div variants={item} className="glass-card p-6 flex flex-row md:flex-col justify-around items-center border-l-4 border-l-saffron">
             <ScoreRing score={report.uniquenessScore} label="Uniqueness" color="#FF6B35" />
             <ScoreRing score={report.feasibilityScore} label="Feasibility" color="#0f9b58" delay={400} />
          </motion.div>

          {/* Target Audience */}
          <motion.div variants={item} className="glass-card p-6">
            <h3 className="text-sm font-bold text-saffron mb-2 uppercase tracking-wide">Target Audience</h3>
            <p className="text-white font-medium mb-4">{report.targetAudience}</p>
            <h3 className="text-sm font-bold text-saffron mb-2 uppercase tracking-wide">Market Size</h3>
            <p className="text-white font-bold text-2xl">{report.marketSize}</p>
          </motion.div>

          {/* Existing Solutions */}
          <motion.div variants={item} className="glass-card p-6">
            <h3 className="text-sm font-bold text-muted mb-2 uppercase tracking-wide">Existing Alternatives</h3>
            <p className="text-white font-medium">{report.existingSolutions}</p>
          </motion.div>

          {/* The Gap */}
          <motion.div variants={item} className="glass-card p-6 bg-surface/80 border-saffron/20 border">
             <h3 className="text-sm font-bold text-saffron mb-2 uppercase tracking-wide">Your Unique Gap</h3>
             <p className="text-white italic leading-relaxed">"{report.gap}"</p>
          </motion.div>
        </motion.div>

        {/* ACTION SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 border-t border-t-saffron flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6"
        >
          <div>
            <h3 className="text-2xl font-poppins font-bold text-white mb-2">Recommended Start:</h3>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {report.suggestedModules?.map((m, i) => (
                <span key={i} className="bg-saffron/20 border border-saffron text-saffron px-3 py-1 rounded-full text-sm font-bold">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted mt-3">Urgent Focus: {report.firstChallenge}</p>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2 group whitespace-nowrap text-lg shadow-saffron-glow animate-pulse-slow">
            Enter Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
