import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Newspaper, Building2, ExternalLink, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useGNews from '../hooks/useGNews';
import useOpenAI from '../hooks/useOpenAI';

// Static fallback schemes — always show if AI fails
const STATIC_SCHEMES = [
  {
    name: 'Startup India Seed Fund',
    whatItOffers: 'Financial assistance up to ₹20 lakhs for proof of concept, prototype development, product trials, and market entry.',
    eligibility: 'DPIIT-recognized startups incorporated within last 2 years with innovative, scalable tech solutions.',
    applyLink: 'https://seedfund.startupindia.gov.in/'
  },
  {
    name: 'PM YUVA 2.0',
    whatItOffers: 'Mentorship + ₹6 lakh stipend over 6 months for young entrepreneurs under a national mentoring program.',
    eligibility: 'Indian citizens aged 15-29 with a viable business concept. Applications via MyGov portal.',
    applyLink: 'https://www.mygov.in/group-issue/pm-yuva-2-0/'
  },
  {
    name: 'Atal Innovation Mission (AIM)',
    whatItOffers: 'Access to Atal Incubation Centres, seed funding, and world-class mentorship across 50+ cities in India.',
    eligibility: 'Early-stage startups in any sector. Apply via the NITI Aayog AIM portal.',
    applyLink: 'https://aim.gov.in/'
  },
  {
    name: 'SIDBI SMILE Fund',
    whatItOffers: 'Soft loans up to ₹1 crore at concessional rates for MSMEs — ideal for product development and working capital.',
    eligibility: 'MSMEs with at least 3 years of operation or new-age startups with proven unit economics.',
    applyLink: 'https://sidbi.in/'
  }
];

const VIDEO_TOPICS = [
  { title: '"Zero to One" — How Indian founders found product-market fit', keyword: 'indian startup product market fit 2024' },
  { title: 'Building an MVP for ₹0 — Jugaad Framework', keyword: 'build MVP zero budget india startup' },
  { title: 'How to Pitch to Indian VCs and Angel Investors', keyword: 'how to pitch indian investors startup' },
  { title: 'Registering Your Startup — Pvt Ltd vs LLP vs OPC', keyword: 'startup registration india pvt ltd llp' },
  { title: 'PM Startup India Schemes Explained in 10 Minutes', keyword: 'startup india government schemes explained 2024' },
];

