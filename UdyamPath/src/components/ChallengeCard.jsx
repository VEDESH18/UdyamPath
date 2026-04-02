import { useState } from 'react';

export default function ChallengeCard({ scenario, onDecision, disabled }) {
  const [flipped, setFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleFlip = () => {
    if (!disabled) setFlipped(true);
  };

  const handleDecision = (option) => {
    if (disabled || selectedOption) return;
    setSelectedOption(option);
    setTimeout(() => onDecision(option), 400);
  };

  if (!scenario) return null;

  return (
    <div className="perspective w-full max-w-lg mx-auto">
      <div className={`flip-card relative h-80 ${flipped ? 'flipped' : ''}`}>
        {/* Front: Scenario */}
        <div className="flip-front absolute inset-0">
          <div className={`h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            scenario.type === 'challenge'
              ? 'bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30'
              : 'bg-gradient-to-br from-green-900/40 to-emerald-800/20 border border-emerald-500/30'
          }`} onClick={handleFlip}>
            <div className="text-6xl mb-4">{scenario.emoji || '🎯'}</div>
            <div className={`badge mb-3 ${scenario.type === 'challenge' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}>
              {scenario.type === 'challenge' ? '⚡ Challenge' : '🌟 Opportunity'}
            </div>
            <h3 className="font-poppins font-bold text-xl text-white mb-3">{scenario.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{scenario.description}</p>
            <div className="mt-4 flex items-center gap-2 text-white/40 text-xs">
              <span>Click to reveal your choices</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Back: Decision Options */}
        <div className="flip-back absolute inset-0">
          <div className="h-full rounded-2xl p-5 bg-navy-700/60 border border-white/10 flex flex-col gap-3">
            <h4 className="font-poppins font-semibold text-white text-center text-sm">Choose your response:</h4>
            {scenario.options?.map(option => (
              <button
                key={option.id}
                onClick={() => handleDecision(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedOption?.id === option.id
                    ? 'bg-saffron-500/20 border-saffron-500 text-white'
                    : selectedOption
                    ? 'opacity-40 cursor-not-allowed bg-white/3 border-white/10 text-white/50'
                    : 'bg-white/4 border-white/10 text-white/80 hover:bg-saffron-500/10 hover:border-saffron-500/50 hover:text-white cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center ${
                    selectedOption?.id === option.id ? 'bg-saffron-500 text-white' : 'bg-white/10 text-white/60'
                  }`}>{option.id}</span>
                  <div>
                    <div className="font-medium text-sm">{option.text}</div>
                    {option.detail && <div className="text-xs text-white/40 mt-0.5">{option.detail}</div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
