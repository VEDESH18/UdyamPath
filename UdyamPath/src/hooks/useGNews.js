import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export default function useGNews() {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNews = useCallback(async (query, max = 5) => {
    setLoading(true);
    setError('');
    
    try {
      const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
      if (!apiKey) throw new Error("GNews API Key missing");
      
      const endpoint = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}+startup+India&lang=en&country=in&max=${max}&apikey=${apiKey}`;
      const res = await fetch(endpoint);
      
      if (!res.ok) throw new Error("Failed to fetch news");
      
      const data = await res.json();
      return data.articles || [];
    } catch (err) {
      console.error("GNews Error:", err);
      // HARDCODED FALLBACKS as requested in the prompt specification
      return [
        { title: "Zepto raises $340M to battle Blinkit", source: {name: "Economic Times"}, url: "https://economictimes.indiatimes.com", publishedAt: new Date().toISOString() },
        { title: "Dunzo's survival strategy post funding winter", source: {name: "YourStory"}, url: "https://yourstory.com", publishedAt: new Date().toISOString() },
        { title: "Freshworks hits massive ARR growth in 2024", source: {name: "TechCrunch"}, url: "https://techcrunch.com", publishedAt: new Date().toISOString() },
        { title: "Zomato completely profitable via Blinkit synergy", source: {name: "MoneyControl"}, url: "https://moneycontrol.com", publishedAt: new Date().toISOString() },
        { title: "Paytm shifts focus to core payments post RBI action", source: {name: "Mint"}, url: "https://livemint.com", publishedAt: new Date().toISOString() }
      ].slice(0, max);
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchNews, loading, error };
}