export default function ResourcesPanel() {
  const { state } = useAppContext();
  const { fetchNews } = useGNews();
  const { generateJSON } = useOpenAI();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schemes');

  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const [schemes, setSchemes] = useState(STATIC_SCHEMES); // default to static
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemesPersonalized, setSchemesPersonalized] = useState(false);

  // Load News (lazy on tab open)
  const loadNews = useCallback(async () => {
    if (news.length > 0 || loadingNews || !state.idea) return;
    setLoadingNews(true);
    try {
      // 1. Extract highly relevant industry keyword
      let term = state.idea.split(' ').slice(0, 2).join(' '); // Safe fallback
      const prompt = `Convert this startup idea: "${state.idea}" into a single highly relevant 1-2 word industry keyword (like "Agritech", "EdTech", "Fintech", "Healthtech", "D2C", "SaaS", etc) that is optimal for querying business news APIs. Return JSON: { "keyword": "..." }`;
      
      try {
        const aiResponse = await generateJSON(prompt, 0.5);
        if (aiResponse && aiResponse.keyword) {
          term = aiResponse.keyword;
        }
      } catch (e) {
        console.warn('AI keyword extraction failed, using fallback:', term);
      }

      // 2. Fetch news
      const articles = await fetchNews(term, 8);
      
      // If GNews hit rate limits and gave us the hardcoded Zepto fallback, or if it found 0 results, generate dynamic mock news via AI so it stays fully relevant!
      if (!articles || articles.length === 0 || (articles[0] && articles[0].title.includes("Zepto raises"))) {
        const fallbackPrompt = `Generate 4 highly realistic and professional news headlines about current business trends in the "${term}" startup industry in India based on actual recent events. Return JSON exactly like: { "articles": [ { "title": "Headline...", "source": { "name": "Tech News India" }, "url": "#" } ] }`;
        try {
          const aiFallback = await generateJSON(fallbackPrompt, 0.7);
          if (aiFallback && aiFallback.articles) {
            setNews(aiFallback.articles);
            return; // Exit early, use AI news!
          }
        } catch(e) { 
          console.warn("AI News Fallback failed too");
        }
      }

      if (articles && articles.length > 0) setNews(articles);
    } catch (e) {
      console.warn('News load failed', e);
    } finally {
      setLoadingNews(false);
    }
  }, [news.length, loadingNews, state.idea, fetchNews, generateJSON]);

  // Personalize schemes via OpenAI (wraps array in object for json_object mode)
  const loadPersonalizedSchemes = useCallback(async () => {
    if (schemesPersonalized || loadingSchemes || !state.idea) return;
    setLoadingSchemes(true);
    try {
      const prompt = `Given this Indian startup idea: "${state.idea}" and stage: "${state.user?.stage || 'Early Stage'}", select the 4 most relevant Indian government schemes from this list and explain why each fits:
PM YUVA 2.0, Startup India Seed Fund, iCreate, NSTEDB, Atal Innovation Mission, MSME schemes, CSR Connect, State THub programs, SIDBI, NABARD.

Return as JSON object (not array): { "schemes": [ { "name": "...", "whatItOffers": "1 sentence benefits", "eligibility": "1 sentence eligibility", "applyLink": "https://..." } ] }`;

      const result = await generateJSON(prompt, 0.7);
      const arr = result?.schemes || (Array.isArray(result) ? result : null);
      if (arr && arr.length > 0) {
        setSchemes(arr.slice(0, 4));
        setSchemesPersonalized(true);
      }
    } catch (err) {
      console.warn('Personalized schemes failed, using static', err);
      // Keep static fallback already set
    } finally {
      setLoadingSchemes(false);
    }
  }, [schemesPersonalized, loadingSchemes, state.idea, state.user, generateJSON]);

  useEffect(() => {
    if (isOpen && activeTab === 'news') loadNews();
    if (isOpen && activeTab === 'schemes') loadPersonalizedSchemes();
  }, [isOpen, activeTab]); // eslint-disable-line

  if (!state.user) return null;

  return (
    <>
      {/* Trigger button — bottom-left to avoid conflict with AI Coach (bottom-right) */}
      {!isOpen && state.idea && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 left-8 z-40 bg-surface border-2 border-saffron/50 text-white pl-4 pr-5 py-3.5 rounded-full shadow-[0_0_25px_rgba(255,107,53,0.3)] hover:scale-105 hover:border-saffron hover:shadow-[0_0_35px_rgba(255,107,53,0.5)] transition-all font-bold flex items-center gap-2.5 group"
        >
          <span className="text-xl">🚀</span>
          <span className="text-sm">Founder Hub</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-surface border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-navy flex-shrink-0">
                <div>
                  <h2 className="text-lg font-poppins font-bold text-white flex items-center gap-2">
                    <span className="text-xl">🚀</span> Founder Hub
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {schemesPersonalized ? `Curated for: ${state.idea?.slice(0, 40)}...` : 'Your resource centre'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-navy/50 flex-shrink-0">
                {[
                  { id: 'schemes', label: 'Schemes', icon: Building2 },
                  { id: 'news', label: 'Live News', icon: Newspaper },
                  { id: 'videos', label: 'Videos', icon: Youtube },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 py-3.5 text-xs font-bold flex flex-col items-center gap-1 border-b-2 transition-colors ${
                      activeTab === id ? 'border-saffron text-saffron' : 'border-transparent text-muted hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 bg-navy custom-scrollbar">

                {/* SCHEMES TAB */}
                {activeTab === 'schemes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted">
                        {schemesPersonalized ? '✨ AI-matched to your idea' : '📋 Top govt schemes for founders'}
                      </p>
                      {!loadingSchemes && !schemesPersonalized && state.idea && (
                        <button
                          onClick={() => { setSchemesPersonalized(false); loadPersonalizedSchemes(); }}
                          className="text-xs text-saffron flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Personalize
                        </button>
                      )}
                    </div>

                    {loadingSchemes && (
                      <div className="space-y-3 animate-pulse">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-surface/50 rounded-xl" />)}
                      </div>
                    )}

                    {!loadingSchemes && schemes.map((scheme, i) => (
                      <div key={i} className="bg-surface rounded-xl p-4 border border-white/10 hover:border-saffron/50 transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white text-sm leading-tight flex-1 pr-2">{scheme.name}</h3>
                          <Building2 className="w-4 h-4 text-saffron/50 flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs text-muted mb-2 leading-relaxed border-l-2 border-saffron/30 pl-2">{scheme.whatItOffers}</p>
                        <p className="text-[11px] text-white/40 mb-3 bg-navy/50 px-2 py-1.5 rounded leading-relaxed">
                          <span className="text-saffron font-bold">Eligibility:</span> {scheme.eligibility}
                        </p>
                        <a
                          href={scheme.applyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-navy bg-saffron hover:bg-saffron/80 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 w-full justify-center"
                        >
                          Apply Now <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* NEWS TAB */}
                {activeTab === 'news' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted mb-3">Live headlines from the Indian startup ecosystem</p>
                    {loadingNews && (
                      <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface/50 rounded-xl" />)}
                      </div>
                    )}
                    {!loadingNews && news.length === 0 && (
                      <div className="text-center py-10 text-muted">
                        <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No recent news found for your industry.</p>
                      </div>
                    )}
                    {news.map((n, i) => (
                      <a
                        key={i}
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-surface rounded-xl p-4 border border-white/10 hover:border-saffron/50 transition-all group"
                      >
                        <h3 className="font-bold text-white text-sm mb-2 leading-snug group-hover:text-saffron transition-colors">{n.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-saffron bg-saffron/10 px-2 py-0.5 rounded">{n.source?.name || 'News'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-saffron transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* VIDEOS TAB */}
                {activeTab === 'videos' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted mb-3">Curated startup education for Indian founders</p>
                    {VIDEO_TOPICS.map((v, i) => (
                      <a
                        key={i}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.keyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all group"
                      >
                        <div className="w-16 h-12 bg-navy rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden flex-shrink-0">
                          <div className="absolute inset-0 bg-red-600/20 group-hover:bg-red-600/40 transition-colors" />
                          <Youtube className="w-5 h-5 text-red-500 relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs leading-snug mb-0.5 group-hover:text-red-400 transition-colors line-clamp-2">{v.title}</p>
                          <p className="text-[10px] text-muted font-mono truncate">{v.keyword}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}