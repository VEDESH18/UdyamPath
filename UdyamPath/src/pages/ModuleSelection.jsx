import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { X, Play, ShieldAlert, Award, FileText, Globe, Users, TrendingUp, Cpu, Lightbulb } from 'lucide-react';

const MODULES_DATA = [
  { id: 'mod_1', name: 'Seed Investment', category: 'Fundraising', icon: FileText, desc: 'How to approach investors, understand term sheets, and manage early dilution.' },
  { id: 'mod_2', name: 'Worst Case Scenarios', category: 'Crisis Management', icon: ShieldAlert, desc: 'Handling early failure, making pivots, and surviving cash flow crisis.' },
  { id: 'mod_3', name: 'Finding First Customers', category: 'Sales & Growth', icon: Users, desc: 'Customer discovery, early traction, and unit economics validation.' },
  { id: 'mod_4', name: 'Building a Team', category: 'HR & Leadership', icon: Users, desc: 'Hiring with no money, building culture, and co-founder equity splits.' },
  { id: 'mod_5', name: 'Govt & Compliance', category: 'Legal', icon: Award, desc: 'Navigating GST, licenses, Section-8, and startup India schemes.' },
  { id: 'mod_6', name: 'Marketing on Zero Budget', category: 'Growth Hacking', icon: Globe, desc: 'Guerrilla marketing, building localized trust, and community scaling.' },
  { id: 'mod_7', name: 'Pivot Decisions', category: 'Strategy', icon: TrendingUp, desc: 'When to change direction, sink cost fallacy, and strategic survival.' },
  { id: 'mod_8', name: 'Revenue & Pricing', category: 'Business Model', icon: Lightbulb, desc: 'Pricing psychology, sustainable revenue models, and collection strategies.' }
];

const DIFFICULTIES = [
  { id: 'beginner', name: 'Beginner', desc: 'Simple scenarios. Ideal for conceptual understanding.', color: '#1CB0F6', bg: 'bg-[#1CB0F6]/10' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Complex real-world problems. Requires strategic thinking.', color: '#FFC800', bg: 'bg-[#FFC800]/10' },
  { id: 'expert', name: 'Expert', desc: 'Brutal market realities. One wrong move kills the startup.', color: '#FF4B4B', bg: 'bg-[#FF4B4B]/10' }
];

export default function ModuleSelection() {
  const navigate = useNavigate();
  const { state, updateState } = useAppContext();
  const [selectedMod, setSelectedMod] = useState(null);

  const handleStart = (difficulty) => {
    updateState({ currentModule: { ...selectedMod, difficulty: difficulty.id } });
    navigate('/scenario');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pt-24 pb-32 font-inter relative">
      <div className="max-w-6xl mx-auto animate-slide-up">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-black text-white mb-4">Startup Simulator Sandbox</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Choose a challenge area based on your startup idea. Each module fetches real-world news and generates a unique trial-and-error scenario tailored specifically to you.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODULES_DATA.map((mod) => {
            const hist = state.moduleHistory?.[mod.id];
            const hasAttempted = hist && hist.attempts > 0;
            const scoreColor = hist?.lastScore >= 70 ? 'text-[#58CC02] bg-[#58CC02]/10 border-[#58CC02]/30' : 
                               hist?.lastScore >= 40 ? 'text-[#FFC800] bg-[#FFC800]/10 border-[#FFC800]/30' : 
                                                     'text-[#FF4B4B] bg-[#FF4B4B]/10 border-[#FF4B4B]/30';

            return (
              <div 
                key={mod.id}
                onClick={() => setSelectedMod(mod)}
                className="card bg-[#1a1a1a] cursor-pointer group hover:bg-[#222] transition-all duration-300 relative flex flex-col h-full"
              >
                {/* Score Badge */}
                {hasAttempted && (
                  <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full border text-xs font-bold shadow-lg ${scoreColor}`}>
                    Score: {hist.lastScore}
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#58CC02]/10 group-hover:border-[#58CC02]/30 group-hover:text-[#58CC02] transition-colors">
                     <mod.icon className="w-6 h-6" />
                  </div>
                  <span className="badge">{mod.category}</span>
                </div>

                <h3 className="font-poppins font-bold text-xl text-white mb-2">{mod.name}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">{mod.desc}</p>
                
                <div className="mt-auto flex items-center justify-between text-xs font-bold">
                  {hasAttempted ? (
                    <span className="text-white/30">{hist.attempts} Attempts</span>
                  ) : (
                    <span className="text-white/20">Not Started</span>
                  )}
                  <span className="text-[#58CC02] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Play <Play className="w-3 h-3 fill-current"/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Difficulty ModalOverlay */}
      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0f0f]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-2xl p-8 rounded-3xl relative shadow-[0_30px_60px_rgba(0,0,0,0.6)] animate-bounce-in">
            <button onClick={() => setSelectedMod(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <span className="text-[#58CC02] font-bold text-sm tracking-widest uppercase mb-2 block">{selectedMod.category}</span>
              <h2 className="text-3xl font-poppins font-black text-white">{selectedMod.name}</h2>
              <p className="text-white/50 mt-2">Select your simulation difficulty level.</p>
            </div>

            <div className="space-y-4">
              {DIFFICULTIES.map(diff => (
                <div 
                  key={diff.id} 
                  onClick={() => handleStart(diff)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group bg-[#222] border-white/5 hover:bg-[${diff.bg}]`}
                  style={{ '--hover-color': diff.color }}
                >
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-white mb-1 group-hover:text-[var(--hover-color)] transition-colors">{diff.name}</h3>
                    <p className="text-white/50 text-sm">{diff.desc}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-[var(--hover-color)] group-hover:bg-[var(--hover-color)] group-hover:text-black transition-colors">
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center flex items-center justify-center gap-2 text-white/30 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
              <Cpu className="w-4 h-4"/> <span>GNews API will fetch live market context on start.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}