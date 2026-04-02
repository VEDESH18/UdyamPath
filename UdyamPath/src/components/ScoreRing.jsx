import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function ScoreRing({ score, label, color = '#FF6B35', delay = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1000;
      const stepTime = Math.abs(Math.floor(duration / score)) || 10;
      
      const timer2 = setInterval(() => {
        start += 1;
        setAnimatedScore(start);
        if (start >= score) clearInterval(timer2);
      }, stepTime);
      
      return () => clearInterval(timer2);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [score, delay]);

  const data = [
    { name: label, value: animatedScore, fill: color }
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-32 h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="80%" outerRadius="100%" 
            barSize={10} data={data} 
            startAngle={90} endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar 
              minAngle={15} 
              background={{ fill: 'rgba(255,255,255,0.05)' }} 
              clockWise 
              dataKey="value" 
              cornerRadius={10} 
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-poppins font-bold text-white">{animatedScore}</span>
        </div>
      </div>
      <span className="text-sm font-inter text-muted mt-2 font-medium">{label}</span>
    </div>
  );
}
