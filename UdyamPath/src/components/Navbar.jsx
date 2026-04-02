import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, LogOut, ChevronDown, BookOpen, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

import { logoutUser } from '../utils/firebase';

const LANG_OPTIONS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'te', label: 'తె', name: 'Telugu' },
  { code: 'ta', label: 'த', name: 'Tamil' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { state, updateState, resetState } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLang = LANG_OPTIONS.find(l => l.code === state.language) || LANG_OPTIONS[0];

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logoutUser(); // Actually sever the Firebase session!
    resetState();
    navigate('/');
  };

  const handleLangChange = (code) => {
    updateState({ language: code });
    setShowLangMenu(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-card border-b border-white/10 py-3' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Flame className="w-7 h-7 text-saffron group-hover:animate-pulse-slow" />
          <span className="text-xl font-poppins font-bold text-saffron tracking-tight">UdyamPath</span>
        </Link>

        <div className="flex items-center gap-3">

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(v => !v); setShowUserMenu(false); }}
              className="flex items-center gap-1.5 bg-surface/60 border border-white/20 hover:border-saffron/50 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-saffron" />
              {currentLang.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {LANG_OPTIONS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                        state.language === l.code ? 'bg-saffron/20 text-saffron font-bold' : 'text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="font-bold w-6">{l.label}</span>
                      <span className="text-xs text-muted">{l.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {state.user ? (
            <>
              {/* Dashboard Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 btn-ghost text-sm py-2 px-4"
              >
                <BookOpen className="w-4 h-4" /> Dashboard
              </button>

              {/* User Avatar + Logout Menu */}
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(v => !v); setShowLangMenu(false); }}
                  className="flex items-center gap-2 bg-saffron/10 border border-saffron/30 hover:border-saffron text-white px-3 py-2 rounded-lg transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center text-navy text-xs font-bold">
                    {state.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-xs font-bold hidden sm:block max-w-[80px] truncate">{state.user.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-bold text-sm">{state.user.name}</p>
                        <p className="text-muted text-xs">{state.idea?.slice(0, 40)}...</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-accentRed hover:bg-accentRed/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout & Reset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button onClick={() => navigate('/onboarding')} className="btn-primary text-sm py-2 px-4">
              Start Journey
            </button>
          )}

        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showLangMenu || showUserMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowLangMenu(false); setShowUserMenu(false); }} />
      )}
    </nav>
  );
}
