import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Minus } from 'lucide-react';

export default function GrowthChart({ history = [] }) {
  if (history.length < 2) return null;

  const data = useMemo(() => {
    return history.map((score, i) => ({
      name: `Attempt ${i + 1}`,
      score: score
    }));
  }, [history]);

  const firstScore = history[0];
  const lastScore = history[history.length - 1];
  
  const diff = lastScore - firstScore;
  const percentage = firstScore === 0 ? (lastScore > 0 ? 100 : 0) : Math.round((diff / firstScore) * 100);

  return (
    <div className="glass-card p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white uppercase text-sm tracking-wider flex items-center gap-2">
          Your Growth Timeline
        </h3>
        
        {diff > 0 ? (
          <span className="flex items-center gap-1 text-successGreen text-sm font-bold bg-successGreen/10 px-3 py-1 rounded">
            <TrendingUp className="w-4 h-4" /> {percentage}% Mastery Gain
          </span>
        ) : diff < 0 ? (
          <span className="flex items-center gap-1 text-accentRed text-sm font-bold bg-accentRed/10 px-3 py-1 rounded">
            <TrendingUp className="w-4 h-4 rotate-180" /> {Math.abs(percentage)}% Drop
          </span>
        ) : (
           <span className="flex items-center gap-1 text-muted text-sm font-bold bg-surface px-3 py-1 rounded">
            <Minus className="w-4 h-4" /> Consistent
          </span>
        )}
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#a8b2d8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 6]} stroke="#a8b2d8" fontSize={12} tickLine={false} axisLine={false} tickCount={7} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#16213e', border: '1px solid #FF6B35', borderRadius: '8px', color: '#fff' }}
               itemStyle={{ color: '#FF6B35', fontWeight: 'bold' }}
            />
            <Line 
               type="monotone" 
               dataKey="score" 
               stroke="#FF6B35" 
               strokeWidth={4} 
               dot={{ r: 6, fill: '#1a1a2e', stroke: '#FF6B35', strokeWidth: 3 }} 
               activeDot={{ r: 8, fill: '#FF6B35', stroke: '#fff', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {diff > 0 && (
        <p className="text-center text-sm text-saffron mt-4 italic">
          "Great founders aren't born perfect. They just learn faster than everyone else."
        </p>
      )}
    </div>
  );
}
