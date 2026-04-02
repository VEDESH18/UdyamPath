import React, { useEffect, useState } from 'react';
import useGNews from '../hooks/useGNews';
import { useAppContext } from '../context/AppContext';

export default function InsightsStrip() {
  const { fetchNews } = useGNews();
  const { state } = useAppContext();
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function loadNews() {
      if (state.idea) {
        // Extract a key term from idea (very simplified extraction)
        const term = state.idea.split(' ').slice(0,3).join(' ');
        const articles = await fetchNews(term, 5);
        setNews(articles);
      }
    }
    loadNews();
  }, [state.idea, fetchNews]);

  if (news.length === 0) return null;

  return (
    <div className="fixed bottom-0 w-full bg-saffron text-navy font-bold py-2 overflow-hidden flex items-center shadow-[0_-5px_20px_rgba(255,107,53,0.3)] z-40">
      <span className="px-4 whitespace-nowrap bg-saffron z-10 border-r border-navy/20">
        LIVE MARKET INSIGHTS
      </span>
      <div className="flex-1 overflow-hidden relative font-inter font-medium text-sm">
        <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] inline-block hover:[animation-play-state:paused] cursor-pointer">
          {news.map((n, i) => (
            <a 
              key={i} 
              href={n.url} 
              target="_blank" 
              rel="noreferrer" 
              className="mr-12 hover:underline"
            >
              <span className="opacity-60 mr-2">♦</span>
              {n.title} ({n.source.name})
            </a>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((n, i) => (
            <a 
              key={`dup-${i}`} 
              href={n.url} 
              target="_blank" 
              rel="noreferrer" 
              className="mr-12 hover:underline"
            >
              <span className="opacity-60 mr-2">♦</span>
              {n.title} ({n.source.name})
            </a>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}} />
    </div>
  );
}
