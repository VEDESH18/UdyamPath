import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import ScoreRing from '../components/ScoreRing';
import StreakBadge from '../components/StreakBadge';
import { Lock, Play, Star, Sparkles, TrendingUp, Users, ShieldAlert, Award, RefreshCw, BarChart, Flame } from 'lucide-react';

const coreModules = [
  { id: 'seed', name: 'Seed Investment', topic: 'Fundraising', icon: Sparkles },
  { id: 'crisis', name: 'Worst Case Scenarios', topic: 'Crisis Management', icon: ShieldAlert },
  { id: 'customers', name: 'Finding First Customers', topic: 'Sales & Growth', icon: TargetIcon },
  { id: 'team', name: 'Building a Team', topic: 'HR & Leadership', icon: Users },
  { id: 'compliance', name: 'Govt & Compliance', topic: 'Legal & Regulatory', icon: Award },
  { id: 'marketing', name: 'Marketing on Zero Budget', topic: 'Growth Hacking', icon: TrendingUp },
  { id: 'pivot', name: 'Pivot Decisions', topic: 'Strategy', icon: RefreshCw },
  { id: 'revenue', name: 'Revenue & Pricing', topic: 'Business Model', icon: BarChart }
];

// Placeholder component because Target icon needs to be imported or inline SVG
function TargetIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

