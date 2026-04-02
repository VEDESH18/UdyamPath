import React from 'react';
import { Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StreakBadge() {
  const { state } = useAppContext();
  
  if (!state.streak) return null;

  let message = "Welcome builder!";
  if (state.streak === 3) message = "Building a habit!";
  if (state.streak >= 7) message = "One week strong!";

  return (
    <div className="flex items-center gap-2 bg-saffron/10 border border-saffron/30 rounded-full px-4 py-2">
      <Flame className="w-5 h-5 text-saffron animate-pulse" />
      <div className="flex flex-col">
        <span className="text-white font-bold leading-none">{state.streak}-Day Streak</span>
        <span className="text-xs text-muted mt-1">{message}</span>
      </div>
    </div>
  );
}
