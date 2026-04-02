import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const languages = [
  { code: 'en', label: 'English', native: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తె' },
  { code: 'hi', label: 'Hindi', native: 'हि' },
  { code: 'ta', label: 'Tamil', native: 'த' }
];

const stages = ['Idea', 'Validation', 'MVP', 'Growth'];
const teamSizes = ['Solo', '2-3', '4-5', '6+'];
const fears = [
  'Select your biggest fear',
  'Failure',
  'Running out of money',
  'Family pressure',
  'Not knowing enough',
  'Competition'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, updateState, updateUser } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    language: state.language || 'en',
    idea: state.idea || '',
    city: state.user?.city || '',
    budget: 0,
    stage: state.user?.stage || 'Idea',
    teamSize: state.user?.teamSize || 'Solo',
    name: state.user?.name || '',
    age: state.user?.age || '',
    college: state.user?.college || '',
    fear: state.user?.fear || fears[0]
  });

  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const loadingMessages = [
    "Analyzing your idea...",
    "Mapping to Indian market...",
    "Preparing your learning path...",
    "Building your case study room..."
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    updateState({ language: formData.language, idea: formData.idea });
    updateUser({
      name: formData.name,
      age: formData.age,
      city: formData.city,
      college: formData.college,
      stage: formData.stage,
      teamSize: formData.teamSize,
      fear: formData.fear,
      budget: formData.budget
    });

    setLoading(true);
  };

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx(i => {
          if (i === loadingMessages.length - 1) {
            clearInterval(interval);
            navigate('/validate'); // Go to validation report
            return i;
          }
          return i + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading, navigate, loadingMessages.length]);

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  if (loading) {
    return (
      <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin mb-8 shadow-saffron-glow"></div>
        <AnimatePresence mode="wait">
          <motion.h2
            key={loadingMsgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-poppins text-white"
          >
            {loadingMessages[loadingMsgIdx]}
          </motion.h2>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen flex flex-col items-center pt-24 pb-12 px-4 relative overflow-hidden">
      
      {/* PROGRESS BAR */}
      <div className="w-full max-w-2xl fixed top-0 left-1/2 -translate-x-1/2 h-2 bg-surface z-50">
        <div 
          className="progress-bar-fill"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="mb-8 flex justify-between items-center px-4">
          <button 
            onClick={handlePrev} 
            className={`text-muted hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            ← Back
          </button>
          <span className="text-saffron font-bold">Step {step} of 4</span>
        </div>

        <div className="glass-card p-8 md:p-12 relative overflow-hidden min-h-[450px]">
          <AnimatePresence mode="wait" custom={1}>
            
            {step === 1 && (
              <motion.div key="step1" {...slideAnimation(1)} className="flex flex-col h-full">
                <h2 className="text-3xl font-poppins font-bold text-white mb-2">Choose Your Language</h2>
                <p className="text-muted mb-8">UdyamPath adapts to the language you think in.</p>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => handleChange('language', l.code)}
                      className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border ${
                        formData.language === l.code 
                          ? 'border-saffron bg-saffron/20 shadow-saffron-glow transform scale-[1.02]' 
                          : 'border-white/10 bg-surface/50 hover:bg-surface'
                      }`}
                    >
                      <span className="text-4xl">{l.native}</span>
                      <span className="font-bold text-white">{l.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} className="btn-primary">Next →</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...slideAnimation(1)} className="flex flex-col h-full">
                <h2 className="text-3xl font-poppins font-bold text-white mb-2">What are you building?</h2>
                <p className="text-muted mb-8">Describe your social startup idea in detail.</p>
                
                <div className="flex-1 flex flex-col">
                  <textarea 
                    value={formData.idea}
                    onChange={(e) => handleChange('idea', e.target.value)}
                    placeholder="e.g. A platform to teach coding to rural girls in Telangana using low-bandwidth videos..."
                    className="w-full bg-surface/80 border border-white/10 rounded-xl p-4 text-white focus:border-saffron focus:ring-1 focus:ring-saffron outline-none resize-none flex-1 font-inter min-h-[150px]"
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-muted">Min 50 characters required</span>
                    <span className={`${formData.idea.length > 50 ? 'text-successGreen' : 'text-accentRed'}`}>
                      {formData.idea.length} / 50
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button onClick={handlePrev} className="btn-ghost hidden sm:block">Back</button>
                  <button 
                    onClick={handleNext} 
                    disabled={formData.idea.length < 50}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...slideAnimation(1)} className="flex flex-col h-full">
                <h2 className="text-3xl font-poppins font-bold text-white mb-8">Your Context</h2>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-sm text-muted mb-2">City/Town</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-saffron outline-none"
                      placeholder="e.g. Nizamabad"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-sm text-muted mb-2">
                      <span>Available Budget</span>
                      <span className="text-saffron font-bold">₹{formData.budget.toLocaleString('en-IN')}</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" max="500000" step="10000"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', parseInt(e.target.value))}
                      className="w-full accent-saffron"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted mb-2">Stage</label>
                      <select 
                        value={formData.stage}
                        onChange={(e) => handleChange('stage', e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-saffron outline-none"
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Team Size</label>
                      <div className="flex bg-surface rounded-lg p-1 border border-white/10">
                        {teamSizes.map(size => (
                          <button
                            key={size}
                            onClick={() => handleChange('teamSize', size)}
                            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                              formData.teamSize === size ? 'bg-saffron text-white shadow-md' : 'text-muted hover:text-white'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                   <button 
                    onClick={handleNext} 
                    disabled={!formData.city}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" {...slideAnimation(1)} className="flex flex-col h-full">
                <h2 className="text-3xl font-poppins font-bold text-white mb-8">About You</h2>
                
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-saffron outline-none"
                        placeholder="e.g. Rahul Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Age</label>
                      <input 
                        type="number" 
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-saffron outline-none"
                        placeholder="22"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted mb-2">College or Organization</label>
                    <input 
                      type="text" 
                      value={formData.college}
                      onChange={(e) => handleChange('college', e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-saffron outline-none"
                      placeholder="e.g. CVR College of Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-saffron mb-2">What is your biggest fear?</label>
                    <select 
                      value={formData.fear}
                      onChange={(e) => handleChange('fear', e.target.value)}
                      className="w-full bg-surface border border-saffron/50 rounded-lg p-3 text-white ring-1 ring-saffron outline-none"
                    >
                      {fears.map(f => (
                        <option key={f} value={f} disabled={f === fears[0]}>{f}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted mt-2 mt-1">Don't worry, your AI Coach Udyam Guru will refer to this to help you overcome it.</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                   <button 
                    onClick={handleSubmit} 
                    disabled={!formData.name || !formData.college || formData.fear === fears[0]}
                    className="btn-primary disabled:opacity-50 animate-pulse-slow"
                  >
                    Enter the Room
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const slideAnimation = (direction) => ({
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
});