export default function LearningDashboard() {
  const { state, updateState } = useAppContext();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);

  const progress = state.moduleProgress || {};

  const completedCount = Object.keys(progress).filter(k => progress[k].attempts > 0).length;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  
  // Overall mastery avg
  const totalMastery = Object.values(progress).reduce((acc, val) => acc + (val.masteryLevel || 0), 0);
  const avgMastery = Object.keys(progress).length > 0 ? Math.round(totalMastery / Object.keys(progress).length) : 0;

  const topRecommended = state.validationReport?.suggestedModules || ["Seed Investment", "Finding First Customers"];

  const handleStartModule = (mod, difficulty) => {
    updateState({
      currentModule: {
        id: mod.id || mod.name.toLowerCase().replace(/\\s+/g, ''),
        name: mod.name,
        topic: mod.topic,
        difficulty: difficulty,
        startTime: new Date().toISOString()
      }
    });
    navigate('/module');
  };

  return (
    <div className="bg-navy min-h-screen pt-24 pb-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* TOP SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
           <div className="glass-card p-6 flex items-center justify-between border-t-saffron border-t-2 col-span-1 md:col-span-2 shadow-[0_10px_40px_rgba(255,107,53,0.1)]">
             <div>
               <h1 className="text-3xl font-poppins font-bold text-white mb-2">Welcome back{state.user?.name ? `, ${state.user.name.split(' ')[0]}` : ''}</h1>
               <p className="text-muted mb-4">Your journey to build <span className="text-saffron italic">"{state.idea.substring(0, 40)}..."</span></p>
               <StreakBadge />
             </div>
             <div className="hidden sm:block">
                <ScoreRing score={avgMastery} label="Overall Mastery" color="#FF6B35" />
             </div>
           </div>
           
           <div className="glass-card p-6 flex flex-col justify-center">
             <h3 className="text-sm font-bold text-muted mb-2 uppercase">Modules Completed</h3>
             <p className="text-4xl font-poppins font-bold text-white"><span className="text-successGreen">{completedCount}</span> <span className="text-muted text-2xl">/ 8</span></p>
             
             {topRecommended.length > 0 && (
               <div className="mt-6">
                 <h3 className="text-xs font-bold text-muted uppercase mb-2">Up Next</h3>
                 <span className="bg-saffron/20 text-saffron px-3 py-1 rounded-md text-sm font-bold shadow-saffron-glow">
                   {topRecommended[0]}
                 </span>
               </div>
             )}
           </div>
        </motion.div>

        {/* CORE MODULES */}
        <h2 className="text-2xl font-poppins font-bold text-white mb-6 flex items-center gap-2">
           <BookIcon className="w-6 h-6 text-saffron" /> Core Curriculum
        </h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {coreModules.map((mod, idx) => {
             const Icon = mod.icon;
             const modData = progress[mod.id] || { masteryLevel: 0, attempts: 0, lastScore: null };
             const isUnlocked = idx < 3 || completedCount >= Math.floor(idx / 2); // First 3 unlocked, then based on completions
             const isRecommended = topRecommended.some(r => r.toLowerCase() === mod.name.toLowerCase());

             return (
               <motion.div 
                 variants={itemVariants}
                 key={mod.id}
                 onClick={() => isUnlocked && setSelectedModule(mod)}
                 className={`relative glass-card p-6 overflow-hidden transition-all duration-300 ${
                   isUnlocked 
                    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-saffron-glow border-white/10 hover:border-saffron/50' 
                    : 'opacity-50 cursor-not-allowed grayscale'
                 }`}
               >
                 {isRecommended && (
                   <span className="absolute top-0 right-0 bg-saffron text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">RECOMMENDED</span>
                 )}
                 {!isUnlocked && (
                   <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-muted">
                     <Lock className="w-8 h-8 mb-2" />
                     <span className="text-xs font-bold">LOCKED</span>
                   </div>
                 )}

                 <div className="flex justify-between items-start mb-4">
                   <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${modData.masteryLevel > 80 ? 'bg-successGreen/20 text-successGreen' : 'bg-surface border border-white/10 text-saffron'}`}>
                     <Icon className="w-6 h-6" />
                   </div>
                   {modData.attempts === 0 && isUnlocked && !isRecommended && (
                     <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">NEW</span>
                   )}
                 </div>

                 <h3 className="text-lg font-bold text-white leading-tight mb-1">{mod.name}</h3>
                 <p className="text-xs text-muted font-medium mb-4">{mod.topic}</p>

                 <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-2">
                   <div className="h-full bg-saffron" style={{ width: `${modData.masteryLevel}%` }}></div>
                 </div>
                 
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-muted">{modData.masteryLevel}% Mastery</span>
                   {modData.lastScore !== null && (
                     <span className="text-successGreen font-bold font-mono">{modData.lastScore}/6</span>
                   )}
                 </div>
               </motion.div>
             )
          })}
        </motion.div>
      </div>



      {/* DIFFICULTY MODAL */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface border border-saffron/30 p-8 rounded-2xl max-w-md w-full shadow-saffron-glow"
            >
              <h2 className="text-2xl font-poppins font-bold text-white mb-2">{selectedModule.name}</h2>
              <p className="text-muted mb-6">Select your challenge intensity</p>
              
              <div className="space-y-3">
                <button onClick={() => handleStartModule(selectedModule, 'Beginner')} className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-saffron hover:bg-saffron/10 transition-colors group relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">Beginner</h4>
                      <p className="text-xs text-muted mt-1">Foundational concepts, clear scenarios</p>
                    </div>
                    <Play className="w-5 h-5 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                
                <button onClick={() => handleStartModule(selectedModule, 'Intermediate')} className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-saffron hover:bg-saffron/10 transition-colors group relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">Intermediate <Star className="w-3 h-3 text-saffron fill-saffron" /></h4>
                      <p className="text-xs text-muted mt-1">Real complexity, multiple variables</p>
                    </div>
                    <Play className="w-5 h-5 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                
                <button onClick={() => handleStartModule(selectedModule, 'Expert')} className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-accentRed hover:bg-accentRed/10 transition-colors group relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2 text-accentRed">Expert <Flame className="w-4 h-4 text-accentRed" /></h4>
                      <p className="text-xs text-muted mt-1">High-stakes, ambiguous, time-pressured</p>
                    </div>
                    <Play className="w-5 h-5 text-accentRed opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-muted italic">Every attempt generates a new case study</span>
                <button onClick={() => setSelectedModule(null)} className="text-sm text-saffron font-bold hover:underline">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function BookIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}
